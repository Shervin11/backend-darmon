import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { and, asc, eq, gte, inArray, lte, ne, or, type SQL } from 'drizzle-orm';
import { canManageDoctor, clinicOf, isFrontDesk, requireRole } from './access';
import type { AuthUser } from './auth';
import { DB, type Database, schema } from './db';
import type { Appointment, AppointmentStatus, User } from './db/schema';
import { NotifyService } from './notify/notify.service';
import {
  BUSY_STATUSES,
  appointmentStart,
  clinicToday,
  dayOffReason,
  daySlots,
  fitsSchedule,
  isValidDate,
  isValidTime,
  overlaps,
  slotLength,
} from './schedule';
import { toAppointment } from './serialize';
import { UsersService, normalizePhone } from './users.service';

const { appointments, users, holidays } = schema;

type Body = Record<string, any>;

export const SLOT_TAKEN = 'Ин вақт аллақачон банд аст';
const DAY_OFF = 'Духтур дар ин рӯз кор намекунад';
const OUTSIDE_HOURS = 'Ин вақт берун аз ҷадвали кории духтур аст';

const HOUR = 60 * 60 * 1000;

/** Allowed status changes by doctors and the clinic front desk. */
const STAFF_TRANSITIONS: Partial<
  Record<AppointmentStatus, AppointmentStatus[]>
> = {
  pending: ['approved', 'rejected'],
  approved: ['completed', 'no_show', 'cancelled'],
  completed: ['no_show'],
  no_show: ['completed'],
};

