import {
  CanActivate,
  ExecutionContext,
  Injectable,
  SetMetadata,
  UnauthorizedException,
  createParamDecorator,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { randomBytes, scryptSync, timingSafeEqual } from 'crypto';
import * as jwt from 'jsonwebtoken';

export type Role = 'admin' | 'clinic' | 'registrar' | 'doctor' | 'client';

export interface AuthUser {
  id: number;
  role: Role;
  clinicId: number | null;
}

const JWT_SECRET = process.env.JWT_SECRET || 'darmon-dev-secret-change-me';
if (!process.env.JWT_SECRET) {
  console.warn(
    '[auth] JWT_SECRET is not set — using an insecure development secret',
  );
}

export function signToken(user: Record<string, any>): string {
  return jwt.sign(
    { id: user.id, role: user.role, clinicId: user.clinicId ?? null },
    JWT_SECRET,
    {
      expiresIn: '7d',
    },
  );
}

function verifyToken(header?: string): AuthUser | null {
  if (!header?.startsWith('Bearer ')) return null;
  try {
    const { id, role, clinicId } = jwt.verify(
      header.slice(7).trim(),
      JWT_SECRET,
    ) as AuthUser;
    return { id: Number(id), role, clinicId: clinicId ?? null };
  } catch {
    return null;
  }
}

// ── Passwords (scrypt, stored as "scrypt$salt$hash") ──
export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  return `scrypt$${salt}$${scryptSync(password, salt, 64).toString('hex')}`;
}

export function isHashed(stored: string): boolean {
  return stored.startsWith('scrypt$');
}

export function verifyPassword(password: string, stored: string): boolean {
  const [, salt, hash] = stored.split('$');
  if (!salt || !hash) return false;
  const expected = Buffer.from(hash, 'hex');
  const actual = scryptSync(password, salt, expected.length);
  return timingSafeEqual(actual, expected);
}

// ── Guard: every route requires a valid token unless marked @Public() ──
const IS_PUBLIC = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC, true);

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(ctx: ExecutionContext): boolean {
    const req = ctx.switchToHttp().getRequest();
    req.user = verifyToken(req.headers.authorization);
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC, [
      ctx.getHandler(),
      ctx.getClass(),
    ]);
    if (!isPublic && !req.user)
      throw new UnauthorizedException('Authorization required');
    return true;
  }
}

/** Current user from the token (null on public routes without a token). */
export const CurrentUser = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): AuthUser | null =>
    ctx.switchToHttp().getRequest().user ?? null,
);
