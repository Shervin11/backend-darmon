/**
 * Adds one or two examples of everything for a demo: past and upcoming visits in every status,
 * a phone booking and a walk-in, medical records (with access log), reviews, chats, favourites,
 * a doctor's leave and public holidays. Dates are relative to today and fit the doctors' schedules.
 *   npm run db:seed-demo
 * Uses the first two patients and the first three verified doctors with a schedule.
 * Refuses to run if those patients already have visits.
 */
import '../env';
import { and, asc, eq, inArray, isNotNull, sql } from 'drizzle-orm';
import { createDatabase, schema } from '../db';
import type { Appointment, User } from '../db/schema';
import {
  WEEKDAYS,
  clinicToday,
  slotLength,
  toMinutes,
  toTime,
  weekdayOf,
} from '../schedule';

const {
  users,
  appointments,
  reviews,
  medicalRecords,
  messages,
  favorites,
  accessLog,
  holidays,
} = schema;

const addDays = (date: string, days: number) => {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
};

/** The n-th working day of a doctor after (step 1) or before (step -1) today, with its first start time. */
function workDay(
  doctor: User,
  step: 1 | -1,
  n = 1,
): { date: string; start: number } {
  let date = clinicToday();
  for (let found = 0; ; ) {
    date = addDays(date, step);
    const ranges = (doctor.workingSchedule ?? []).filter(
      (s) => s.day === weekdayOf(date),
    );
    if (ranges.length && ++found === n)
      return {
        date,
        start: Math.min(...ranges.map((r) => toMinutes(r.startTime))),
      };
  }
}

/** Start time of the k-th slot of that day. */
const slot = (doctor: User, start: number, k: number) =>
  toTime(start + k * slotLength(doctor));

const at = (date: string, time: string) =>
  new Date(`${date}T${time}:00${process.env.APP_UTC_OFFSET || '+05:00'}`);

