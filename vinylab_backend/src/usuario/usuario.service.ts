import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';

@Injectable()
export class UsuarioService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createUsuarioDto: CreateUsuarioDto) {
    const saltOrRounds = 10;
    const hashedPassword = await bcrypt.hash(createUsuarioDto.contrasena, saltOrRounds);
    
    return this.prisma.usuario.create({
      data: {
        ...createUsuarioDto,
        contrasena: hashedPassword,
      },
    });
  }

  findByEmail(email: string) {
    return this.prisma.usuario.findUnique({
      where: { email },
      include: { rol: true },
    });
  }

  findAll() {
    return this.prisma.usuario.findMany();
  }

  findOne(id: number) {
    return this.prisma.usuario.findUnique({
      where: { id },
    });
  }

  async update(id: number, updateUsuarioDto: UpdateUsuarioDto) {
    if (updateUsuarioDto.contrasena) {
      const saltOrRounds = 10;
      updateUsuarioDto.contrasena = await bcrypt.hash(updateUsuarioDto.contrasena, saltOrRounds);
    }
    
    return this.prisma.usuario.update({
      where: { id },
      data: updateUsuarioDto,
    });
  }

  remove(id: number) {
    return this.prisma.usuario.delete({
      where: { id },
    });
  }
}
