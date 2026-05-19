import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors(); // Permitir peticiones desde el frontend (puerto 5173 por defecto en Vite)
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
