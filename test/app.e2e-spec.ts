import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { eq } from 'drizzle-orm';
import request from 'supertest';
import { App } from 'supertest/types';

process.env.DB_MEMORY = '1';
process.env.NODE_ENV = 'test';
delete process.env.TELEGRAM_BOT_TOKEN;

/* eslint-disable @typescript-eslint/no-require-imports */
const { AppModule } = require('../src/app.module');
const { DB, schema } = require('../src/db');
const { hashPassword } = require('../src/auth');
const { SmsService } = require('../src/notify/sms.service');
const { WEEKDAYS, clinicToday } = require('../src/schedule');
/* eslint-enable @typescript-eslint/no-require-imports */

const inDays = (n: number) => {
  const d = new Date(clinicToday() + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
};

describe('API (e2e)', () => {
  let app: INestApplication<App>;
  let db: any;
  const sms: { phone: string; text: string }[] = [];
  const http = () => request(app.getHttpServer());
  const auth = (token: string) => ({ Authorization: `Bearer ${token}` });
  const login = async (login: string, password = 'secret123') =>
    (await http().post('/auth').send({ login, password }).expect(201)).body
      .token as string;

  let admin: string,
    clinic: string,
    registrar: string,
    doctor: string,
    patient: string;
  let doctorId: number, patientId: number;
  const day = inDays(7);

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(SmsService)
      .useValue({
        enabled: true,
        send: (phone: string, text: string) => {
          sms.push({ phone, text });
          return Promise.resolve(true);
        },
      })
      .compile();
    app = moduleRef.createNestApplication();
    await app.init();
    db = app.get(DB);
    await db.insert(schema.users).values({
      role: 'admin',
      fullName: 'Admin',
      email: 'admin@darmon.test',
      password: hashPassword('secret123'),
    });
    admin = await login('admin@darmon.test');
  });

  afterAll(() => app.close());

  it('sets up a clinic with staff and a doctor', async () => {
    await http()
      .post('/admin/create-clinic')
      .set(auth(admin))
      .send({
        clinicName: 'Шифо',
        email: 'clinic@darmon.test',
        password: 'secret123',
        city: 'Душанбе',
      })
      .expect(201);
    clinic = await login('clinic@darmon.test');

    await http()
      .post('/clinic/registrars')
      .set(auth(clinic))
      .send({
        fullName: 'Регистратор',
        phone: '900000001',
        password: 'secret123',
      })
      .expect(201);
    registrar = await login('+992 900 00 00 01');

    const { body } = await http()
      .post('/clinic/create-doctor')
      .set(auth(clinic))
      .send({
        fullName: 'Духтур',
        email: 'doc@darmon.test',
        password: 'secret123',
        specialty: 'Терапевт',
        slotMinutes: 30,
      })
      .expect(201);
    doctorId = body.id;
    expect(body.clinicName).toBe('Шифо');
    doctor = await login('doc@darmon.test');

    await http()
      .patch(`/users/${doctorId}`)
      .set(auth(registrar))
      .send({
        workingSchedule: WEEKDAYS.map((d: string) => ({
          day: d,
          startTime: '09:00',
          endTime: '11:00',
        })),
        price: { current: 100, currency: 'сом.' },
      })
      .expect(200);
    // The doctor is not public until the diploma is verified
    await db
      .update(schema.users)
      .set({ diplomaVerified: true })
      .where(eq(schema.users.id, doctorId));
    const page = await http().get(`/clinics/${body.clinicId}`).expect(200);
    expect(page.body.doctors.map((d: any) => d.id)).toEqual([doctorId]);
  });

  it('requires consent and logs in by phone', async () => {
    await http()
      .post('/register')
      .send({ fullName: 'Бемор', phone: '931112233', password: 'secret123' })
      .expect(400);
    const { body } = await http()
      .post('/register')
      .send({
        fullName: 'Бемор',
        phone: '93 111 22 33',
        password: 'secret123',
        consent: true,
        role: 'admin',
      })
      .expect(201);
    expect(body.user.role).toBe('client');
    expect(body.user.phone).toBe('+992931112233');
    expect(body.user).not.toHaveProperty('password');
    patientId = body.user.id;
    patient = await login('931112233');
  });

  it('shows slots and prevents double booking', async () => {
    const slots = await http()
      .get(`/doctors/${doctorId}/slots`)
      .query({ date: day })
      .expect(200);
    expect(slots.body.slots.map((s: any) => s.time)).toEqual([
      '09:00',
      '09:30',
      '10:00',
      '10:30',
    ]);

    const visit = await http()
      .post('/appointments')
      .set(auth(patient))
      .send({
        doctorId,
        date: day,
        time: '09:30',
        symptoms: 'Сарам дард мекунад',
      })
      .expect(201);
    expect(visit.body).toMatchObject({
      status: 'pending',
      source: 'online',
      price: 100,
      durationMinutes: 30,
    });

    await http()
      .post('/appointments')
      .set(auth(patient))
      .send({ doctorId, date: day, time: '09:30' })
      .expect(409);
    await http()
      .post('/appointments')
      .set(auth(patient))
      .send({ doctorId, date: day, time: '12:00' })
      .expect(400);

    const after = await http()
      .get(`/doctors/${doctorId}/slots`)
      .query({ date: day })
      .expect(200);
    expect(after.body.slots.find((s: any) => s.time === '09:30').free).toBe(
      false,
    );
  });

  it('lets the front desk book by phone and the patient cancel', async () => {
    const phoneVisit = await http()
      .post('/appointments')
      .set(auth(registrar))
      .send({
        doctorId,
        date: day,
        time: '10:00',
        clientName: 'Занг зад',
        clientPhone: '918887766',
      })
      .expect(201);
    expect(phoneVisit.body).toMatchObject({
      status: 'approved',
      source: 'phone',
      clientId: null,
    });
    expect(sms.some((m) => m.phone === '+992918887766')).toBe(true);

    // Patients only see their own visits; the registrar sees the clinic's day
    const mine = await http()
      .get('/appointments')
      .set(auth(patient))
      .expect(200);
    expect(mine.body).toHaveLength(1);
    const desk = await http()
      .get('/appointments')
      .set(auth(registrar))
      .query({ date: day })
      .expect(200);
    expect(desk.body).toHaveLength(2);

    await http()
      .patch(`/appointments/${mine.body[0].id}`)
      .set(auth(patient))
      .send({ status: 'approved' })
      .expect(400);
    const cancelled = await http()
      .patch(`/appointments/${mine.body[0].id}`)
      .set(auth(patient))
      .send({ status: 'cancelled' })
      .expect(200);
    expect(cancelled.body.status).toBe('cancelled');

    // Someone else's visit is off limits
    await http()
      .patch(`/appointments/${phoneVisit.body.id}`)
      .set(auth(patient))
      .send({ status: 'cancelled' })
      .expect(403);
  });

  it('allows a review only after a completed visit', async () => {
    await http()
      .post(`/doctors/${doctorId}/comments`)
      .set(auth(patient))
      .send({ rating: 5, comment: 'Офарин' })
      .expect(403);

    const [visit] = await db
      .insert(schema.appointments)
      .values({
        doctorId,
        clientId: patientId,
        doctorName: 'Духтур',
        clientName: 'Бемор',
        date: inDays(-2),
        time: '09:00',
        status: 'completed',
        price: 100,
      })
      .returning();
    const { body } = await http()
      .post(`/doctors/${doctorId}/comments`)
      .set(auth(patient))
      .send({ rating: 4, comment: 'Хуб' })
      .expect(201);
    expect(body.rating).toBe(4);
    expect(body.comments[0].appointmentId).toBe(visit.id);
    // One review per visit
    await http()
      .post(`/doctors/${doctorId}/comments`)
      .set(auth(patient))
      .send({ rating: 5, comment: 'Боз' })
      .expect(403);

    const report = await http()
      .get('/clinic/report')
      .set(auth(clinic))
      .query({ from: inDays(-30), to: inDays(30) })
      .expect(200);
    expect(report.body.totals).toMatchObject({
      total: 3,
      completed: 1,
      cancelled: 1,
      revenue: 100,
    });
    const csv = await http()
      .get('/clinic/report.csv')
      .set(auth(clinic))
      .query({ from: inDays(-30), to: inDays(30) })
      .expect(200);
    expect(csv.text.split('\r\n')).toHaveLength(4);
    await http().get('/clinic/report').set(auth(registrar)).expect(403);
  });

  it('keeps medical records between the doctor and the patient, with an access log', async () => {
    const created = await http()
      .post('/medical-records')
      .set(auth(doctor))
      .send({ clientId: patientId, data: { diagnosis: 'ОРВИ' } })
      .expect(201);
    await http().get('/medical-records').set(auth(admin)).expect(403);
    await http()
      .get('/medical-records')
      .set(auth(doctor))
      .query({ clientId: patientId })
      .expect(200);

    const own = await http()
      .get('/medical-records')
      .set(auth(patient))
      .expect(200);
    expect(own.body[0].data.diagnosis).toBe('ОРВИ');
    const log = await http()
      .get('/users/me/access-log')
      .set(auth(patient))
      .expect(200);
    expect(log.body.map((e: any) => e.action).sort()).toEqual([
      'create',
      'view',
    ]);
    expect(created.body.clientName).toBe('Бемор');
  });

  it('resets a password with an SMS code', async () => {
    await http()
      .post('/auth/reset/request')
      .send({ login: '931112233' })
      .expect(201);
    const code = sms.at(-1)!.text.match(/\d{6}/)![0];
    await http()
      .post('/auth/reset/confirm')
      .send({
        login: '931112233',
        code: code === '000000' ? '111111' : '000000',
        password: 'newpass1',
      })
      .expect(400);
    await http()
      .post('/auth/reset/confirm')
      .send({ login: '931112233', code, password: 'newpass1' })
      .expect(201);
    await login('931112233', 'newpass1');
    // Unknown accounts get the same answer
    await http()
      .post('/auth/reset/request')
      .send({ login: 'nobody@darmon.test' })
      .expect(201);
  });

  it('sends each reminder once', async () => {
    const booking = app.get(require('../src/booking.service').BookingService); // eslint-disable-line
    const start = new Date(`${day}T10:00:00+05:00`).getTime();
    const before24h = new Date(start - 20 * 3600_000);
    sms.length = 0;
    expect(await booking.sendDueReminders(before24h)).toBe(1);
    expect(await booking.sendDueReminders(before24h)).toBe(0);
    expect(await booking.sendDueReminders(new Date(start - 30 * 60_000))).toBe(
      1,
    );
    expect(sms).toHaveLength(2);
  });
});
