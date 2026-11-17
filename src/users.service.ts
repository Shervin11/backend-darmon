import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import {
  and,
  asc,
  count,
  desc,
  eq,
  inArray,
  isNotNull,
  ne,
  or,
} from 'drizzle-orm';
import { randomBytes, randomInt } from 'crypto';
import { canManageDoctor, clinicOf, isFrontDesk, requireRole } from './access';
import { AuthUser, hashPassword, signToken, verifyPassword } from './auth';
import { categories } from './categories';
import { DB, type Database, schema } from './db';
import type { ScheduleEntry, TimeOff, User } from './db/schema';
import { verifyDiploma } from './diploma';
import { saveFile, storedFile } from './files';
import { containsProfanity } from './moderation';
import { NotifyService } from './notify/notify.service';
import { TelegramService } from './notify/telegram.service';
import { textsFor } from './notify/texts';
import { WEEKDAYS, isValidDate, isValidTime, toMinutes } from './schedule';
import { toContact, toUser } from './serialize';

const { users, reviews, favorites, appointments, holidays } = schema;

type Body = Record<string, any>;
type Scalar = string | number | null | undefined;

const LINK_CODE_TTL = 15 * 60 * 1000;
const RESET_CODE_TTL = 15 * 60 * 1000;
const MAX_RESET_ATTEMPTS = 5;

/** "+992 93 123-45-67", "931234567", "992931234567" → "+992931234567" (local 9-digit numbers get +992). */
export function normalizePhone(value: Scalar): string | null {
  const digits = String(value ?? '').replace(/\D/g, '');
  if (!digits) return null;
  if (digits.length === 9) return `+992${digits}`;
  if (digits.length < 9 || digits.length > 15)
    throw new BadRequestException('Invalid phone number');
  return `+${digits}`;
}

const normalizeEmail = (value: Scalar): string | null => {
  const email = String(value ?? '')
    .trim()
    .toLowerCase();
  if (!email) return null;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    throw new BadRequestException('Invalid email');
  return email;
};

function validatePassword(password: Scalar): string {
  const value = String(password ?? '');
  if (value.length < 6)
    throw new BadRequestException('Password must be at least 6 characters');
  return value;
}

function validateSchedule(value: Scalar): ScheduleEntry[] {
  if (!Array.isArray(value))
    throw new BadRequestException('workingSchedule must be a list');
  return value.map((s: Body) => {
    if (
      !WEEKDAYS.includes(s.day) ||
      !isValidTime(s.startTime) ||
      !isValidTime(s.endTime)
    ) {
      throw new BadRequestException('Invalid working schedule entry');
    }
    if (toMinutes(s.endTime) <= toMinutes(s.startTime))
      throw new BadRequestException('Schedule end must be after start');
    return { day: s.day, startTime: s.startTime, endTime: s.endTime };
  });
}

function validateTimeOff(value: Scalar): TimeOff[] {
  if (!Array.isArray(value))
    throw new BadRequestException('timeOff must be a list');
  return value.map((t: Body) => {
    if (!isValidDate(t.from) || !isValidDate(t.to) || t.to < t.from)
      throw new BadRequestException('Invalid time off range');
    return {
      from: t.from,
      to: t.to,
      reason: String(t.reason || '').slice(0, 200),
    };
  });
}

@Injectable()
export class UsersService {
  constructor(
    @Inject(DB) private readonly db: Database,
    private readonly notify: NotifyService,
    private readonly telegram: TelegramService,
  ) {}

