import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { json, urlencoded } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Aumentar el límite de tamaño para poder recibir imágenes en base64
  app.use(json({ limit: '10mb' }));
  app.use(urlencoded({ limit: '10mb', extended: true }));

  app.enableCors(); // Permitir peticiones desde el frontend (puerto 5173 por defecto en Vite)
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
