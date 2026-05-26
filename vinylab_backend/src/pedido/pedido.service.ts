import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePedidoDto } from './dto/create-pedido.dto';
import { UpdatePedidoDto } from './dto/update-pedido.dto';

@Injectable()
export class PedidoService {
  constructor(private readonly prisma: PrismaService) {}

  create(createPedidoDto: CreatePedidoDto) {
    const { vinilos, ...pedidoData } = createPedidoDto;
    return this.prisma.pedido.create({
      data: {
        ...pedidoData,
        vinilos: vinilos ? {
          create: vinilos.map(v => ({
            viniloId: v.viniloId,
            cantidad: v.cantidad
          }))
        } : undefined
      },
      include: {
        vinilos: {
          include: {
            vinilo: {
              include: {
                artista: true
              }
            }
          }
        }
      }
    });
  }

  findAll() {
    return this.prisma.pedido.findMany({
      include: {
        vinilos: {
          include: {
            vinilo: {
              include: {
                artista: true
              }
            }
          }
        },
        usuario: true
      }
    });
  }

  findByUsuario(usuarioId: number) {
    return this.prisma.pedido.findMany({
      where: { usuarioId },
      include: {
        vinilos: {
          include: {
            vinilo: {
              include: {
                artista: true
              }
            }
          }
        }
      },
    });
  }

  findOne(id: number) {
    return this.prisma.pedido.findUnique({
      where: { id },
    });
  }

  update(id: number, updatePedidoDto: UpdatePedidoDto) {
    const { vinilos, usuarioId, ...pedidoData } = updatePedidoDto;
    return this.prisma.pedido.update({
      where: { id },
      data: {
        ...pedidoData,
        ...(usuarioId ? { usuario: { connect: { id: usuarioId } } } : {}),
      },
    });
  }

  remove(id: number) {
    return this.prisma.pedido.delete({
      where: { id },
    });
  }
}