const csvCell = (value: string | number | null) => {
  const s = String(value ?? '');
  return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

@Injectable()
export class BookingService {
  constructor(
    @Inject(DB) private readonly db: Database,
    private readonly users: UsersService,
    private readonly notify: NotifyService,
  ) {}

  // ── Availability ──────────────────────────────
  private async holidaySet(): Promise<Set<string>> {
    return new Set(
      (await this.db.select({ date: holidays.date }).from(holidays)).map(
        (h) => h.date,
      ),
    );
  }

  private bookedOn(doctorId: number, date: string, exceptId = 0) {
    return this.db
      .select({
        time: appointments.time,
        durationMinutes: appointments.durationMinutes,
      })
      .from(appointments)
      .where(
        and(
          eq(appointments.doctorId, doctorId),
          eq(appointments.date, date),
          inArray(appointments.status, BUSY_STATUSES as AppointmentStatus[]),
          ne(appointments.id, exceptId),
        ),
      );
  }

  /** Public: start times of a doctor's day with availability, or why the day is closed. */
  async getSlots(doctorId: string, date: string) {
    if (!isValidDate(date))
      throw new BadRequestException('date must be YYYY-MM-DD');
    const doctor = await this.users.findDoctor(doctorId);
    const closed = dayOffReason(doctor, date, await this.holidaySet());
    if (closed)
      return { date, slotMinutes: slotLength(doctor), closed, slots: [] };
    const slots = daySlots(doctor, date, await this.bookedOn(doctor.id, date));
    return { date, slotMinutes: slotLength(doctor), closed: null, slots };
  }

  /** Validates that the doctor can see a patient at date/time; throws a user-facing error otherwise. */
  private async assertBookable(
    doctor: User,
    date: string,
    time: string,
    duration: number,
    exceptId = 0,
  ) {
    if (!isValidDate(date) || !isValidTime(time))
      throw new BadRequestException('Invalid date or time');
    if (appointmentStart(date, time) <= new Date())
      throw new BadRequestException('Вақти гузашта');
    if (dayOffReason(doctor, date, await this.holidaySet()))
      throw new BadRequestException(DAY_OFF);
    if (!fitsSchedule(doctor, date, time, duration))
      throw new BadRequestException(OUTSIDE_HOURS);
    if (
      overlaps(time, duration, await this.bookedOn(doctor.id, date, exceptId))
    )
      throw new ConflictException(SLOT_TAKEN);
  }

  // ── Listing ───────────────────────────────────
  /**
   * Patients and doctors see their own visits, clinic staff see the clinic's doctors, the admin sees all.
   * Filters: status, doctorId, date, from, to.
   */
  async getAppointments(auth: AuthUser, query: Body = {}) {
    const conditions: (SQL | undefined)[] = [];
    if (auth.role === 'client')
      conditions.push(eq(appointments.clientId, auth.id));
    else if (auth.role === 'doctor')
      conditions.push(eq(appointments.doctorId, auth.id));
    else if (isFrontDesk(auth)) {
      const doctorIds = await this.clinicDoctorIds(clinicOf(auth)!);
      if (!doctorIds.length) return [];
      conditions.push(inArray(appointments.doctorId, doctorIds));
    } else if (auth.role !== 'admin') throw new ForbiddenException();

    if (query.status) conditions.push(eq(appointments.status, query.status));
    if (query.doctorId)
      conditions.push(eq(appointments.doctorId, Number(query.doctorId)));
    if (query.date) conditions.push(eq(appointments.date, String(query.date)));
    if (query.from) conditions.push(gte(appointments.date, String(query.from)));
    if (query.to) conditions.push(lte(appointments.date, String(query.to)));

    const rows = await this.db
      .select()
      .from(appointments)
      .where(and(...conditions))
      .orderBy(asc(appointments.date), asc(appointments.time));
    return rows.map(toAppointment);
  }

  private async clinicDoctorIds(clinicId: number) {
    const rows = await this.db
      .select({ id: users.id })
      .from(users)
      .where(and(eq(users.role, 'doctor'), eq(users.clinicId, clinicId)));
    return rows.map((r) => r.id);
  }

  private async findAppointment(id: string | number): Promise<Appointment> {
    const [a] = await this.db
      .select()
      .from(appointments)
      .where(eq(appointments.id, Number(id)));
    if (!a) throw new NotFoundException('Appointment not found');
    return a;
  }

  // ── Booking ───────────────────────────────────
  /**
   * Patients book online (pending until the doctor approves).
   * Clinic staff and doctors book patients who called or came in (approved right away);
   * such a patient is linked to an existing account by phone when there is one.
   */
  async createAppointment(auth: AuthUser, body: Body) {
    if (!body.doctorId || !body.date || !body.time)
      throw new BadRequestException('doctorId, date and time are required');
    const doctor = await this.users.findDoctor(body.doctorId);
    const duration = slotLength(doctor);
    const date = String(body.date);
    const time = String(body.time);
    const symptoms = String(body.symptoms || '').slice(0, 2000);
    const price = Number(doctor.price?.current) || 0;

    let values: typeof appointments.$inferInsert;
    if (auth.role === 'client') {
      const client = await this.users.findUser(auth.id);
      values = {
        doctorId: doctor.id,
        clientId: client.id,
        clientName: client.fullName,
        clientPhone: client.phone ?? '',
        doctorName: doctor.fullName,
        specialty: doctor.specialty ?? '',
        date,
        time,
        durationMinutes: duration,
        symptoms,
        price,
        source: 'online',
        status: 'pending',
        createdBy: auth.id,
      };
    } else {
      if (!canManageDoctor(auth, doctor) || auth.role === 'admin') {
        throw new ForbiddenException(
          'Only the clinic staff or the doctor can book on behalf of a patient',
        );
      }
      const clientName = String(body.clientName || '').trim();
      const clientPhone = normalizePhone(body.clientPhone);
      if (!clientName || !clientPhone)
        throw new BadRequestException(
          'clientName and clientPhone are required',
        );
      const [account] = await this.db
        .select({ id: users.id })
        .from(users)
        .where(and(eq(users.phone, clientPhone), eq(users.role, 'client')));
      values = {
        doctorId: doctor.id,
        clientId: account?.id ?? null,
        clientName,
        clientPhone,
        doctorName: doctor.fullName,
        specialty: doctor.specialty ?? '',
        date,
        time,
        durationMinutes: duration,
        symptoms,
        price,
        source: body.source === 'walkin' ? 'walkin' : 'phone',
        status: 'approved',
        createdBy: auth.id,
      };
    }

    await this.assertBookable(doctor, date, time, duration);
    const [created] = await this.db
      .insert(appointments)
      .values(values)
      .returning();
    if (created.status === 'pending')
      await this.notify.visit(created, 'doctor', (t) => t.newRequest(created));
    else
      await this.notify.visit(created, 'patient', (t) => t.approved(created));
    return toAppointment(created);
  }

  // ── Changes ───────────────────────────────────
  /**
   * PATCH /appointments/:id
   *  - { status } — status change (staff: approve/reject/complete/no-show/cancel; patient: cancel)
   *  - { date, time } — reschedule (patient: back to "pending"; staff: stays approved)
   *  - { paid, price } — payment mark (staff)
   */
  async updateAppointment(auth: AuthUser, id: string, body: Body) {
    const appointment = await this.findAppointment(id);
    const doctor = await this.users.findDoctor(appointment.doctorId);
    const isPatient =
      auth.role === 'client' && appointment.clientId === auth.id;
    const isStaff = canManageDoctor(auth, doctor);
    if (!isPatient && !isStaff) throw new ForbiddenException();

    if (body.date !== undefined || body.time !== undefined)
      return this.reschedule(appointment, doctor, isStaff, body);
    if (body.status !== undefined)
      return this.changeStatus(appointment, isStaff, body);
    if (body.paid !== undefined || body.price !== undefined) {
      if (!isStaff) throw new ForbiddenException();
      const update: Partial<Appointment> = {};
      if (body.paid !== undefined) update.paid = body.paid === true;
      if (body.price !== undefined)
        update.price = Math.max(0, Number(body.price) || 0);
      return this.save(appointment.id, update);
    }
    throw new BadRequestException('Nothing to update');
  }

  private async save(id: number, update: Partial<Appointment>) {
    const [saved] = await this.db
      .update(appointments)
      .set(update)
      .where(eq(appointments.id, id))
      .returning();
    return toAppointment(saved);
  }

  private async changeStatus(
    appointment: Appointment,
    isStaff: boolean,
    body: Body,
  ) {
    const status = body.status as AppointmentStatus;
    const reason = String(body.rejectReason || body.reason || '').slice(0, 500);

    if (!isStaff) {
      // A patient can only cancel an upcoming visit
      if (
        status !== 'cancelled' ||
        !['pending', 'approved'].includes(appointment.status)
      ) {
        throw new BadRequestException('You can only cancel an upcoming visit');
      }
      if (appointmentStart(appointment.date, appointment.time) <= new Date()) {
        throw new BadRequestException('The visit has already started');
      }
      const saved = await this.save(appointment.id, {
        status,
        rejectReason: reason,
      });
      await this.notify.visit(appointment, 'doctor', (t) =>
        t.cancelledByPatient(appointment),
      );
      return saved;
    }

    if (!STAFF_TRANSITIONS[appointment.status]?.includes(status)) {
      throw new BadRequestException(
        `Cannot change status from "${appointment.status}" to "${status}"`,
      );
    }
    if (status === 'approved') {
      const approved = await this.db
        .select()
        .from(appointments)
        .where(
          and(
            eq(appointments.doctorId, appointment.doctorId),
            eq(appointments.date, appointment.date),
            ne(appointments.id, appointment.id),
            inArray(appointments.status, ['approved', 'completed', 'no_show']),
          ),
        );
      if (overlaps(appointment.time, appointment.durationMinutes, approved))
        throw new ConflictException(SLOT_TAKEN);
      const saved = await this.save(appointment.id, { status });
      await this.notify.visit(appointment, 'patient', (t) =>
        t.approved(appointment),
      );
      await this.rejectOverlappingPending(appointment);
      return saved;
    }
    if (
      ['completed', 'no_show'].includes(status) &&
      appointmentStart(appointment.date, appointment.time) > new Date()
    ) {
      throw new BadRequestException('The visit has not started yet');
    }
    const saved = await this.save(appointment.id, {
      status,
      rejectReason: reason,
    });
    if (status === 'rejected' || status === 'cancelled') {
      const visit = { ...appointment, rejectReason: reason };
      await this.notify.visit(visit, 'patient', (t) => t.rejected(visit));
    }
    return saved;
  }

  /** Approving a visit declines other pending requests that overlap it. */
  private async rejectOverlappingPending(approved: Appointment) {
    const pending = await this.db
      .select()
      .from(appointments)
      .where(
        and(
          eq(appointments.doctorId, approved.doctorId),
          eq(appointments.date, approved.date),
          eq(appointments.status, 'pending'),
          ne(appointments.id, approved.id),
        ),
      );
    for (const other of pending.filter((p) =>
      overlaps(p.time, p.durationMinutes, [approved]),
    )) {
      await this.db
        .update(appointments)
        .set({ status: 'rejected', rejectReason: SLOT_TAKEN })
        .where(eq(appointments.id, other.id));
      const visit = { ...other, rejectReason: SLOT_TAKEN };
      await this.notify.visit(visit, 'patient', (t) => t.rejected(visit));
    }
  }

  private async reschedule(
    appointment: Appointment,
    doctor: User,
    isStaff: boolean,
    body: Body,
  ) {
    if (!['pending', 'approved'].includes(appointment.status)) {
      throw new BadRequestException('Only upcoming visits can be rescheduled');
    }
    const date = String(body.date ?? appointment.date);
    const time = String(body.time ?? appointment.time);
    await this.assertBookable(
      doctor,
      date,
      time,
      appointment.durationMinutes,
      appointment.id,
    );
    // A patient's change needs the doctor's approval again
    const status: AppointmentStatus = isStaff ? appointment.status : 'pending';
    const [saved] = await this.db
      .update(appointments)
      .set({ date, time, status, remindersSent: [] })
      .where(eq(appointments.id, appointment.id))
      .returning();
    await this.notify.visit(saved, isStaff ? 'patient' : 'doctor', (t) =>
      t.rescheduled(saved),
    );
    return toAppointment(saved);
  }

  // ── Clinic reports ────────────────────────────
  private async reportRows(auth: AuthUser, query: Body) {
    requireRole(auth, 'clinic', 'admin');
    const from = isValidDate(query.from)
      ? query.from
      : clinicToday().slice(0, 8) + '01';
    const to = isValidDate(query.to) ? query.to : clinicToday();
    const conditions: (SQL | undefined)[] = [
      gte(appointments.date, from),
      lte(appointments.date, to),
    ];
    if (auth.role === 'clinic') {
      const ids = await this.clinicDoctorIds(auth.id);
      if (!ids.length) return { from, to, rows: [] as Appointment[] };
      conditions.push(inArray(appointments.doctorId, ids));
    }
    const rows = await this.db
      .select()
      .from(appointments)
      .where(and(...conditions))
      .orderBy(asc(appointments.date), asc(appointments.time));
    return { from, to, rows };
  }

  /** Per-doctor totals for a period (default: current month). */
  async getReport(auth: AuthUser, query: Body = {}) {
    const { from, to, rows } = await this.reportRows(auth, query);
    const byDoctor = new Map<number, Record<string, any>>();
    for (const a of rows) {
      const d =
        byDoctor.get(a.doctorId) ??
        byDoctor
          .set(a.doctorId, {
            doctorId: a.doctorId,
            doctorName: a.doctorName,
            total: 0,
            pending: 0,
            approved: 0,
            completed: 0,
            no_show: 0,
            cancelled: 0,
            rejected: 0,
            online: 0,
            phone: 0,
            walkin: 0,
            revenue: 0,
            paidRevenue: 0,
          })
          .get(a.doctorId)!;
      d.total++;
      d[a.status]++;
      d[a.source]++;
      if (a.status === 'completed') {
        d.revenue += a.price;
        if (a.paid) d.paidRevenue += a.price;
      }
    }
    const doctors = [...byDoctor.values()].map((d) => ({
      ...d,
      noShowRate:
        d.completed + d.no_show
          ? Math.round((d.no_show / (d.completed + d.no_show)) * 100)
          : 0,
    }));
    const sum = (key: string) => doctors.reduce((s, d) => s + d[key], 0);
    return {
      from,
      to,
      doctors,
      totals: {
        total: sum('total'),
        completed: sum('completed'),
        no_show: sum('no_show'),
        cancelled: sum('cancelled'),
        revenue: sum('revenue'),
        paidRevenue: sum('paidRevenue'),
      },
    };
  }

  /** All visits of the period as CSV (opens in Excel). */
  async getReportCsv(auth: AuthUser, query: Body = {}) {
    const { rows } = await this.reportRows(auth, query);
    const header = [
      'id',
      'date',
      'time',
      'doctor',
      'specialty',
      'patient',
      'phone',
      'status',
      'source',
      'price',
      'paid',
    ];
    const lines = rows.map((a) =>
      [
        a.id,
        a.date,
        a.time,
        a.doctorName,
        a.specialty,
        a.clientName,
        a.clientPhone,
        a.status,
        a.source,
        a.price,
        a.paid ? 'yes' : 'no',
      ]
        .map(csvCell)
        .join(','),
    );
    // BOM so Excel detects UTF-8 (Cyrillic names)
    return '﻿' + [header.join(','), ...lines].join('\r\n');
  }

  // ── Reminders ─────────────────────────────────
  /** Sends the 24-hour and 1-hour reminders for approved visits; each one only once. */
  async sendDueReminders(now = new Date()) {
    const today = clinicToday(now);
    const dayAfter = clinicToday(new Date(now.getTime() + 48 * HOUR));
    const upcoming = await this.db
      .select()
      .from(appointments)
      .where(
        and(
          eq(appointments.status, 'approved'),
          gte(appointments.date, today),
          lte(appointments.date, dayAfter),
        ),
      );
    let sent = 0;
    for (const a of upcoming) {
      const left = appointmentStart(a.date, a.time).getTime() - now.getTime();
      if (left <= 0) continue;
      if (left <= HOUR && !a.remindersSent.includes('1h')) {
        await this.markReminded(a, ['24h', '1h']);
        await this.notify.visit(a, 'patient', (t) => t.reminder1hPatient(a));
        await this.notify.visit(a, 'doctor', (t) => t.reminder1hDoctor(a));
        sent++;
      } else if (
        left > HOUR &&
        left <= 24 * HOUR &&
        !a.remindersSent.includes('24h')
      ) {
        await this.markReminded(a, ['24h']);
        await this.notify.visit(a, 'patient', (t) => t.reminder24(a));
        sent++;
      }
    }
    return sent;
  }

  private markReminded(a: Appointment, keys: string[]) {
    const remindersSent = [...new Set([...a.remindersSent, ...keys])];
    return this.db
      .update(appointments)
      .set({ remindersSent })
      .where(eq(appointments.id, a.id));
  }

  /** People this user has visits with (used for the chat partner list). */
  async visitPartnerIds(auth: AuthUser): Promise<number[]> {
    const rows = await this.db
      .select({
        doctorId: appointments.doctorId,
        clientId: appointments.clientId,
      })
      .from(appointments)
      .where(
        or(
          eq(appointments.clientId, auth.id),
          eq(appointments.doctorId, auth.id),
        ),
      );
    const ids = rows.map((r) =>
      r.doctorId === auth.id ? r.clientId : r.doctorId,
    );
    return [...new Set(ids.filter((id): id is number => id != null))];
  }
}
