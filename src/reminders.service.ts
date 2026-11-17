import {
  Injectable,
  Logger,
  OnApplicationBootstrap,
  OnModuleDestroy,
} from '@nestjs/common';
import { BookingService } from './booking.service';
import { TelegramService } from './notify/telegram.service';
import { UsersService } from './users.service';

const CHECK_EVERY_MS = 60 * 1000;

/** Starts the Telegram bot and checks for due visit reminders every minute. */
@Injectable()
export class RemindersService
  implements OnApplicationBootstrap, OnModuleDestroy
{
  private readonly logger = new Logger('Reminders');
  private timer?: NodeJS.Timeout;

  constructor(
    private readonly telegram: TelegramService,
    private readonly users: UsersService,
    private readonly booking: BookingService,
  ) {}

  onApplicationBootstrap() {
    if (process.env.NODE_ENV === 'test') return;
    void this.telegram.start((chatId, code) =>
      this.users.linkTelegram(code, chatId),
    );
    this.timer = setInterval(() => void this.tick(), CHECK_EVERY_MS);
  }

  private async tick() {
    try {
      const sent = await this.booking.sendDueReminders();
      if (sent) this.logger.log(`Sent ${sent} reminder(s)`);
    } catch (e) {
      this.logger.error(`Reminder check failed: ${(e as Error).message}`);
    }
  }

  onModuleDestroy() {
    clearInterval(this.timer);
  }
}
