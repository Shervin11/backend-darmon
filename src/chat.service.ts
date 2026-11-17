import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { and, asc, count, desc, eq, inArray, or } from 'drizzle-orm';
import type { AuthUser } from './auth';
import { BookingService } from './booking.service';
import { DB, type Database, schema } from './db';
import type { MedicalRecord, ProtocolData } from './db/schema';
import { saveDataUrl } from './files';
import { toContact, toMessage, toRecord } from './serialize';
import { UsersService } from './users.service';

const { messages, medicalRecords, accessLog, appointments, users } = schema;

type Body = Record<string, any>;

const PROTOCOL_FIELDS = [
  'complaints',
  'diagnosis',
  'treatment',
  'follow_up',
] as const;

function protocol(value: unknown): ProtocolData {
  const data: ProtocolData = {};
  for (const key of PROTOCOL_FIELDS) {
    const v = (value as Body)?.[key];
    if (v != null) data[key] = String(v).slice(0, 10000);
  }
  return data;
}

/** Messages between users, and medical records (with an access log). */
@Injectable()
export class ChatService {
  constructor(
    @Inject(DB) private readonly db: Database,
    private readonly users: UsersService,
    private readonly booking: BookingService,
  ) {}

  // ── Messages ──────────────────────────────────
  private between(a: number, b: number) {
    return or(
      and(eq(messages.senderId, a), eq(messages.receiverId, b)),
      and(eq(messages.senderId, b), eq(messages.receiverId, a)),
    );
  }

  async getMessages(auth: AuthUser, partnerId: string) {
    const rows = await this.db
      .select()
      .from(messages)
      .where(this.between(auth.id, Number(partnerId)))
      .orderBy(asc(messages.createdAt), asc(messages.id));
    return rows.map(toMessage);
  }

  async sendMessage(auth: AuthUser, body: Body) {
    const receiver = await this.users.findUser(body.receiverId);
    const text = String(body.text || '').slice(0, 5000);
    if (!text.trim() && !body.audioUrl)
      throw new BadRequestException('Message is empty');
    const audioUrl = body.audioUrl ? saveDataUrl(String(body.audioUrl)) : null;
    const [message] = await this.db
      .insert(messages)
      .values({ senderId: auth.id, receiverId: receiver.id, text, audioUrl })
      .returning();
    return toMessage(message);
  }

  private async findOwnMessage(auth: AuthUser, id: string) {
    const [message] = await this.db
      .select()
      .from(messages)
      .where(eq(messages.id, Number(id)));
    if (!message) throw new NotFoundException('Message not found');
    if (message.senderId !== auth.id) throw new ForbiddenException();
    return message;
  }

  async updateMessage(auth: AuthUser, id: string, text: string) {
    const message = await this.findOwnMessage(auth, id);
    const [saved] = await this.db
      .update(messages)
      .set({ text: String(text || '').slice(0, 5000), isEdited: true })
      .where(eq(messages.id, message.id))
      .returning();
    return toMessage(saved);
  }

  async deleteMessage(auth: AuthUser, id: string) {
    const message = await this.findOwnMessage(auth, id);
    await this.db.delete(messages).where(eq(messages.id, message.id));
    return toMessage(message);
  }

  async clearChat(auth: AuthUser, partnerId: string) {
    await this.db
      .delete(messages)
      .where(this.between(auth.id, Number(partnerId)));
    return { success: true };
  }

  async markRead(auth: AuthUser, partnerId: number) {
    await this.db
      .update(messages)
      .set({ isRead: true })
      .where(
        and(
          eq(messages.senderId, Number(partnerId)),
          eq(messages.receiverId, auth.id),
        ),
      );
    return { success: true };
  }

  /** Everyone the user has written to or has a visit with, with unread counts. */
  async getChatPartners(auth: AuthUser) {
    const sent = await this.db
      .selectDistinct({ id: messages.receiverId })
      .from(messages)
      .where(eq(messages.senderId, auth.id));
    const received = await this.db
      .selectDistinct({ id: messages.senderId })
      .from(messages)
      .where(eq(messages.receiverId, auth.id));
    const ids = [
      ...new Set([
        ...sent.map((r) => r.id),
        ...received.map((r) => r.id),
        ...(await this.booking.visitPartnerIds(auth)),
      ]),
    ];
    if (!ids.length) return [];
    const partners = await this.db
      .select()
      .from(users)
      .where(inArray(users.id, ids));
    const unread = await this.db
      .select({ id: messages.senderId, n: count() })
      .from(messages)
      .where(and(eq(messages.receiverId, auth.id), eq(messages.isRead, false)))
      .groupBy(messages.senderId);
    return partners.map((u) => ({
      ...toContact(u),
      unreadCount: unread.find((r) => r.id === u.id)?.n ?? 0,
    }));
  }

