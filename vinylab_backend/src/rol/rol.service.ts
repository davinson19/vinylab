import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRolDto } from './dto/create-rol.dto';
import { UpdateRolDto } from './dto/update-rol.dto';

@Injectable()
export class RolService {
  constructor(private readonly prisma: PrismaService) {}

  create(createRolDto: CreateRolDto) {
    return this.prisma.rol.create({
      data: createRolDto,
    });
  }

  findAll() {
    return this.prisma.rol.findMany();
  }

  findOne(id: number) {
    return this.prisma.rol.findUnique({
      where: { id },
    });
  }

  update(id: number, updateRolDto: UpdateRolDto) {
    return this.prisma.rol.update({
      where: { id },
      data: updateRolDto,
    });
  }

  remove(id: number) {
    return this.prisma.rol.delete({
      where: { id },
    });
  }
}
