import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  
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
    .addServer('https://api-maturoscope.osc-fr1.scalingo.io', 'Staging')
    .addServer('https://api.maturoscope.com', 'Production')
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

  // Log Swagger URL
  const port = process.env.PORT || 8000;
  console.log(`📚 Swagger documentation available at: http://localhost:${port}/${swaggerPath}`);

  await app.listen(port);
}
bootstrap();
