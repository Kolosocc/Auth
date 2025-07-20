import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import IORedis, { Redis } from 'ioredis';
import * as session from 'express-session';
import ms from 'ms';
import RedisStore from 'connect-redis';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = app.get(ConfigService);
  const redisClient = new IORedis(config.getOrThrow('REDIS_URI'));
  redisClient.connect().catch(console.error);

  app.use(cookieParser(config.getOrThrow('COOKIES_SECRET')));

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    })
  );

  app.use(
    session({
      secret: config.getOrThrow('SESSION_SECRET'),
      name: config.getOrThrow('SESSION_NAME'),
      resave: false,
      saveUninitialized: false,
      // @ts-ignore
      store: new RedisStore({
        client: redisClient,
        prefix: config.getOrThrow('SESSION_FOLDER'),
      }),
      cookie: {
        domain: config.getOrThrow('SESSION_DOMAIN'),
        secure: parseBoolean(config.getOrThrow('SESSION_SECURE')),
        httpOnly: parseBoolean(config.getOrThrow('SESSION_HTTP_ONLY')),
        sameSite: 'lax',
        maxAge: parseInt(ms(config.getOrThrow('SESSION_MAX_AGE'))),
      },
    })
  );

  app.enableCors({
    origin: config.getOrThrow('ALLOWED_ORIGIN'),
    credentials: true,
    exposedHeaders: ['set-cookie'],
  });

  await app.listen(config.getOrThrow('APPLICATION_PORT') ?? 3000);
}

bootstrap();
