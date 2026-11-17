CREATE TABLE "access_log" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"action" text NOT NULL,
	"target_type" text NOT NULL,
	"target_id" integer,
	"patient_id" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "appointments" (
	"id" serial PRIMARY KEY NOT NULL,
	"doctor_id" integer NOT NULL,
	"client_id" integer,
	"doctor_name" text NOT NULL,
	"client_name" text NOT NULL,
	"client_phone" text DEFAULT '' NOT NULL,
	"specialty" text DEFAULT '' NOT NULL,
	"date" text NOT NULL,
	"time" text NOT NULL,
	"duration_minutes" integer DEFAULT 60 NOT NULL,
	"symptoms" text DEFAULT '' NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"reject_reason" text DEFAULT '' NOT NULL,
	"source" text DEFAULT 'online' NOT NULL,
	"price" real DEFAULT 0 NOT NULL,
	"paid" boolean DEFAULT false NOT NULL,
	"reminders_sent" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_by" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "favorites" (
	"user_id" integer NOT NULL,
	"doctor_id" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "favorites_user_id_doctor_id_pk" PRIMARY KEY("user_id","doctor_id")
);
--> statement-breakpoint
CREATE TABLE "holidays" (
	"date" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "medical_records" (
	"id" serial PRIMARY KEY NOT NULL,
	"doctor_id" integer NOT NULL,
	"client_id" integer NOT NULL,
	"doctor_name" text NOT NULL,
	"data" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"transcript" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"sender_id" integer NOT NULL,
	"receiver_id" integer NOT NULL,
	"text" text DEFAULT '' NOT NULL,
	"audio_url" text,
	"is_read" boolean DEFAULT false NOT NULL,
	"is_edited" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reviews" (
	"id" serial PRIMARY KEY NOT NULL,
	"doctor_id" integer NOT NULL,
	"user_id" integer,
	"appointment_id" integer,
	"author_name" text NOT NULL,
	"author_image" text DEFAULT '' NOT NULL,
	"rating" integer NOT NULL,
	"comment" text NOT NULL,
	"edited" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"role" text NOT NULL,
	"full_name" text NOT NULL,
	"email" text,
	"phone" text,
	"password" text NOT NULL,
	"image" text DEFAULT '' NOT NULL,
	"city" text DEFAULT '' NOT NULL,
	"address" text DEFAULT '' NOT NULL,
	"lang" text DEFAULT 'tj' NOT NULL,
	"clinic_id" integer,
	"clinic_name" text,
	"specialty" text,
	"experience" integer,
	"bio" text,
	"price" jsonb,
	"working_schedule" jsonb DEFAULT '[]'::jsonb,
	"slot_minutes" integer DEFAULT 60 NOT NULL,
	"time_off" jsonb DEFAULT '[]'::jsonb,
	"diploma" text,
	"diploma_verified" boolean DEFAULT false NOT NULL,
	"rating" real DEFAULT 0 NOT NULL,
	"recommendation" integer DEFAULT 0 NOT NULL,
	"telegram_chat_id" bigint,
	"telegram_link_code" text,
	"telegram_link_expires" timestamp with time zone,
	"reset_code" text,
	"reset_expires" timestamp with time zone,
	"reset_attempts" integer DEFAULT 0 NOT NULL,
	"consent_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_phone_unique" UNIQUE("phone")
);
--> statement-breakpoint
CREATE INDEX "access_log_patient_idx" ON "access_log" USING btree ("patient_id");--> statement-breakpoint
CREATE INDEX "appointments_doctor_date_idx" ON "appointments" USING btree ("doctor_id","date");--> statement-breakpoint
CREATE INDEX "appointments_client_idx" ON "appointments" USING btree ("client_id");--> statement-breakpoint
CREATE INDEX "medical_records_client_idx" ON "medical_records" USING btree ("client_id");--> statement-breakpoint
CREATE INDEX "medical_records_doctor_idx" ON "medical_records" USING btree ("doctor_id");--> statement-breakpoint
CREATE INDEX "messages_pair_idx" ON "messages" USING btree ("sender_id","receiver_id");--> statement-breakpoint
CREATE INDEX "reviews_doctor_idx" ON "reviews" USING btree ("doctor_id");--> statement-breakpoint
CREATE INDEX "users_role_idx" ON "users" USING btree ("role");--> statement-breakpoint
CREATE INDEX "users_clinic_idx" ON "users" USING btree ("clinic_id");