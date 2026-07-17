import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import helmet from 'helmet';
import express from 'express';
import { ExpressAdapter } from '@nestjs/platform-express';

const server = express();

async function createServer() {
  const app = await NestFactory.create(
    AppModule,
    new ExpressAdapter(server),
    { logger: ['error', 'warn', 'log'] }
  );

  app.use(helmet({ contentSecurityPolicy: false }));
  
  app.enableCors({
    origin: '*',
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: false
  });
  
  app.setGlobalPrefix('v1', {
    exclude: ['health'],
  });
  
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    })
  );

  await app.init();
}

let isInitialized = false;

export default async (req: any, res: any) => {
  if (!isInitialized) {
    await createServer();
    isInitialized = true;
  }
  server(req, res);
};
