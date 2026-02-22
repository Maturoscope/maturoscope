import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { json, urlencoded } from 'express';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { join } from 'path';
import { requestIdMiddleware } from './common/middleware/request-id.middleware';
import { StructuredLoggerService } from './common/logger/structured-logger.service';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.use(requestIdMiddleware);

  // Increase body size limit to handle base64-encoded PDF attachments (~5 MB)
  app.use(json({ limit: '5mb' }));
  app.use(urlencoded({ limit: '5mb', extended: true }));

  // Serve static files from public directory
  app.useStaticAssets(join(__dirname, '..', 'public'), {
    prefix: '/public/',
  });
  
  // Configure global validations
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Configure CORS
  app.enableCors();

  // Swagger/OpenAPI Configuration
  const isProduction = process.env.NODE_ENV === 'production';
  const swaggerPath = isProduction ? 'api-docs' : 'api';
  
  const config = new DocumentBuilder()
    .setTitle('Maturoscope API')
    .setDescription('API for Maturoscope - Maturity Assessment Platform')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'Enter your JWT token obtained from Auth0',
        in: 'header',
      },
      'JWT-auth',
    )
    .addServer(process.env.API_BASE_URL || 'http://localhost:8000', 'Current Environment')
    .addServer('https://api.staging.maturoscope.io', 'Staging (OVH MKS GRA)')
    .addServer('https://api.maturoscope.com', 'Production (OVH MKS GRA)')
    .addTag('users', 'User management endpoints')
    .addTag('organizations', 'Organization management endpoints')
    .addTag('services', 'Service management endpoints')
    .addTag('statistics', 'Statistics and analytics endpoints')
    .addTag('readiness-assessment', 'Readiness assessment endpoints (TRL, MkRL, MfRL)')
    .addTag('report', 'PDF report generation endpoints')
    .addTag('user-invitation', 'User invitation and onboarding endpoints')
    .addTag('auth0', 'Auth0 integration endpoints')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(swaggerPath, app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'none',
      filter: true,
      showRequestDuration: true,
      syntaxHighlight: {
        activate: true,
        theme: 'monokai',
      },
    },
    customSiteTitle: 'Maturoscope API Docs',
    customfavIcon: '/public/favicon.ico',
    customCss: `
      .swagger-ui .topbar { display: none }
      .swagger-ui .info { margin: 30px 0; }
      .swagger-ui .info .title { font-size: 2.5em; }
    `,
  });

  const port = process.env.PORT || 8000;
  await app.listen(port);

  const logger = app.get(StructuredLoggerService);
  logger.info('API started', { port, swaggerPath });
}
bootstrap();
