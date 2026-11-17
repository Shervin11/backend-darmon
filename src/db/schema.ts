import {
  bigint,
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  real,
  serial,
  text,
  timestamp,
} from 'drizzle-orm/pg-core';

export type Role = 'admin' | 'clinic' | 'registrar' | 'doctor' | 'client';

export interface ScheduleEntry {
  day: string;
  startTime: string;
  endTime: string;
}

export interface TimeOff {
  from: string; // YYYY-MM-DD, inclusive
  to: string;
  reason?: string;
}

export interface Price {
  current: number | string;
  old?: number | string | null;
  currency: string;
}

// One table for every account. Clinic- and doctor-specific columns are null for other roles.
export const users = pgTable(
  'users',
  {
    id: serial().primaryKey(),
    role: text().$type<Role>().notNull(),
    fullName: text('full_name').notNull(),
    email: text().unique(),
    phone: text().unique(),
    password: text().notNull(),
    image: text().notNull().default(''),
    city: text().notNull().default(''),
    address: text().notNull().default(''),
    lang: text().notNull().default('tj'),
    // Staff (doctor / registrar) belong to a clinic account
    clinicId: integer('clinic_id'),
    clinicName: text('clinic_name'),
    // Doctor profile
    specialty: text(),
    experience: integer(),
    bio: text(),
    price: jsonb().$type<Price>(),
    workingSchedule: jsonb('working_schedule')
      .$type<ScheduleEntry[]>()
      .default([]),
    slotMinutes: integer('slot_minutes').notNull().default(60),
    timeOff: jsonb('time_off').$type<TimeOff[]>().default([]),
    diploma: text(),
    diplomaVerified: boolean('diploma_verified').notNull().default(false),
    rating: real().notNull().default(0),
    recommendation: integer().notNull().default(0),
    // Integrations
    telegramChatId: bigint('telegram_chat_id', { mode: 'number' }),
    telegramLinkCode: text('telegram_link_code'),
    telegramLinkExpires: timestamp('telegram_link_expires', {
      withTimezone: true,
    }),
    resetCode: text('reset_code'),
    resetExpires: timestamp('reset_expires', { withTimezone: true }),
    resetAttempts: integer('reset_attempts').notNull().default(0),
    consentAt: timestamp('consent_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index('users_role_idx').on(t.role),
    index('users_clinic_idx').on(t.clinicId),
  ],
);

export type AppointmentStatus =
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'cancelled'
  | 'completed'
  | 'no_show';
export type AppointmentSource = 'online' | 'phone' | 'walkin';

export const appointments = pgTable(
  'appointments',
  {
    id: serial().primaryKey(),
    doctorId: integer('doctor_id').notNull(),
    // Null for patients booked by the registrar without an account
    clientId: integer('client_id'),
    doctorName: text('doctor_name').notNull(),
    clientName: text('client_name').notNull(),
    clientPhone: text('client_phone').notNull().default(''),
    specialty: text().notNull().default(''),
    date: text().notNull(), // YYYY-MM-DD, clinic local time
    time: text().notNull(), // HH:MM
    durationMinutes: integer('duration_minutes').notNull().default(60),
    symptoms: text().notNull().default(''),
    status: text().$type<AppointmentStatus>().notNull().default('pending'),
    rejectReason: text('reject_reason').notNull().default(''),
    source: text().$type<AppointmentSource>().notNull().default('online'),
    price: real().notNull().default(0),
    paid: boolean().notNull().default(false),
    remindersSent: jsonb('reminders_sent')
      .$type<string[]>()
      .notNull()
      .default([]),
    createdBy: integer('created_by'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index('appointments_doctor_date_idx').on(t.doctorId, t.date),
    index('appointments_client_idx').on(t.clientId),
  ],
);

export const reviews = pgTable(
  'reviews',
  {
    id: serial().primaryKey(),
    doctorId: integer('doctor_id').notNull(),
    userId: integer('user_id'),
    appointmentId: integer('appointment_id'),
    // Snapshot of the author, kept in sync when they change their profile
    authorName: text('author_name').notNull(),
    authorImage: text('author_image').notNull().default(''),
    rating: integer().notNull(),
    comment: text().notNull(),
    edited: boolean().notNull().default(false),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index('reviews_doctor_idx').on(t.doctorId)],
);

export const favorites = pgTable(
  'favorites',
  {
    userId: integer('user_id').notNull(),
    doctorId: integer('doctor_id').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.doctorId] })],
);

export const messages = pgTable(
  'messages',
  {
    id: serial().primaryKey(),
    senderId: integer('sender_id').notNull(),
    receiverId: integer('receiver_id').notNull(),
    text: text().notNull().default(''),
    audioUrl: text('audio_url'),
    isRead: boolean('is_read').notNull().default(false),
    isEdited: boolean('is_edited').notNull().default(false),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index('messages_pair_idx').on(t.senderId, t.receiverId)],
);

export interface ProtocolData {
  complaints?: string;
  diagnosis?: string;
  treatment?: string;
  follow_up?: string;
}

export const medicalRecords = pgTable(
  'medical_records',
  {
    id: serial().primaryKey(),
    doctorId: integer('doctor_id').notNull(),
    clientId: integer('client_id').notNull(),
    doctorName: text('doctor_name').notNull(),
    data: jsonb().$type<ProtocolData>().notNull().default({}),
    transcript: text().notNull().default(''),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index('medical_records_client_idx').on(t.clientId),
    index('medical_records_doctor_idx').on(t.doctorId),
  ],
);

/** Who opened or changed medical data, and when. */
export const accessLog = pgTable(
  'access_log',
  {
    id: serial().primaryKey(),
    userId: integer('user_id').notNull(),
    action: text().notNull(), // e.g. "view", "create", "update", "delete"
    targetType: text('target_type').notNull(), // e.g. "medical_record"
    targetId: integer('target_id'),
    patientId: integer('patient_id'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index('access_log_patient_idx').on(t.patientId)],
);

/** Clinic-wide days off (public holidays). */
export const holidays = pgTable('holidays', {
  date: text().primaryKey(), // YYYY-MM-DD
  name: text().notNull(),
});

export type User = typeof users.$inferSelect;
export type Appointment = typeof appointments.$inferSelect;
export type Review = typeof reviews.$inferSelect;
export type Message = typeof messages.$inferSelect;
export type MedicalRecord = typeof medicalRecords.$inferSelect;
