import { Inject, Injectable } from '@nestjs/common';
import { inArray } from 'drizzle-orm';
import { DB, type Database, schema } from '../db';
import type { Appointment, User } from '../db/schema';
import { SmsService } from './sms.service';
import { TelegramService } from './telegram.service';
import { texts, textsFor } from './texts';

type Texts = (typeof texts)['tj'];
type Recipient = Pick<User, 'telegramChatId' | 'phone' | 'lang'>;

/** Delivers notifications over Telegram (preferred) or SMS (fallback for patients). */
@Injectable()
export class NotifyService {
  constructor(
    @Inject(DB) private readonly db: Database,
    private readonly telegram: TelegramService,
    private readonly sms: SmsService,
  ) {}

  /** Sends to a user: Telegram if linked, otherwise SMS when allowed. Returns whether anything was sent. */
  async send(
    to: Recipient,
    build: (t: Texts) => string,
    { sms = false } = {},
  ): Promise<boolean> {
    const text = build(textsFor(to.lang));
    if (
      to.telegramChatId &&
      (await this.telegram.send(to.telegramChatId, text))
    )
      return true;
    if (sms && to.phone) return this.sms.send(to.phone, text);
    return false;
  }

  /**
   * Notification about a visit. Patients without an account (booked by phone) are reached by SMS.
   * `who` selects the recipients.
   */
  async visit(
    a: Appointment,
    who: 'patient' | 'doctor' | 'both',
    build: (t: Texts) => string,
  ) {
    const ids = [
      who !== 'doctor' ? a.clientId : null,
      who !== 'patient' ? a.doctorId : null,
    ].filter((id): id is number => id != null);
    const users = ids.length
      ? await this.db
          .select()
          .from(schema.users)
          .where(inArray(schema.users.id, ids))
      : [];
    const patient = users.find((u) => u.id === a.clientId);
    const doctor = users.find((u) => u.id === a.doctorId);

    if (who !== 'doctor') {
      if (patient) await this.send(patient, build, { sms: true });
      else if (a.clientPhone)
        await this.send(
          { telegramChatId: null, phone: a.clientPhone, lang: 'tj' },
          build,
          { sms: true },
        );
    }
    if (who !== 'patient' && doctor) await this.send(doctor, build);
  }
}
