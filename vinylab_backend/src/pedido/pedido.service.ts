import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePedidoDto } from './dto/create-pedido.dto';
import { UpdatePedidoDto } from './dto/update-pedido.dto';

@Injectable()
export class PedidoService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createPedidoDto: CreatePedidoDto) {
    const { vinilos, ...pedidoData } = createPedidoDto;
    
    // Create the order
    const pedido = await this.prisma.pedido.create({
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

    // Check if the order is established as PENDIENTE_ENVIO (default, or explicitly set)
    const isPaid = !createPedidoDto.estado || createPedidoDto.estado === 'PENDIENTE_ENVIO';
    if (isPaid && vinilos && vinilos.length > 0) {
      for (const item of vinilos) {
        const vinilo = await this.prisma.vinilo.findUnique({
          where: { id: item.viniloId }
        });
        if (vinilo) {
          const newStock = Math.max(0, vinilo.stock - item.cantidad);
          await this.prisma.vinilo.update({
            where: { id: item.viniloId },
            data: { stock: newStock }
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

  async update(id: number, updatePedidoDto: UpdatePedidoDto) {
    const { vinilos, usuarioId, ...pedidoData } = updatePedidoDto;

    // 1. Get the current order and its items before updating
    const oldPedido = await this.prisma.pedido.findUnique({
      where: { id },
      include: { vinilos: true }
    });

    if (!oldPedido) {
      throw new Error('Pedido no encontrado');
    }

    // 2. Check if transitioning to PENDIENTE_ENVIO, ENVIADO or ENTREGADO
    const willBePaid = updatePedidoDto.estado === 'PENDIENTE_ENVIO' || updatePedidoDto.estado === 'ENVIADO' || updatePedidoDto.estado === 'ENTREGADO';
    const wasPaid = oldPedido.estado === 'PENDIENTE_ENVIO' || oldPedido.estado === 'ENVIADO' || oldPedido.estado === 'ENTREGADO';

    if (willBePaid && !wasPaid) {
      // Transition to paid: subtract stock
      for (const item of oldPedido.vinilos) {
        const vinilo = await this.prisma.vinilo.findUnique({
          where: { id: item.viniloId }
        });
        if (vinilo) {
          const newStock = Math.max(0, vinilo.stock - item.cantidad);
          await this.prisma.vinilo.update({
            where: { id: item.viniloId },
            data: { stock: newStock }
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
