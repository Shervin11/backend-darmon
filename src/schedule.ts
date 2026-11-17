import type { ScheduleEntry, TimeOff } from './db/schema';

// Schedule entries use Tajik weekday names, e.g. { day: 'Душанбе', startTime: '09:00', endTime: '15:00' }.
// Several entries for the same day describe a break between them.
export const WEEKDAYS = [
  'Якшанбе',
  'Душанбе',
  'Сешанбе',
  'Чоршанбе',
  'Панҷшанбе',
  'Ҷумъа',
  'Шанбе',
];

/** Statuses that occupy the doctor's time. */
export const BUSY_STATUSES = ['pending', 'approved', 'completed', 'no_show'];

export interface DoctorHours {
  workingSchedule?: ScheduleEntry[] | null;
  slotMinutes?: number | null;
  timeOff?: TimeOff[] | null;
}

export interface BookedRange {
  time: string;
  durationMinutes: number;
}

export const toMinutes = (time: string) => {
  const [h, m] = String(time).split(':').map(Number);
  return h * 60 + (m || 0);
};

export const toTime = (minutes: number) =>
  `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;

export const isValidDate = (date: string) =>
  /^\d{4}-\d{2}-\d{2}$/.test(date) && !isNaN(Date.parse(date));
export const isValidTime = (time: string) =>
  /^([01]\d|2[0-3]):[0-5]\d$/.test(time);

/** Weekday name for a YYYY-MM-DD date (calendar date, no time zone shift). */
export function weekdayOf(date: string): string {
  const [y, m, d] = date.split('-').map(Number);
  return WEEKDAYS[new Date(Date.UTC(y, m - 1, d)).getUTCDay()];
}

/**
 * Appointment dates/times are clinic-local (Tajikistan, UTC+5 by default), independent of the server's time zone.
 * Override with APP_UTC_OFFSET, e.g. "+05:00".
 */
export const appointmentStart = (date: string, time: string) =>
  new Date(`${date}T${time}:00${process.env.APP_UTC_OFFSET || '+05:00'}`);

/** Today's date in clinic time (YYYY-MM-DD). */
export function clinicToday(now = new Date()): string {
  const offset = process.env.APP_UTC_OFFSET || '+05:00';
  const sign = offset.startsWith('-') ? -1 : 1;
  const [h, m] = offset.slice(1).split(':').map(Number);
  return new Date(now.getTime() + sign * (h * 60 + m) * 60000)
    .toISOString()
    .slice(0, 10);
}

export const slotLength = (doctor: DoctorHours) =>
  Math.min(Math.max(doctor.slotMinutes || 60, 10), 240);

/** Why a doctor does not work on a date, or null if they do. */
export function dayOffReason(
  doctor: DoctorHours,
  date: string,
  holidays: Set<string>,
): 'holiday' | 'time_off' | 'not_working' | null {
  if (holidays.has(date)) return 'holiday';
  if (doctor.timeOff?.some((t) => date >= t.from && date <= t.to))
    return 'time_off';
  // No published schedule means "any time" (kept for doctors who have not filled it in yet)
  if (
    doctor.workingSchedule?.length &&
    !doctor.workingSchedule.some((s) => s.day === weekdayOf(date))
  ) {
    return 'not_working';
  }
  return null;
}

/** A visit [time, time + duration) must lie inside one working range of that day. */
export function fitsSchedule(
  doctor: DoctorHours,
  date: string,
  time: string,
  durationMinutes: number,
): boolean {
  if (!doctor.workingSchedule?.length) return true;
  const day = weekdayOf(date);
  const start = toMinutes(time);
  return doctor.workingSchedule.some(
    (s) =>
      s.day === day &&
      start >= toMinutes(s.startTime) &&
      start + durationMinutes <= toMinutes(s.endTime),
  );
}

export function overlaps(
  time: string,
  durationMinutes: number,
  booked: BookedRange[],
): boolean {
  const start = toMinutes(time);
  const end = start + durationMinutes;
  return booked.some((b) => {
    const bStart = toMinutes(b.time);
    return start < bStart + b.durationMinutes && bStart < end;
  });
}

/** Bookable start times for a day with their availability. */
export function daySlots(
  doctor: DoctorHours,
  date: string,
  booked: BookedRange[],
  now = new Date(),
) {
  const length = slotLength(doctor);
  const ranges = doctor.workingSchedule?.length
    ? doctor.workingSchedule.filter((s) => s.day === weekdayOf(date))
    : [{ day: '', startTime: '08:00', endTime: '17:00' }];
  const times = new Set<string>();
  for (const r of ranges) {
    for (
      let t = toMinutes(r.startTime);
      t + length <= toMinutes(r.endTime);
      t += length
    )
      times.add(toTime(t));
  }
  return [...times].sort().map((time) => ({
    time,
    free: appointmentStart(date, time) > now && !overlaps(time, length, booked),
  }));
}
