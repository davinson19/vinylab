import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePedidoDto } from './dto/create-pedido.dto';
import { UpdatePedidoDto } from './dto/update-pedido.dto';

@Injectable()
export class PedidoService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createPedidoDto: CreatePedidoDto) {
    const { vinilos, ...pedidoData } = createPedidoDto;

    // Crea el pedido
    const pedido = await this.prisma.pedido.create({
      data: {
        ...pedidoData,
        vinilos: vinilos
          ? {
              create: vinilos.map((v) => ({
                viniloId: v.viniloId,
                cantidad: v.cantidad,
              })),
            }
          : undefined,
      },
      include: {
        vinilos: {
          include: {
            vinilo: {
              include: {
                artista: true,
              },
            },
          },
        },
      },
    });

    // Comprueba si el pedido está establecido como PENDIENTE_ENVIO
    const isPaid =
      !createPedidoDto.estado || createPedidoDto.estado === 'PENDIENTE_ENVIO';
    if (isPaid && vinilos && vinilos.length > 0) {
      for (const item of vinilos) {
        const vinilo = await this.prisma.vinilo.findUnique({
          where: { id: item.viniloId },
        });
        if (vinilo) {
          const newStock = Math.max(0, vinilo.stock - item.cantidad);
          await this.prisma.vinilo.update({
            where: { id: item.viniloId },
            data: { stock: newStock },
          });
        }
      }
    }

    return pedido;
  }

  findAll() {
    return this.prisma.pedido.findMany({
      include: {
        vinilos: {
          include: {
            vinilo: {
              include: {
                artista: true,
              },
            },
          },
        },
        usuario: true,
      },
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
                artista: true,
              },
            },
          },
        },
      },
    });
  }

  findOne(id: number) {
    return this.prisma.pedido.findUnique({
      where: { id },
    });
  }

  async update(id: number, updatePedidoDto: UpdatePedidoDto) {
    const { vinilos, usuarioId, ...pedidoData } = updatePedidoDto;

    // Busca el pedido actual y sus items antes de actualizar
    const pedidoAnterior = await this.prisma.pedido.findUnique({
      where: { id },
      include: { vinilos: true },
    });

    if (!pedidoAnterior) {
      throw new Error('Pedido no encontrado');
    }

    // Comprueba si se está pasando a PENDIENTE_ENVIO, ENVIADO o ENTREGADO
    const estaPagado =
      updatePedidoDto.estado === 'PENDIENTE_ENVIO' ||
      updatePedidoDto.estado === 'ENVIADO' ||
      updatePedidoDto.estado === 'ENTREGADO';
    const yaEstabaPagado =
      pedidoAnterior.estado === 'PENDIENTE_ENVIO' ||
      pedidoAnterior.estado === 'ENVIADO' ||
      pedidoAnterior.estado === 'ENTREGADO';

    if (estaPagado && !yaEstabaPagado) {
      // Transición a pagado: resta el stock
      for (const item of pedidoAnterior.vinilos) {
        const vinilo = await this.prisma.vinilo.findUnique({
          where: { id: item.viniloId },
        });
        if (vinilo) {
          const stockActualizado = Math.max(0, vinilo.stock - item.cantidad);
          await this.prisma.vinilo.update({
            where: { id: item.viniloId },
            data: { stock: stockActualizado },
          });
        }
      }
    }

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