async function main() {
  const { db, close } = await createDatabase();
  try {
    const patients = await db
      .select()
      .from(users)
      .where(eq(users.role, 'client'))
      .orderBy(asc(users.id))
      .limit(2);
    const doctors = (
      await db
        .select()
        .from(users)
        .where(
          and(
            eq(users.role, 'doctor'),
            eq(users.diplomaVerified, true),
            isNotNull(users.clinicId),
          ),
        )
        .orderBy(asc(users.id))
    )
      .filter(
        (d) =>
          d.workingSchedule?.length &&
          d.workingSchedule.some((s) => WEEKDAYS.includes(s.day)),
      )
      .slice(0, 3);
    if (patients.length < 2 || doctors.length < 3)
      throw new Error(
        'Need at least 2 patients and 3 verified doctors with a schedule',
      );

    const [p1, p2] = patients;
    const [d1, d2, d3] = doctors;
    const [busy] = await db
      .select({ n: sql<number>`count(*)::int` })
      .from(appointments)
      .where(inArray(appointments.clientId, [p1.id, p2.id]));
    if (busy.n > 0)
      throw new Error('These patients already have visits — clear them first');

    const price = (d: User) => Number(d.price?.current) || 0;
    const visit = (
      d: User,
      p: User | { fullName: string; phone: string },
      when: { date: string; start: number },
      k: number,
      extra: Partial<typeof appointments.$inferInsert>,
    ): typeof appointments.$inferInsert => ({
      doctorId: d.id,
      clientId: 'id' in p ? p.id : null,
      doctorName: d.fullName,
      clientName: p.fullName,
      clientPhone: p.phone ?? '',
      specialty: d.specialty ?? '',
      date: when.date,
      time: slot(d, when.start, k),
      durationMinutes: slotLength(d),
      price: price(d),
      status: 'pending',
      source: 'online',
      ...extra,
    });

    const today = clinicToday();
    const todayRanges = (d2.workingSchedule ?? []).filter(
      (s) => s.day === weekdayOf(today),
    );
    const walkInDay = todayRanges.length
      ? {
          date: today,
          start: Math.min(...todayRanges.map((r) => toMinutes(r.startTime))),
        }
      : workDay(d2, -1, 2);

    await db.transaction(async (tx) => {
      const insert = (values: typeof appointments.$inferInsert) =>
        tx
          .insert(appointments)
          .values(values)
          .returning()
          .then((r) => r[0]);

      // Past visits
      const done1 = await insert(
        visit(d1, p1, workDay(d1, -1), 1, {
          status: 'completed',
          paid: true,
          symptoms: 'Ҳарорат 38°, сулфа ва дарди гулӯ се рӯз боз',
        }),
      );
      const done2 = await insert(
        visit(d2, p2, workDay(d2, -1), 0, {
          status: 'completed',
          paid: true,
          source: 'phone',
          symptoms: 'Ҳангоми роҳ рафтан нафастангӣ ва дарди сина',
        }),
      );
      await insert(
        visit(d3, p2, workDay(d3, -1), 2, {
          status: 'no_show',
          symptoms: 'Дарди сар ва чарх задани сар',
        }),
      );
      await insert(
        visit(d3, p1, workDay(d3, -1, 2), 1, {
          status: 'rejected',
          rejectReason:
            'Духтур дар конференсия аст, лутфан рӯзи дигарро интихоб кунед',
          symptoms: 'Бехобӣ',
        }),
      );
      await insert(
        visit(
          d2,
          { fullName: 'Меҳрангез Назарова', phone: '+992935551234' },
          walkInDay,
          1,
          {
            status: 'completed',
            paid: true,
            source: 'walkin',
            symptoms: 'Чен кардани фишори хун',
          },
        ),
      );

      // Upcoming visits
      await insert(
        visit(d2, p1, workDay(d2, 1), 0, {
          status: 'approved',
          symptoms: 'Назорати такрорӣ пас аз табобат',
        }),
      );
      await insert(
        visit(d3, p1, workDay(d3, 1), 1, {
          status: 'pending',
          symptoms: 'Дарди сар бегоҳӣ, хусусан пас аз кор',
        }),
      );
      await insert(
        visit(d1, p2, workDay(d1, 1), 2, {
          status: 'cancelled',
          rejectReason: 'Вақти дигар интихоб мекунам',
          symptoms: 'Ташхиси умумии солона',
        }),
      );
      await insert(
        visit(
          d1,
          { fullName: 'Шодмон Раҳимов', phone: '+992918887766' },
          workDay(d1, 1),
          0,
          {
            status: 'approved',
            source: 'phone',
            symptoms: 'Занг зад: дарди меъда',
          },
        ),
      );

      // Medical records of the completed visits; creating them is logged as the doctor would
      const records = await tx
        .insert(medicalRecords)
        .values([
          {
            doctorId: d1.id,
            clientId: p1.id,
            doctorName: d1.fullName,
            data: {
              complaints:
                'Ҳарорат то 38°, сулфаи хушк, дарди гулӯ, заифӣ — 3 рӯз.',
              diagnosis: 'ОРВИ (сироятҳои шадиди роҳҳои нафас), шакли миёна.',
              treatment:
                'Нӯшокии зиёд, парасетамол 500 мг ҳангоми ҳарорат аз 38,5°, ғарғара бо маҳлули намак 3 бор дар рӯз, истироҳат 5 рӯз.',
              follow_up:
                'Агар ҳарорат пас аз 3 рӯз паст нашавад — қабули такрорӣ.',
            },
            createdAt: at(done1.date, done1.time),
            updatedAt: at(done1.date, done1.time),
          },
          {
            doctorId: d2.id,
            clientId: p2.id,
            doctorName: d2.fullName,
            data: {
              complaints:
                'Нафастангӣ ва фишори сина ҳангоми боркашӣ, фишори хун 150/95.',
              diagnosis:
                'Гипертонияи артериалӣ, дараҷаи 1. Истиснои бемории ишемикии дил лозим аст.',
              treatment:
                'ЭКГ ва таҳлили умумии хун. Камкунии намак, роҳгардӣ 30 дақиқа дар рӯз. Дору аз рӯи натиҷаи таҳлилҳо.',
              follow_up: 'Бо натиҷаи ЭКГ пас аз 2 ҳафта.',
            },
            createdAt: at(done2.date, done2.time),
            updatedAt: at(done2.date, done2.time),
          },
        ])
        .returning();
      await tx.insert(accessLog).values([
        ...records.map((r) => ({
          userId: r.doctorId,
          action: 'create',
          targetType: 'medical_record',
          targetId: r.id,
          patientId: r.clientId,
          createdAt: r.createdAt,
        })),
        {
          userId: d2.id,
          action: 'view',
          targetType: 'medical_record',
          targetId: null,
          patientId: p2.id,
          createdAt: new Date(records[1].createdAt.getTime() + 24 * 3600_000),
        },
      ]);

      // Reviews of the completed visits
      const review = (
        a: Appointment,
        p: User,
        rating: number,
        comment: string,
      ) => ({
        doctorId: a.doctorId,
        userId: p.id,
        appointmentId: a.id,
        authorName: p.fullName,
        authorImage: p.image,
        rating,
        comment,
        createdAt: new Date(at(a.date, a.time).getTime() + 6 * 3600_000),
      });
      await tx
        .insert(reviews)
        .values([
          review(
            done1,
            p1,
            5,
            'Духтур бодиққат гӯш кард, ҳама чизро фаҳмо шарҳ дод. Пас аз се рӯз худро хуб ҳис кардам. Ташаккур!',
          ),
          review(
            done2,
            p2,
            4,
            'Мутахассиси хуб, ташхисро муфассал гузаронд. Каме дар навбат интизор шудем, вале арзид.',
          ),
        ]);
      for (const id of [d1.id, d2.id]) {
        await tx.execute(sql`
          update users set
            rating = coalesce((select round(avg(rating)::numeric, 1) from reviews where doctor_id = ${id}), 0),
            recommendation = coalesce((select round(100.0 * count(*) filter (where rating >= 4) / nullif(count(*), 0)) from reviews where doctor_id = ${id}), 0)
          where id = ${id}`);
      }

      // Chats
      const t0 = at(done1.date, done1.time).getTime() + 26 * 3600_000;
      const t1 = at(done2.date, done2.time).getTime() + 3 * 3600_000;
      await tx.insert(messages).values([
        {
          senderId: p1.id,
          receiverId: d1.id,
          text: 'Ассалому алайкум! Ҳарорат паст шуд, вале сулфа ҳоло ҳаст. Доруро идома диҳам?',
          isRead: true,
          createdAt: new Date(t0),
        },
        {
          senderId: d1.id,
          receiverId: p1.id,
          text: 'Ваалейкум ассалом! Бале, ғарғараро то 7 рӯз идома диҳед. Агар сулфа зиёд шавад, биёед.',
          isRead: true,
          createdAt: new Date(t0 + 40 * 60_000),
        },
        {
          senderId: p1.id,
          receiverId: d1.id,
          text: 'Ташаккур, духтур!',
          isRead: false,
          createdAt: new Date(t0 + 55 * 60_000),
        },
        {
          senderId: d2.id,
          receiverId: p2.id,
          text: 'Саттор, натиҷаи ЭКГ-ро ҳангоми омода шудан ба ин ҷо фиристед.',
          isRead: false,
          createdAt: new Date(t1),
        },
      ]);

      await tx
        .insert(favorites)
        .values([
          { userId: p1.id, doctorId: d1.id },
          { userId: p1.id, doctorId: d3.id },
          { userId: p2.id, doctorId: d2.id },
        ])
        .onConflictDoNothing();

      // A doctor's leave and public holidays
      const leaveFrom = addDays(workDay(d3, 1, 3).date, 0);
      await tx
        .update(users)
        .set({
          timeOff: [
            {
              from: leaveFrom,
              to: addDays(leaveFrom, 4),
              reason: 'Рухсатии меҳнатӣ',
            },
          ],
        })
        .where(eq(users.id, d3.id));
      const year =
        Number(today.slice(0, 4)) + (today.slice(5) > '03-24' ? 1 : 0);
      await tx
        .insert(holidays)
        .values([
          { date: `${year}-01-01`, name: 'Соли нав' },
          { date: `${year}-03-08`, name: 'Рӯзи модар' },
          ...[21, 22, 23, 24].map((d) => ({
            date: `${year}-03-${d}`,
            name: 'Наврӯз',
          })),
        ])
        .onConflictDoNothing();
    });

    console.log(
      `Demo data added for patients "${p1.fullName}" and "${p2.fullName}", doctors "${d1.fullName}", "${d2.fullName}", "${d3.fullName}"`,
    );
  } finally {
    await close();
  }
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
