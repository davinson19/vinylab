import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { json, urlencoded } from 'express';
import { ValidationPipe } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Aumentar el límite de tamaño para poder recibir imágenes en base64
  app.use(json({ limit: '10mb' }));
  app.use(urlencoded({ limit: '10mb', extended: true }));

  // Habilitar validaciones globales para los DTOs
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  app.enableCors(); // Permitir peticiones desde el frontend

  // Servir archivos estáticos del frontend
  let publicPath = path.join(__dirname, '..', '..', 'public');
  if (!fs.existsSync(publicPath)) {
    publicPath = path.join(__dirname, '..', 'public');
  }

  if (fs.existsSync(publicPath)) {
    app.use(express.static(publicPath));

    // Redireccionar rutas que no son de API ni archivos estáticos al index.html del frontend (SPA)
    app.use((req, res, next) => {
      const apiRoutes = [
        '/usuario',
        '/vinilo',
        '/artista',
        '/pedido',
        '/auth',
        '/rol',
        '/categoria',
      ];
      const isApi = apiRoutes.some((route) => req.path.startsWith(route));
      if (isApi || req.path.includes('.')) {
        return next();
      }
      res.sendFile(path.join(publicPath, 'index.html'));
    });
  }

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
