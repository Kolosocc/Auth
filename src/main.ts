import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import * as express from 'express'; // Добавляем express
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import IORedis from 'ioredis';
import * as session from 'express-session';
import * as ms from 'ms';
import { type StringValue } from 'ms';
import RedisStore from 'connect-redis';
import { parseBoolean } from './libs/common/utils/parse-boolean';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = app.get(ConfigService);

  // Явно добавляем парсер JSON
  app.use(express.json());

  const redisClient = new IORedis({
    host: config.get('REDIS_HOST', 'localhost'),
    port: config.get('REDIS_PORT', 6379),
    password: config.get('REDIS_PASSWORD') || undefined,
  });

  redisClient.on('error', (err) => {
    console.error('Redis Client Error:', err);
  });

  redisClient.on('connect', () => {
    console.log('Redis Client Connected');
  });

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
      store: new RedisStore({
        client: redisClient,
        prefix: config.getOrThrow('SESSION_FOLDER'),
      }),
      cookie: {
        domain: config.getOrThrow('SESSION_DOMAIN'),
        secure: parseBoolean(config.getOrThrow('SESSION_SECURE')),
        httpOnly: parseBoolean(config.getOrThrow('SESSION_HTTP_ONLY')),
        sameSite: 'lax',
        maxAge: ms(config.getOrThrow<StringValue>('SESSION_MAX_AGE')),
      },
    })
  );

  app.enableCors({
    origin: config.getOrThrow('ALLOWED_ORIGIN'),
    credentials: true,
    exposedHeaders: ['set-cookie'],
  });

  await app.listen(config.getOrThrow('APPLICATION_PORT') ?? 4000);
}

bootstrap();
