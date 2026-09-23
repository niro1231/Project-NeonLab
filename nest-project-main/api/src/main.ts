import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Lets us read `request.cookies` (that is where the JWT lives).
  app.use(cookieParser());

  // Every route is served under /api, e.g. /api/auth/login
  app.setGlobalPrefix('api');

  // Rejects any request body that breaks the DTO rules, and drops
  // properties we did not ask for.
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // The browser only sends cookies cross-domain when the exact frontend
  // origin is allowed and credentials are switched on.
  const allowedOrigins = (process.env.CORS_ORIGIN ?? 'http://localhost:3000')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  });

  const port = process.env.PORT ?? 4000;
  await app.listen(port, '0.0.0.0');
  console.log(`API running on port ${port}`);
}

await bootstrap();
