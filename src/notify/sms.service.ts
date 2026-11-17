import { Injectable, Logger } from '@nestjs/common';

/**
 * SMS gateway adapter.
 *   SMS_PROVIDER unset → SMS disabled
 *   SMS_PROVIDER=console → messages are only logged (development)
 *   SMS_PROVIDER=http → POST {to, text} as JSON to SMS_HTTP_URL with "Authorization: Bearer SMS_HTTP_TOKEN".
 *     Adapt `sendHttp` to your provider's API (most local gateways accept a similar request).
 */
@Injectable()
export class SmsService {
  private readonly logger = new Logger('SMS');
  private readonly provider = process.env.SMS_PROVIDER;

  get enabled(): boolean {
    return (
      this.provider === 'console' ||
      (this.provider === 'http' && !!process.env.SMS_HTTP_URL)
    );
  }

  /** Never throws: a failed SMS must not break the request that triggered it. */
  async send(phone: string, text: string): Promise<boolean> {
    if (!this.enabled || !phone) return false;
    try {
      if (this.provider === 'console') {
        this.logger.log(`→ ${phone}: ${text}`);
        return true;
      }
      return await this.sendHttp(phone, text);
    } catch (e) {
      this.logger.warn(`SMS to ${phone} failed: ${(e as Error).message}`);
      return false;
    }
  }

  private async sendHttp(phone: string, text: string): Promise<boolean> {
    const res = await fetch(process.env.SMS_HTTP_URL!, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(process.env.SMS_HTTP_TOKEN
          ? { Authorization: `Bearer ${process.env.SMS_HTTP_TOKEN}` }
          : {}),
      },
      body: JSON.stringify({
        to: phone,
        text,
        sender: process.env.SMS_SENDER || 'DARMON',
      }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
    return true;
  }
}
