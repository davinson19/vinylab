import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UsuarioService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async create(createUsuarioDto: CreateUsuarioDto) {
    const saltOrRounds = 10;
    const hashedPassword = await bcrypt.hash(
      createUsuarioDto.contrasena,
      saltOrRounds,
    );

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
    return this.prisma.usuario.findMany({ include: { rol: true } });
  }

  findOne(id: number) {
    return this.prisma.usuario.findUnique({
      where: { id },
    });
  }

  async update(id: number, updateUsuarioDto: UpdateUsuarioDto) {
    const existing = await this.prisma.usuario.findUnique({ where: { id } });
    if (!existing) {
      throw new BadRequestException('Usuario no encontrado');
    }

    if (updateUsuarioDto.email && updateUsuarioDto.email !== existing.email) {
      const duplicate = await this.prisma.usuario.findUnique({
        where: { email: updateUsuarioDto.email },
      });
      if (duplicate) {
        throw new BadRequestException(
          'El correo electrónico ya está registrado por otro usuario',
        );
      }
    }

    if (updateUsuarioDto.contrasena) {
      if (updateUsuarioDto.contrasena === existing.contrasena) {
        // Si es el mismo hash, removerlo para no sobreescribir ni re-encriptar
        delete updateUsuarioDto.contrasena;
      } else {
        const saltOrRounds = 10;
        updateUsuarioDto.contrasena = await bcrypt.hash(
          updateUsuarioDto.contrasena,
          saltOrRounds,
        );
      }
    }

    const updatedUser = await this.prisma.usuario.update({
      where: { id },
      data: updateUsuarioDto,
      include: { rol: true },
    });

    const payload = {
      email: updatedUser.email,
      sub: updatedUser.id,
      rolId: updatedUser.rolId,
      rolName: updatedUser.rol?.nombre,
    };

    return {
      user: updatedUser,
      access_token: this.jwtService.sign(payload),
    };
  }

  remove(id: number) {
    return this.prisma.usuario.delete({
      where: { id },
    });
  }
}
