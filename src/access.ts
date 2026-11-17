import { ForbiddenException } from '@nestjs/common';
import type { AuthUser } from './auth';
import type { User } from './db/schema';

/** The clinic an account acts for: the clinic itself, or the clinic its staff belongs to. */
export const clinicOf = (auth: AuthUser): number | null =>
  auth.role === 'clinic'
    ? auth.id
    : auth.role === 'registrar' || auth.role === 'doctor'
      ? auth.clinicId
      : null;

/** Clinic owner and its registrars manage the clinic's doctors (profile, time off, bookings). */
export function canManageDoctor(
  auth: AuthUser,
  doctor: Pick<User, 'id' | 'clinicId'>,
): boolean {
  if (auth.role === 'admin' || auth.id === doctor.id) return true;
  if (doctor.clinicId == null) return false;
  return (
    (auth.role === 'clinic' || auth.role === 'registrar') &&
    clinicOf(auth) === doctor.clinicId
  );
}

export function requireRole(auth: AuthUser, ...roles: AuthUser['role'][]) {
  if (!roles.includes(auth.role))
    throw new ForbiddenException(`Only ${roles.join(' / ')}`);
}

/** Staff of a clinic (owner or registrar) — the "front desk". */
export const isFrontDesk = (auth: AuthUser) =>
  auth.role === 'clinic' || auth.role === 'registrar';
