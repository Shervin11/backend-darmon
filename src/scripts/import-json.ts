/**
 * One-time migration of the old db.json into PostgreSQL (or PGlite when DATABASE_URL is unset).
 *   npm run db:import -- [path/to/db.json]
 * Keeps ids, moves inline data: URLs to UPLOAD_DIR and refuses to run on a non-empty database.
 */
import '../env';
import * as fs from 'fs';
import { sql } from 'drizzle-orm';
import { hashPassword, isHashed } from '../auth';
import { createDatabase, schema } from '../db';
import type { AppointmentStatus, Role } from '../db/schema';
import { saveDataUrl } from '../files';

type Rec = Record<string, any>;
type Scalar = string | number | null | undefined;

const phoneOf = (value: Scalar) => {
  const digits = String(value ?? '').replace(/\D/g, '');
  if (!digits) return null;
  return digits.length === 9 ? `+992${digits}` : `+${digits}`;
};
const dateOf = (value: Scalar) =>
  value && !isNaN(Date.parse(String(value)))
    ? new Date(String(value))
    : new Date();
const file = (value: Scalar) => saveDataUrl(String(value ?? '')) ?? '';

async function main() {
  const source = process.argv[2] || 'db.json';
  const data: Rec = JSON.parse(fs.readFileSync(source, 'utf8'));
  const { db, close } = await createDatabase();
  try {
    const [{ n }] = await db
      .select({ n: sql<number>`count(*)::int` })
      .from(schema.users);
    if (n > 0)
      throw new Error(
        'The database already has users — import only into an empty database',
      );

    const users: Rec[] = data.users ?? [];
    const byName = new Map(users.map((u) => [u.fullName, u.id]));

    await db.transaction(async (tx) => {
      for (const u of users) {
        await tx.insert(schema.users).values({
          id: u.id,
          role: u.role as Role,
          fullName: String(u.fullName || u.clinicName || `User ${u.id}`),
          email: u.email ? String(u.email).trim().toLowerCase() : null,
          phone: phoneOf(u.phone),
          password: isHashed(String(u.password ?? ''))
            ? u.password
            : hashPassword(String(u.password ?? '')),
          image: file(u.image || u.photo),
          city: String(u.city || ''),
          address: String(u.address || ''),
          clinicId: u.clinicId ?? null,
          clinicName: u.clinicName || u.clinic || null,
          specialty: u.specialty ?? null,
          experience: u.experience != null ? Number(u.experience) || 0 : null,
          bio: u.bio ?? null,
          price: u.price ?? null,
          workingSchedule: u.workingSchedule ?? [],
          diploma: u.diploma ? file(u.diploma) : null,
          diplomaVerified: u.diplomaVerified === true,
          rating: Number(u.rating) || 0,
          recommendation: Number(u.recommendation) || 0,
          telegramChatId: u.telegramChatId ?? null,
        });
        for (const r of u.comments ?? []) {
          await tx.insert(schema.reviews).values({
            doctorId: u.id,
            userId: r.userId ?? byName.get(r.user?.fullName) ?? null,
            authorName: String(r.user?.fullName || ''),
            authorImage: file(r.user?.image),
            rating: Math.min(5, Math.max(1, Math.round(Number(r.rating) || 5))),
            comment: String(r.comment || ''),
            edited: r.edited === true,
            createdAt: dateOf(r.date),
          });
        }
      }

      for (const a of data.appointments ?? []) {
        const doctor = users.find((u) => u.id == a.doctorId);
        const client = users.find((u) => u.id == a.clientId);
        await tx.insert(schema.appointments).values({
          id: a.id,
          doctorId: Number(a.doctorId),
          clientId: a.clientId != null ? Number(a.clientId) : null,
          doctorName: String(a.doctorName || doctor?.fullName || ''),
          clientName: String(a.clientName || client?.fullName || ''),
          clientPhone: phoneOf(client?.phone) ?? '',
          specialty: String(a.specialty || doctor?.specialty || ''),
          date: a.date,
          time: a.time,
          symptoms: String(a.symptoms || ''),
          status: a.status as AppointmentStatus,
          rejectReason: String(a.rejectReason || ''),
          price: Number(doctor?.price?.current) || 0,
          remindersSent: a.remindersSent ?? [],
          createdAt: dateOf(a.createdAt),
        });
      }

      for (const w of data.wishlist ?? []) {
        for (const f of w.favorites ?? []) {
          await tx
            .insert(schema.favorites)
            .values({ userId: Number(w.userId), doctorId: Number(f.doctorId) })
            .onConflictDoNothing();
        }
      }

      for (const m of data.messages ?? []) {
        await tx.insert(schema.messages).values({
          id: m.id,
          senderId: Number(m.senderId),
          receiverId: Number(m.receiverId),
          text: String(m.text || ''),
          audioUrl: m.audioUrl ? file(m.audioUrl) : null,
          isRead: m.isRead === true,
          isEdited: m.isEdited === true,
          createdAt: dateOf(m.timestamp),
        });
      }

      for (const r of data.medicalRecords ?? []) {
        await tx.insert(schema.medicalRecords).values({
          id: r.id,
          doctorId: Number(r.doctorId),
          clientId: Number(r.clientId),
          doctorName: String(r.doctorName || ''),
          data: r.data ?? {},
          transcript: String(r.transcript || ''),
          createdAt: dateOf(r.createdAt),
          updatedAt: dateOf(r.updatedAt || r.createdAt),
        });
      }

      // Explicit ids were inserted, so move each sequence past the highest one
      for (const table of [
        'users',
        'appointments',
        'reviews',
        'messages',
        'medical_records',
      ]) {
        await tx.execute(
          sql.raw(
            `SELECT setval(pg_get_serial_sequence('${table}', 'id'), COALESCE((SELECT MAX(id) FROM ${table}), 0) + 1, false)`,
          ),
        );
      }
    });

    console.log(
      `Imported ${users.length} users, ${data.appointments?.length ?? 0} appointments, ` +
        `${data.messages?.length ?? 0} messages, ${data.medicalRecords?.length ?? 0} medical records`,
    );
  } finally {
    await close();
  }
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
