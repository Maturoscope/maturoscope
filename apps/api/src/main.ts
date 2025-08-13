import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(8000);
  console.log(`API listening on port 8000`);
}
bootstrap();
// change// Test Docker Hub push
