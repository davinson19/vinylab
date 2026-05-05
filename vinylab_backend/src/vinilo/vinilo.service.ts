import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateViniloDto } from './dto/create-vinilo.dto';
import { UpdateViniloDto } from './dto/update-vinilo.dto';

@Injectable()
export class ViniloService {
  constructor(private readonly prisma: PrismaService) {}

  create(createViniloDto: CreateViniloDto) {
    return this.prisma.vinilo.create({
      data: createViniloDto,
    });
  }

  findAll() {
    return this.prisma.vinilo.findMany();
  }

  findOne(id: number) {
    return this.prisma.vinilo.findUnique({
      where: { id },
    });
  }

  update(id: number, updateViniloDto: UpdateViniloDto) {
    return this.prisma.vinilo.update({
      where: { id },
      data: updateViniloDto,
    });
  }

  remove(id: number) {
    return this.prisma.vinilo.delete({
      where: { id },
    });
  }
}
