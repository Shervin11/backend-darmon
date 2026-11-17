// Database rows → API responses (field names match what the frontend already uses)
import type {
  Appointment,
  MedicalRecord,
  Message,
  Review,
  User,
} from './db/schema';
import { publicUrl } from './files';

export function toReview(r: Review) {
  return {
    id: r.id,
    userId: r.userId,
    appointmentId: r.appointmentId,
    user: { fullName: r.authorName, image: publicUrl(r.authorImage) },
    rating: r.rating,
    comment: r.comment,
    date: r.createdAt.toISOString().slice(0, 10),
    edited: r.edited,
  };
}

/** Public/own view of a user. Never includes the password or integration secrets. */
export function toUser(u: User, reviews?: Review[]) {
  return {
    id: u.id,
    role: u.role,
    fullName: u.fullName,
    email: u.email ?? '',
    phone: u.phone ?? '',
    image: publicUrl(u.image),
    city: u.city,
    address: u.address,
    lang: u.lang,
    clinicId: u.clinicId,
    clinicName: u.clinicName,
    // Older frontend code reads the doctor's clinic name from `clinic`
    clinic: u.clinicName ?? '',
    specialty: u.specialty ?? '',
    experience: u.experience ?? 0,
    bio: u.bio ?? '',
    price: u.price ?? null,
    workingSchedule: u.workingSchedule ?? [],
    slotMinutes: u.slotMinutes,
    timeOff: u.timeOff ?? [],
    diploma: publicUrl(u.diploma),
    diplomaVerified: u.diplomaVerified,
    rating: u.rating,
    recommendation: u.recommendation,
    telegramLinked: u.telegramChatId != null,
    ...(reviews && { comments: reviews.map(toReview) }),
  };
}

/** Minimal view for lists that other people see (chat partners, patient pickers). */
export const toContact = (u: User) => ({
  id: u.id,
  fullName: u.fullName,
  image: publicUrl(u.image),
  role: u.role,
  specialty: u.specialty ?? '',
  phone: u.phone ?? '',
});

export function toAppointment(a: Appointment) {
  // remindersSent and createdBy are internal
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { remindersSent, createdBy, ...rest } = a;
  return { ...rest, createdAt: a.createdAt.toISOString() };
}

export function toMessage(m: Message) {
  return {
    id: m.id,
    senderId: m.senderId,
    receiverId: m.receiverId,
    text: m.text,
    audioUrl: m.audioUrl ? publicUrl(m.audioUrl) : undefined,
    isRead: m.isRead,
    isEdited: m.isEdited,
    timestamp: m.createdAt.toISOString(),
  };
}

export function toRecord(r: MedicalRecord, clientName?: string) {
  return {
    ...r,
    clientName: clientName ?? '',
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  };
}
