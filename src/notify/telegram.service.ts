import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';

type StartHandler = (
  chatId: number,
  payload: string,
) => string | Promise<string>;

/**
 * Minimal Telegram Bot API client: sends messages and receives "/start <code>"
 * via long polling (no public webhook URL needed). Disabled when TELEGRAM_BOT_TOKEN is unset.
 */
@Injectable()
export class TelegramService implements OnModuleDestroy {
  private readonly logger = new Logger('Telegram');
  private readonly token = process.env.TELEGRAM_BOT_TOKEN;
  private username: string | null = null;
  private polling = false;
  private offset = 0;

  get enabled(): boolean {
    return !!this.token;
  }

  /** Bot username, used to build https://t.me/<bot>?start=<code> links. */
  get botUsername(): string | null {
    return this.username;
  }

  private async call<T>(method: string, body: object = {}): Promise<T> {
    const res = await fetch(
      `https://api.telegram.org/bot${this.token}/${method}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      },
    );
    const data = (await res.json()) as {
      ok: boolean;
      result: T;
      description?: string;
    };
    if (!data.ok) throw new Error(`${method}: ${data.description}`);
    return data.result;
  }

  /** Sends a text message; never throws (a failed notification must not break the request). */
  async send(chatId: number, text: string): Promise<boolean> {
    if (!this.enabled) return false;
    try {
      await this.call('sendMessage', { chat_id: chatId, text });
      return true;
    } catch (e) {
      this.logger.warn(
        `sendMessage to ${chatId} failed: ${(e as Error).message}`,
      );
      return false;
    }
  }

  /** Starts long polling and calls `onStart` for every "/start [payload]" message; the returned text is the reply. */
  async start(onStart: StartHandler) {
    if (!this.enabled || this.polling) return;
    try {
      this.username = (await this.call<{ username: string }>('getMe')).username;
    } catch (e) {
      this.logger.error(`Bot token rejected: ${(e as Error).message}`);
      return;
    }
    this.polling = true;
    this.logger.log(`Polling as @${this.username}`);
    void this.loop(onStart);
  }

  private async loop(onStart: StartHandler) {
    while (this.polling) {
      try {
        const updates = await this.call<
          {
            update_id: number;
            message?: { chat: { id: number }; text?: string };
          }[]
        >('getUpdates', {
          offset: this.offset,
          timeout: 25,
          allowed_updates: ['message'],
        });
        for (const u of updates) {
          this.offset = u.update_id + 1;
          const text = u.message?.text || '';
          if (u.message && text.startsWith('/start')) {
            await this.send(
              u.message.chat.id,
              await onStart(u.message.chat.id, text.slice(6).trim()),
            );
          }
        }
      } catch (e) {
        this.logger.warn(`getUpdates failed: ${(e as Error).message}`);
        await new Promise((r) => setTimeout(r, 5000));
      }
    }
  }

  onModuleDestroy() {
    this.polling = false;
  }
}
