import {
  dayOffReason,
  daySlots,
  fitsSchedule,
  overlaps,
  weekdayOf,
} from './schedule';
import { normalizePhone } from './users.service';

const doctor = {
  // Monday with a lunch break
  workingSchedule: [
    { day: 'Душанбе', startTime: '09:00', endTime: '12:00' },
    { day: 'Душанбе', startTime: '13:00', endTime: '14:00' },
  ],
  slotMinutes: 45,
  timeOff: [{ from: '2031-02-10', to: '2031-02-14' }],
};
const monday = '2031-02-03';
const past = new Date('2031-01-01T00:00:00Z');

describe('schedule', () => {
  it('names weekdays in Tajik', () => {
    expect(weekdayOf(monday)).toBe('Душанбе');
  });

  it('builds slots of the doctor length inside working ranges', () => {
    expect(daySlots(doctor, monday, [], past).map((s) => s.time)).toEqual([
      '09:00',
      '09:45',
      '10:30',
      '11:15',
      '13:00',
    ]);
  });

  it('marks slots overlapping a booking as busy', () => {
    const slots = daySlots(
      doctor,
      monday,
      [{ time: '09:30', durationMinutes: 30 }],
      past,
    );
    expect(slots.filter((s) => !s.free).map((s) => s.time)).toEqual([
      '09:00',
      '09:45',
    ]);
  });

  it('marks past slots as busy', () => {
    expect(
      daySlots(doctor, monday, [], new Date('2031-02-03T05:00:00Z'))
        .filter((s) => s.free)
        .map((s) => s.time),
    ).toEqual(['10:30', '11:15', '13:00']);
  });

  it('checks that a visit fits one range', () => {
    expect(fitsSchedule(doctor, monday, '11:15', 45)).toBe(true);
    expect(fitsSchedule(doctor, monday, '11:30', 45)).toBe(false);
    expect(fitsSchedule(doctor, '2031-02-04', '09:00', 45)).toBe(false);
  });

  it('detects overlaps but not touching ranges', () => {
    expect(
      overlaps('10:00', 30, [{ time: '10:29', durationMinutes: 10 }]),
    ).toBe(true);
    expect(
      overlaps('10:00', 30, [{ time: '10:30', durationMinutes: 30 }]),
    ).toBe(false);
  });

  it('explains days off', () => {
    expect(dayOffReason(doctor, monday, new Set([monday]))).toBe('holiday');
    expect(dayOffReason(doctor, '2031-02-10', new Set())).toBe('time_off');
    expect(dayOffReason(doctor, '2031-02-04', new Set())).toBe('not_working');
    expect(dayOffReason(doctor, monday, new Set())).toBeNull();
  });
});

describe('normalizePhone', () => {
  it('adds the Tajik country code to local numbers', () => {
    expect(normalizePhone('93 111-22-33')).toBe('+992931112233');
    expect(normalizePhone('+992 93 111 22 33')).toBe('+992931112233');
    expect(normalizePhone('')).toBeNull();
    expect(() => normalizePhone('123')).toThrow();
  });
});
