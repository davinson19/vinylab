import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateArtistaDto } from './dto/create-artista.dto';
import { UpdateArtistaDto } from './dto/update-artista.dto';

@Injectable()
export class ArtistaService {
  constructor(private readonly prisma: PrismaService) {}

  create(createArtistaDto: CreateArtistaDto) {
    return this.prisma.artista.create({
      data: createArtistaDto,
    });
  }

  findAll() {
    return this.prisma.artista.findMany();
  }

  findOne(id: number) {
    return this.prisma.artista.findUnique({
      where: { id },
    });
  }

  update(id: number, updateArtistaDto: UpdateArtistaDto) {
    return this.prisma.artista.update({
      where: { id },
      data: updateArtistaDto,
    });
  }

  remove(id: number) {
    return this.prisma.artista.delete({
      where: { id },
    });
  }
}
