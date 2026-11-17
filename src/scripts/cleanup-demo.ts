/**
 * Removes demo data before going live. Dry run by default — prints what would be deleted.
 *   npm run db:cleanup-demo            (dry run)
 *   npm run db:cleanup-demo -- --yes   (delete)
 * Demo accounts: emails on example/test domains or listed in DEMO_EMAILS (comma-separated).
 * Admin accounts are never removed.
 */
import '../env';
import { and, inArray, ne, or, sql } from 'drizzle-orm';
import { createDatabase, schema } from '../db';

const {
  users,
  appointments,
  reviews,
  favorites,
  messages,
  medicalRecords,
  accessLog,
} = schema;
const DEMO_DOMAINS = [
  'example.com',
  'example.org',
  'test.com',
  'test.tj',
  'demo.tj',
  'mail.test',
];

async function main() {
  const apply = process.argv.includes('--yes');
  const extra = (process.env.DEMO_EMAILS || '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  const { db, close } = await createDatabase();
  try {
    const demo = await db
      .select({
        id: users.id,
        email: users.email,
        role: users.role,
        fullName: users.fullName,
      })
      .from(users)
      .where(
        and(
          ne(users.role, 'admin'),
          or(
            ...DEMO_DOMAINS.map(
              (d) => sql`lower(${users.email}) like ${'%@' + d}`,
            ),
            extra.length
              ? inArray(sql`lower(${users.email})`, extra)
              : undefined,
          ),
        ),
      );
    console.table(demo);
    if (!demo.length || !apply) {
      console.log(
        apply
          ? 'Nothing to delete.'
          : `Dry run: ${demo.length} account(s). Re-run with --yes to delete.`,
      );
      return;
    }
    const ids = demo.map((u) => u.id);
    await db.transaction(async (tx) => {
      await tx
        .delete(appointments)
        .where(
          or(
            inArray(appointments.doctorId, ids),
            inArray(appointments.clientId, ids),
          ),
        );
      await tx
        .delete(reviews)
        .where(
          or(inArray(reviews.doctorId, ids), inArray(reviews.userId, ids)),
        );
      await tx
        .delete(favorites)
        .where(
          or(inArray(favorites.userId, ids), inArray(favorites.doctorId, ids)),
        );
      await tx
        .delete(messages)
        .where(
          or(
            inArray(messages.senderId, ids),
            inArray(messages.receiverId, ids),
          ),
        );
      await tx
        .delete(medicalRecords)
        .where(
          or(
            inArray(medicalRecords.doctorId, ids),
            inArray(medicalRecords.clientId, ids),
          ),
        );
      await tx
        .delete(accessLog)
        .where(
          or(inArray(accessLog.userId, ids), inArray(accessLog.patientId, ids)),
        );
      await tx.delete(users).where(inArray(users.id, ids));
    });
    console.log(`Deleted ${ids.length} demo account(s) and their data.`);
  } finally {
    await close();
  }
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
