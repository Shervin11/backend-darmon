import './env';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { FILES_PREFIX, UPLOAD_DIR } from './files';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  // FRONTEND_URL may be a comma-separated list; when unset any origin is allowed (local development)
  app.enableCors({ origin: process.env.FRONTEND_URL?.split(',') ?? true });
  // Voice messages and avatars may still arrive as data URLs, so allow moderately large JSON bodies
  app.useBodyParser('json', { limit: '10mb' });
  // Uploaded files have random names; no directory listing, no dotfiles
  app.useStaticAssets(UPLOAD_DIR, {
    prefix: FILES_PREFIX,
    index: false,
    dotfiles: 'deny',
    maxAge: '7d',
  });
  app.enableShutdownHooks();
  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
