import { setDefaultResultOrder } from 'dns';
setDefaultResultOrder('ipv4first');

import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { join } from 'path';
import helmet from 'helmet';
import { AppModule } from './app.module';

const logger = new Logger('Bootstrap');

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    // Suppress verbose startup logs in production
    logger: process.env.NODE_ENV === 'production'
      ? ['error', 'warn', 'log']
      : ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  app.useStaticAssets(join(__dirname, '..', 'public'), { prefix: '/public' });

  // ── Security headers ───────────────────────────────────────────────────────
  // helmet sets Content-Security-Policy, X-Frame-Options, HSTS, etc.
  // Relax CSP for Swagger UI in non-production environments.
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      contentSecurityPolicy: process.env.NODE_ENV === 'production'
        ? undefined          // use helmet's strict default
        : false,             // disabled so Swagger UI loads its inline scripts
    })
  );

  // ── CORS ───────────────────────────────────────────────────────────────────
  // Allow all origins for MVP — tighten to an allowlist before GA.
  app.enableCors({
    origin: '*',
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: false, // must be false when origin is '*'
  });

  // ── Global prefix ──────────────────────────────────────────────────────────
  // All routes are served under /v1 (e.g. /v1/auth/login, /v1/books)
  // Health endpoint is excluded so Railway/Docker can reach it without the prefix.
  app.setGlobalPrefix('v1', {
    exclude: ['health'],
  });

  // ── Validation ─────────────────────────────────────────────────────────────
  app.useGlobalPipes(
    new ValidationPipe({
      // Strip any properties not declared in the DTO
      whitelist: true,
      // Reject requests that include extra properties
      forbidNonWhitelisted: true,
      // Auto-transform payloads to DTO class instances (enables @Type decorators)
      transform: true,
      transformOptions: {
        // Allow plain numbers/booleans in query strings to be coerced
        enableImplicitConversion: true,
      },
    })
  );

  // ── Swagger / OpenAPI ──────────────────────────────────────────────────────
  // Only exposed in non-production environments.
  if (process.env.NODE_ENV !== 'production') {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('BUKOO API')
      .setDescription('BUKOO Digital Reading Platform — REST API')
      .setVersion('1.0')
      .addBearerAuth(
        { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
        'access-token'
      )
      .addServer(`http://localhost:${process.env.PORT ?? 3000}`, 'Local')
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
        tagsSorter: 'alpha',
        operationsSorter: 'alpha',
      },
    });
  }

  // ── Start ──────────────────────────────────────────────────────────────────
  const port = parseInt(process.env.PORT ?? '3000', 10);
  await app.listen(port, '0.0.0.0'); // bind to all interfaces inside Docker
  logger.log(`Listening on http://0.0.0.0:${port}/v1`);
  if (process.env.NODE_ENV !== 'production') {
    logger.log(`Swagger docs → http://localhost:${port}/docs`);
  }
}

bootstrap();
