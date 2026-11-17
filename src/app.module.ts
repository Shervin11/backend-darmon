import { Inject, Module, OnApplicationShutdown } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { JwtAuthGuard } from './auth';
import { BookingService } from './booking.service';
import { ChatService } from './chat.service';
import { DB, createDatabase } from './db';
import { NotifyService } from './notify/notify.service';
import { SmsService } from './notify/sms.service';
import { TelegramService } from './notify/telegram.service';
import { RemindersService } from './reminders.service';
import { UsersService } from './users.service';

const DB_CLOSE = Symbol('DB_CLOSE');

@Module({
  controllers: [AppController],
  providers: [
    {
      provide: 'DB_CONNECTION',
      // Tests run on a throwaway in-memory database
      useFactory: () =>
        createDatabase({ memory: process.env.DB_MEMORY === '1' }),
    },
    {
      provide: DB,
      useFactory: (c: { db: unknown }) => c.db,
      inject: ['DB_CONNECTION'],
    },
    {
      provide: DB_CLOSE,
      useFactory: (c: { close: () => Promise<void> }) => c.close,
      inject: ['DB_CONNECTION'],
    },
    TelegramService,
    SmsService,
    NotifyService,
    UsersService,
    BookingService,
    ChatService,
    RemindersService,
    { provide: APP_GUARD, useClass: JwtAuthGuard },
  ],
})
export class AppModule implements OnApplicationShutdown {
  constructor(
    @Inject(DB_CLOSE) private readonly closeDb: () => Promise<void>,
  ) {}

  async onApplicationShutdown() {
    await this.closeDb();
  }
}
