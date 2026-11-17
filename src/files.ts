import { BadRequestException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

/** Uploaded files live on disk and are served from /files/<random name>. */
export const UPLOAD_DIR =
  process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads');
export const FILES_PREFIX = '/files/';

const EXTENSIONS: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'application/pdf': 'pdf',
  'audio/webm': 'webm',
  'audio/ogg': 'ogg',
  'audio/mpeg': 'mp3',
  'audio/mp4': 'm4a',
  'audio/wav': 'wav',
};

/** Stores a file under an unguessable name and returns its path (e.g. "/files/<uuid>.jpg"). */
export function saveFile(buffer: Buffer, mimetype: string): string {
  const ext = EXTENSIONS[mimetype.split(';')[0].trim()];
  if (!ext) throw new BadRequestException('Unsupported file type');
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  const name = `${randomUUID()}.${ext}`;
  fs.writeFileSync(path.join(UPLOAD_DIR, name), buffer);
  return FILES_PREFIX + name;
}

/** Saves a "data:<mime>;base64,..." URL as a file; other values are returned unchanged. */
export function saveDataUrl(
  value: string | null | undefined,
): string | null | undefined {
  const match = value?.match(/^data:([^;,]+)(?:;[^,]*)?;base64,(.*)$/s);
  if (!match) return value;
  return saveFile(Buffer.from(match[2], 'base64'), match[1]);
}

const publicBase = () =>
  (
    process.env.PUBLIC_URL ||
    process.env.RENDER_EXTERNAL_URL ||
    `http://localhost:${process.env.PORT || 3001}`
  ).replace(/\/$/, '');

/** Absolute URL for API responses; external URLs and empty values pass through. */
export function publicUrl(value: string | null | undefined): string {
  if (!value) return '';
  if (!value.startsWith(FILES_PREFIX)) return value;
  return publicBase() + value;
}

/**
 * Value to store for a file field sent by a client: data URLs are saved to disk,
 * our own absolute file URLs (echoed back from a response) become relative paths again.
 */
export function storedFile(value: string): string {
  const base = publicBase();
  if (value.startsWith(base + FILES_PREFIX)) return value.slice(base.length);
  return saveDataUrl(value) ?? '';
}