  // ── Medical records ───────────────────────────
  private log(
    auth: AuthUser,
    action: string,
    record: Pick<MedicalRecord, 'id' | 'clientId'> | null,
    patientId?: number,
  ) {
    return this.db.insert(accessLog).values({
      userId: auth.id,
      action,
      targetType: 'medical_record',
      targetId: record?.id ?? null,
      patientId: record?.clientId ?? patientId ?? null,
    });
  }

  /** A doctor may work with a patient's card only if the patient booked them. */
  private async isPatientOf(doctorId: number, clientId: number) {
    const [visit] = await this.db
      .select({ id: appointments.id })
      .from(appointments)
      .where(
        and(
          eq(appointments.doctorId, doctorId),
          eq(appointments.clientId, clientId),
        ),
      )
      .limit(1);
    return !!visit;
  }

  private async withNames(rows: MedicalRecord[]) {
    const contacts = await this.users.contacts([
      ...new Set(rows.map((r) => r.clientId)),
    ]);
    return rows.map((r) =>
      toRecord(r, contacts.find((c) => c.id === r.clientId)?.fullName),
    );
  }

  /**
   * Patients see their own card. Doctors see records they wrote, or with ?clientId the whole card
   * of one of their patients (every view is logged).
   */
  async getMedicalRecords(auth: AuthUser, clientId?: string) {
    if (auth.role === 'client') {
      const rows = await this.db
        .select()
        .from(medicalRecords)
        .where(eq(medicalRecords.clientId, auth.id))
        .orderBy(desc(medicalRecords.createdAt));
      return this.withNames(rows);
    }
    if (auth.role !== 'doctor')
      throw new ForbiddenException(
        'Medical records are visible to doctors and patients only',
      );

    if (clientId) {
      const patientId = Number(clientId);
      if (!(await this.isPatientOf(auth.id, patientId)))
        throw new ForbiddenException('Not your patient');
      const rows = await this.db
        .select()
        .from(medicalRecords)
        .where(eq(medicalRecords.clientId, patientId))
        .orderBy(desc(medicalRecords.createdAt));
      await this.log(auth, 'view', null, patientId);
      return this.withNames(rows);
    }
    const rows = await this.db
      .select()
      .from(medicalRecords)
      .where(eq(medicalRecords.doctorId, auth.id))
      .orderBy(desc(medicalRecords.createdAt));
    return this.withNames(rows);
  }

  async createMedicalRecord(auth: AuthUser, body: Body) {
    if (auth.role !== 'doctor') throw new ForbiddenException('Doctor only');
    const doctor = await this.users.findUser(auth.id);
    const client = await this.users.findUser(body.clientId);
    if (
      client.role !== 'client' ||
      !(await this.isPatientOf(doctor.id, client.id))
    ) {
      throw new ForbiddenException('Not your patient');
    }
    const [record] = await this.db
      .insert(medicalRecords)
      .values({
        doctorId: doctor.id,
        clientId: client.id,
        doctorName: doctor.fullName,
        data: protocol(body.data),
        transcript: String(body.transcript || '').slice(0, 100000),
      })
      .returning();
    await this.log(auth, 'create', record);
    return toRecord(record, client.fullName);
  }

  private async findOwnRecord(auth: AuthUser, id: string) {
    const [record] = await this.db
      .select()
      .from(medicalRecords)
      .where(eq(medicalRecords.id, Number(id)));
    if (!record) throw new NotFoundException('Medical record not found');
    if (record.doctorId !== auth.id) throw new ForbiddenException();
    return record;
  }

  async updateMedicalRecord(auth: AuthUser, id: string, body: Body) {
    const record = await this.findOwnRecord(auth, id);
    const update: Partial<MedicalRecord> = { updatedAt: new Date() };
    if ('data' in body) update.data = protocol(body.data);
    if ('transcript' in body)
      update.transcript = String(body.transcript || '').slice(0, 100000);
    const [saved] = await this.db
      .update(medicalRecords)
      .set(update)
      .where(eq(medicalRecords.id, record.id))
      .returning();
    await this.log(auth, 'update', saved);
    return toRecord(saved);
  }

  async deleteMedicalRecord(auth: AuthUser, id: string) {
    const record = await this.findOwnRecord(auth, id);
    await this.db
      .delete(medicalRecords)
      .where(eq(medicalRecords.id, record.id));
    await this.log(auth, 'delete', record);
    return toRecord(record);
  }

  /** Who opened or changed the patient's card. */
  async getAccessLog(auth: AuthUser) {
    const rows = await this.db
      .select({
        id: accessLog.id,
        action: accessLog.action,
        targetId: accessLog.targetId,
        createdAt: accessLog.createdAt,
        userId: accessLog.userId,
        fullName: users.fullName,
        role: users.role,
      })
      .from(accessLog)
      .leftJoin(users, eq(users.id, accessLog.userId))
      .where(eq(accessLog.patientId, auth.id))
      .orderBy(desc(accessLog.createdAt))
      .limit(200);
    return rows.map((r) => ({
      ...r,
      fullName: r.fullName ?? '',
      createdAt: r.createdAt.toISOString(),
    }));
  }
}
