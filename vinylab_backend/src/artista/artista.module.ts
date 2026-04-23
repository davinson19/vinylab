import { Module } from '@nestjs/common';
import { ArtistaService } from './artista.service';
import { ArtistaController } from './artista.controller';

@Module({
  providers: [ArtistaService],
  controllers: [ArtistaController]
})
export class ArtistaModule {}
