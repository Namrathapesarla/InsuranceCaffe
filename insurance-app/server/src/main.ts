import * as dotenv from 'dotenv';
dotenv.config();

import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: true,
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Schema'],
  });
  app.setGlobalPrefix('api');
  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`NestJS server running on http://localhost:${port}`);
}
bootstrap();