  // ── Lookups ───────────────────────────────────
  async findUser(id: number | string): Promise<User> {
    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.id, Number(id)));
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async findDoctor(id: number | string): Promise<User> {
    const user = await this.findUser(id);
    if (user.role !== 'doctor') throw new NotFoundException('Doctor not found');
    return user;
  }

  private async findByLogin(login: Scalar): Promise<User | undefined> {
    const value = String(login ?? '').trim();
    if (!value) return undefined;
    const where = value.includes('@')
      ? eq(users.email, normalizeEmail(value)!)
      : eq(users.phone, normalizePhone(value)!);
    const [user] = await this.db.select().from(users).where(where);
    return user;
  }

  private async assertUnique(
    email: string | null,
    phone: string | null,
    exceptId = 0,
  ) {
    const conditions = [
      email && eq(users.email, email),
      phone && eq(users.phone, phone),
    ].filter(Boolean);
    if (!conditions.length) return;
    const [taken] = await this.db
      .select({ id: users.id, email: users.email })
      .from(users)
      .where(and(or(...(conditions as any[])), ne(users.id, exceptId)));
    if (taken)
      throw new ConflictException(
        taken.email === email ? 'Email already exists' : 'Phone already exists',
      );
  }

  /** Creates any account; email or phone is required as the login. */
  private async createUser(
    data: Partial<typeof users.$inferInsert> & { password: string },
  ): Promise<User> {
    const email = normalizeEmail(data.email);
    const phone = normalizePhone(data.phone);
    if (!email && !phone)
      throw new BadRequestException('Email or phone is required');
    if (!String(data.fullName ?? '').trim())
      throw new BadRequestException('Full name is required');
    await this.assertUnique(email, phone);
    const [user] = await this.db
      .insert(users)
      .values({
        ...data,
        role: data.role!,
        fullName: String(data.fullName).trim(),
        email,
        phone,
        password: hashPassword(validatePassword(data.password)),
      })
      .returning();
    return user;
  }

  // ── Auth ──────────────────────────────────────
  async register(body: Body) {
    if (body.consent !== true) {
      throw new BadRequestException(
        'Consent to the processing of personal data is required',
      );
    }
    // Self-registration always creates a patient; clinics, doctors and registrars are created by staff
    const user = await this.createUser({
      role: 'client',
      fullName: body.fullName,
      email: body.email,
      phone: body.phone,
      password: body.password,
      city: String(body.city || ''),
      lang: body.lang === 'ru' ? 'ru' : 'tj',
      consentAt: new Date(),
    });
    return { token: signToken(user), user: toUser(user) };
  }

  async login(body: Body) {
    const user = await this.findByLogin(body.login ?? body.email ?? body.phone);
    if (!user || !verifyPassword(String(body.password ?? ''), user.password)) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return { token: signToken(user), user: toUser(user) };
  }

  async me(auth: AuthUser) {
    return toUser(await this.findUser(auth.id));
  }

  /** Sends a 6-digit code over Telegram or SMS. The response never reveals whether the account exists. */
  async requestPasswordReset(body: Body) {
    const user = await this.findByLogin(body.login);
    const recentlySent =
      user?.resetExpires &&
      user.resetExpires.getTime() - RESET_CODE_TTL > Date.now() - 60_000;
    if (user && !recentlySent) {
      const code = String(randomInt(0, 1_000_000)).padStart(6, '0');
      await this.db
        .update(users)
        .set({
          resetCode: hashPassword(code),
          resetExpires: new Date(Date.now() + RESET_CODE_TTL),
          resetAttempts: 0,
        })
        .where(eq(users.id, user.id));
      await this.notify.send(user, (t) => t.resetCode(code), { sms: true });
    }
    return { sent: true };
  }

  async confirmPasswordReset(body: Body) {
    const user = await this.findByLogin(body.login);
    const valid =
      user?.resetCode &&
      user.resetExpires &&
      user.resetExpires > new Date() &&
      user.resetAttempts < MAX_RESET_ATTEMPTS &&
      verifyPassword(String(body.code ?? ''), user.resetCode);
    if (!user || !valid) {
      if (user?.resetCode) {
        await this.db
          .update(users)
          .set({ resetAttempts: user.resetAttempts + 1 })
          .where(eq(users.id, user.id));
      }
      throw new BadRequestException('Invalid or expired code');
    }
    await this.db
      .update(users)
      .set({
        password: hashPassword(validatePassword(body.password)),
        resetCode: null,
        resetExpires: null,
        resetAttempts: 0,
      })
      .where(eq(users.id, user.id));
    return { success: true };
  }

  // ── Users ─────────────────────────────────────
  getCategories() {
    return categories;
  }

  async getUsers(auth: AuthUser | null, role?: string) {
    // The doctor catalogue is public; the full user list is admin-only
    if (role !== 'doctor' && auth?.role !== 'admin')
      throw new ForbiddenException('Admin only');
    const rows = await this.db
      .select()
      .from(users)
      .where(role ? eq(users.role, role as User['role']) : undefined)
      .orderBy(asc(users.id));
    return rows.map((u) => toUser(u));
  }

  /** Doctor and clinic profiles are public (doctors with their reviews); patients only for signed-in users. */
  async getUser(auth: AuthUser | null, id: string) {
    const user = await this.findUser(id);
    if (user.role === 'doctor')
      return toUser(user, await this.reviewsOf(user.id));
    if (user.role === 'clinic') return toUser(user);
    if (!auth) throw new UnauthorizedException();
    return toContact(user);
  }

  async updateUser(auth: AuthUser, id: string, body: Body) {
    const user = await this.findUser(id);
    const isSelf = user.id === auth.id;
    const manages =
      user.role === 'doctor' && canManageDoctor(auth, user) && !isSelf;
    if (!isSelf && !manages && auth.role !== 'admin')
      throw new ForbiddenException();

    const update: Partial<typeof users.$inferInsert> = {};
    for (const key of [
      'fullName',
      'city',
      'address',
      'specialty',
      'bio',
    ] as const) {
      if (key in body) update[key] = String(body[key] ?? '').slice(0, 5000);
    }
    if ('email' in body) update.email = normalizeEmail(body.email);
    if ('phone' in body) update.phone = normalizePhone(body.phone);
    if ('email' in body || 'phone' in body) {
      if (!(update.email ?? user.email) && !(update.phone ?? user.phone)) {
        throw new BadRequestException('Email or phone is required');
      }
      await this.assertUnique(
        update.email ?? null,
        update.phone ?? null,
        user.id,
      );
    }
    if ('image' in body) update.image = storedFile(String(body.image ?? ''));
    if ('lang' in body) update.lang = body.lang === 'ru' ? 'ru' : 'tj';
    if ('experience' in body)
      update.experience = Math.max(0, Number(body.experience) || 0);
    if ('workingSchedule' in body)
      update.workingSchedule = validateSchedule(body.workingSchedule);
    if ('timeOff' in body) update.timeOff = validateTimeOff(body.timeOff);
    if ('slotMinutes' in body) {
      const minutes = Number(body.slotMinutes);
      if (!(minutes >= 10 && minutes <= 240))
        throw new BadRequestException('slotMinutes must be 10–240');
      update.slotMinutes = minutes;
    }
    // Clinic-controlled fields
    if (user.clinicId == null && 'clinic' in body)
      update.clinicName = String(body.clinic ?? '');
    if ('price' in body && (manages || auth.role === 'admin'))
      update.price = body.price;
    if (body.password && (isSelf || manages || auth.role === 'admin')) {
      update.password = hashPassword(validatePassword(body.password));
    }
    if (!Object.keys(update).length) return toUser(user);

    const [updated] = await this.db
      .update(users)
      .set(update)
      .where(eq(users.id, user.id))
      .returning();
    // Keep the author snapshot in this user's reviews in sync
    if (update.fullName !== undefined || update.image !== undefined) {
      await this.db
        .update(reviews)
        .set({ authorName: updated.fullName, authorImage: updated.image })
        .where(eq(reviews.userId, user.id));
    }
    return toUser(updated);
  }

  // ── Clinics & staff ───────────────────────────
  async createClinic(auth: AuthUser, body: Body) {
    requireRole(auth, 'admin');
    const clinic = await this.createUser({
      role: 'clinic',
      fullName: body.clinicName,
      clinicName: body.clinicName,
      email: body.email,
      phone: body.phone,
      password: body.password,
      city: String(body.city || ''),
      address: String(body.address || ''),
    });
    return toUser(clinic);
  }

  async getClinicsAdmin(auth: AuthUser) {
    requireRole(auth, 'admin');
    const rows = await this.db
      .select()
      .from(users)
      .where(eq(users.role, 'clinic'))
      .orderBy(asc(users.id));
    return rows.map((u) => toUser(u));
  }

  /** Public list of clinics with the number of verified doctors. */
  async listClinics() {
    const rows = await this.db
      .select()
      .from(users)
      .where(eq(users.role, 'clinic'))
      .orderBy(asc(users.fullName));
    const counts = await this.db
      .select({ clinicId: users.clinicId, n: count() })
      .from(users)
      .where(
        and(
          eq(users.role, 'doctor'),
          eq(users.diplomaVerified, true),
          isNotNull(users.clinicId),
        ),
      )
      .groupBy(users.clinicId);
    return rows.map((c) => ({
      ...toUser(c),
      doctorsCount: counts.find((x) => x.clinicId === c.id)?.n ?? 0,
    }));
  }

  async getClinicPage(id: string) {
    const clinic = await this.findUser(id);
    if (clinic.role !== 'clinic')
      throw new NotFoundException('Clinic not found');
    const doctors = await this.db
      .select()
      .from(users)
      .where(
        and(
          eq(users.role, 'doctor'),
          eq(users.clinicId, clinic.id),
          eq(users.diplomaVerified, true),
        ),
      )
      .orderBy(desc(users.rating));
    return { ...toUser(clinic), doctors: doctors.map((d) => toUser(d)) };
  }

  async createDoctor(auth: AuthUser, body: Body) {
    requireRole(auth, 'clinic');
    const clinic = await this.findUser(auth.id);
    const doctor = await this.createUser({
      role: 'doctor',
      fullName: body.fullName,
      email: body.email,
      phone: body.phone,
      password: body.password,
      specialty: String(body.specialty || ''),
      experience: Math.max(0, Number(body.experience) || 0),
      price: body.price || { current: 0, old: null, currency: 'сом.' },
      city: clinic.city,
      clinicId: clinic.id,
      clinicName: clinic.clinicName || clinic.fullName,
      bio: String(body.bio || ''),
      slotMinutes:
        Number(body.slotMinutes) >= 10 ? Number(body.slotMinutes) : 60,
    });
    return toUser(doctor);
  }

  async getClinicDoctors(auth: AuthUser) {
    const clinicId = isFrontDesk(auth) ? clinicOf(auth) : null;
    if (clinicId == null) throw new ForbiddenException('Clinic staff only');
    const rows = await this.db
      .select()
      .from(users)
      .where(and(eq(users.role, 'doctor'), eq(users.clinicId, clinicId)))
      .orderBy(asc(users.fullName));
    return rows.map((u) => toUser(u));
  }

  async createRegistrar(auth: AuthUser, body: Body) {
    requireRole(auth, 'clinic');
    const clinic = await this.findUser(auth.id);
    const registrar = await this.createUser({
      role: 'registrar',
      fullName: body.fullName,
      email: body.email,
      phone: body.phone,
      password: body.password,
      clinicId: clinic.id,
      clinicName: clinic.clinicName || clinic.fullName,
    });
    return toUser(registrar);
  }

  async getRegistrars(auth: AuthUser) {
    requireRole(auth, 'clinic');
    const rows = await this.db
      .select()
      .from(users)
      .where(and(eq(users.role, 'registrar'), eq(users.clinicId, auth.id)))
      .orderBy(asc(users.fullName));
    return rows.map((u) => toUser(u));
  }

  async deleteRegistrar(auth: AuthUser, id: string) {
    requireRole(auth, 'clinic');
    const registrar = await this.findUser(id);
    if (registrar.role !== 'registrar' || registrar.clinicId !== auth.id)
      throw new ForbiddenException();
    await this.db.delete(users).where(eq(users.id, registrar.id));
    return { success: true };
  }

  // ── Holidays ──────────────────────────────────
  getHolidays() {
    return this.db.select().from(holidays).orderBy(asc(holidays.date));
  }

  async setHolidays(auth: AuthUser, body: unknown) {
    requireRole(auth, 'admin');
    if (!Array.isArray(body))
      throw new BadRequestException('Expected a list of { date, name }');
    const rows = body.map((h: Body) => {
      if (!isValidDate(h.date))
        throw new BadRequestException(`Invalid date: ${h.date}`);
      return {
        date: h.date as string,
        name: String(h.name || '').slice(0, 100),
      };
    });
    await this.db.transaction(async (tx) => {
      await tx.delete(holidays);
      if (rows.length) await tx.insert(holidays).values(rows);
    });
    return this.getHolidays();
  }

  // ── Reviews (only after a completed visit) ────
  private reviewsOf(doctorId: number) {
    return this.db
      .select()
      .from(reviews)
      .where(eq(reviews.doctorId, doctorId))
      .orderBy(asc(reviews.createdAt));
  }

  private validateReview(body: Body) {
    const comment = String(body.comment || '')
      .trim()
      .slice(0, 2000);
    const rating = Math.round(Number(body.rating));
    if (!comment) throw new BadRequestException('Comment is required');
    if (!(rating >= 1 && rating <= 5))
      throw new BadRequestException('Rating must be 1–5');
    if (containsProfanity(comment))
      throw new BadRequestException(
        'Шарҳи шумо иборатҳои номақбул дорад ва блок карда шуд.',
      );
    return { comment, rating };
  }

  /** Stores the average rating and the share of 4–5★ reviews on the doctor; returns the doctor with reviews. */
  private async refreshRating(doctorId: number) {
    const list = await this.reviewsOf(doctorId);
    const rating = list.length
      ? Number(
          (list.reduce((s, r) => s + r.rating, 0) / list.length).toFixed(1),
        )
      : 0;
    const recommendation = list.length
      ? Math.round(
          (list.filter((r) => r.rating >= 4).length / list.length) * 100,
        )
      : 0;
    const [doctor] = await this.db
      .update(users)
      .set({ rating, recommendation })
      .where(eq(users.id, doctorId))
      .returning();
    return toUser(doctor, list);
  }

  /** Completed visits of this patient with the doctor that have no review yet. */
  async reviewableVisits(auth: AuthUser, doctorId: string) {
    if (auth.role !== 'client') return [];
    const visits = await this.db
      .select({
        id: appointments.id,
        date: appointments.date,
        time: appointments.time,
      })
      .from(appointments)
      .where(
        and(
          eq(appointments.clientId, auth.id),
          eq(appointments.doctorId, Number(doctorId)),
          eq(appointments.status, 'completed'),
        ),
      );
    const reviewed = new Set(
      (
        await this.db
          .select({ id: reviews.appointmentId })
          .from(reviews)
          .where(eq(reviews.userId, auth.id))
      ).map((r) => r.id),
    );
    return visits.filter((v) => !reviewed.has(v.id));
  }

  async addReview(auth: AuthUser, doctorId: string, body: Body) {
    const doctor = await this.findDoctor(doctorId);
    const visit = (await this.reviewableVisits(auth, doctorId))[0];
    if (!visit)
      throw new ForbiddenException(
        'You can review a doctor after a completed visit',
      );
    const author = await this.findUser(auth.id);
    await this.db.insert(reviews).values({
      doctorId: doctor.id,
      userId: author.id,
      appointmentId: visit.id,
      authorName: author.fullName,
      authorImage: author.image,
      ...this.validateReview(body),
    });
    return this.refreshRating(doctor.id);
  }

  private async findOwnReview(
    auth: AuthUser,
    doctorId: string,
    reviewId: string,
  ) {
    const [review] = await this.db
      .select()
      .from(reviews)
      .where(
        and(
          eq(reviews.id, Number(reviewId)),
          eq(reviews.doctorId, Number(doctorId)),
        ),
      );
    if (!review) throw new NotFoundException('Review not found');
    if (review.userId !== auth.id && auth.role !== 'admin')
      throw new ForbiddenException();
    return review;
  }

  async updateReview(
    auth: AuthUser,
    doctorId: string,
    reviewId: string,
    body: Body,
  ) {
    const review = await this.findOwnReview(auth, doctorId, reviewId);
    await this.db
      .update(reviews)
      .set({ ...this.validateReview(body), edited: true })
      .where(eq(reviews.id, review.id));
    return this.refreshRating(review.doctorId);
  }

  async deleteReview(auth: AuthUser, doctorId: string, reviewId: string) {
    const review = await this.findOwnReview(auth, doctorId, reviewId);
    await this.db.delete(reviews).where(eq(reviews.id, review.id));
    return this.refreshRating(review.doctorId);
  }

  // ── Favorites ─────────────────────────────────
  async getFavorites(auth: AuthUser) {
    const rows = await this.db
      .select({ doctor: users })
      .from(favorites)
      .innerJoin(users, eq(users.id, favorites.doctorId))
      .where(eq(favorites.userId, auth.id))
      .orderBy(asc(favorites.createdAt));
    return {
      favorites: rows.map(({ doctor }) => {
        const d = toUser(doctor);
        return {
          doctorId: d.id,
          name: d.fullName,
          specialty: d.specialty,
          photo: d.image,
        };
      }),
    };
  }

  async addFavorite(auth: AuthUser, doctorId: number) {
    const doctor = await this.findDoctor(doctorId);
    await this.db
      .insert(favorites)
      .values({ userId: auth.id, doctorId: doctor.id })
      .onConflictDoNothing();
    return this.getFavorites(auth);
  }

  async removeFavorite(auth: AuthUser, doctorId: string) {
    await this.db
      .delete(favorites)
      .where(
        and(
          eq(favorites.userId, auth.id),
          eq(favorites.doctorId, Number(doctorId)),
        ),
      );
    return this.getFavorites(auth);
  }

  // ── Telegram ──────────────────────────────────
  async startTelegramLink(auth: AuthUser) {
    if (!this.telegram.enabled || !this.telegram.botUsername) {
      throw new ServiceUnavailableException(
        'Telegram notifications are not configured',
      );
    }
    const code = randomBytes(16).toString('hex');
    await this.db
      .update(users)
      .set({
        telegramLinkCode: code,
        telegramLinkExpires: new Date(Date.now() + LINK_CODE_TTL),
      })
      .where(eq(users.id, auth.id));
    return { url: `https://t.me/${this.telegram.botUsername}?start=${code}` };
  }

  /** Handles "/start <code>" from the bot; returns the reply. */
  async linkTelegram(code: string, chatId: number): Promise<string> {
    const [user] = code
      ? await this.db
          .select()
          .from(users)
          .where(eq(users.telegramLinkCode, code))
      : [];
    if (
      !user ||
      !user.telegramLinkExpires ||
      user.telegramLinkExpires < new Date()
    )
      return textsFor('tj').linkHelp();
    await this.db.transaction(async (tx) => {
      // One chat belongs to one account
      await tx
        .update(users)
        .set({ telegramChatId: null })
        .where(eq(users.telegramChatId, chatId));
      await tx
        .update(users)
        .set({
          telegramChatId: chatId,
          telegramLinkCode: null,
          telegramLinkExpires: null,
        })
        .where(eq(users.id, user.id));
    });
    return textsFor(user.lang).linked(user.fullName);
  }

  async unlinkTelegram(auth: AuthUser) {
    const [user] = await this.db
      .update(users)
      .set({ telegramChatId: null })
      .where(eq(users.id, auth.id))
      .returning();
    return toUser(user);
  }

  // ── Diploma (verified by AI on the server, never set by the client) ──
  async uploadDiploma(auth: AuthUser, file?: Express.Multer.File) {
    requireRole(auth, 'doctor');
    if (!file || !/^image\/(png|jpe?g|webp)$/.test(file.mimetype)) {
      throw new BadRequestException(
        'Upload the diploma as a PNG, JPG or WEBP image',
      );
    }
    const verdict = await verifyDiploma(
      `data:${file.mimetype};base64,${file.buffer.toString('base64')}`,
    );
    if (!verdict.valid)
      throw new BadRequestException(
        verdict.reason || 'Документ отклонен: это не медицинский диплом.',
      );
    const [doctor] = await this.db
      .update(users)
      .set({
        diploma: saveFile(file.buffer, file.mimetype),
        diplomaVerified: true,
      })
      .where(eq(users.id, auth.id))
      .returning();
    return toUser(doctor);
  }

  /** Names for a set of ids (e.g. to label patients). */
  async contacts(ids: number[]) {
    if (!ids.length) return [];
    return (
      await this.db.select().from(users).where(inArray(users.id, ids))
    ).map(toContact);
  }
}
