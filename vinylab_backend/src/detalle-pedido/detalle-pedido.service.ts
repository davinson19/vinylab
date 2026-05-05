import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDetallePedidoDto } from './dto/create-detalle-pedido.dto';
import { UpdateDetallePedidoDto } from './dto/update-detalle-pedido.dto';

@Injectable()
export class DetallePedidoService {
  constructor(private readonly prisma: PrismaService) {}

  create(createDetallePedidoDto: CreateDetallePedidoDto) {
    return this.prisma.detallePedido.create({
      data: createDetallePedidoDto,
    });
  }

  findAll() {
    return this.prisma.detallePedido.findMany();
  }

  findOne(id: number) {
    return this.prisma.detallePedido.findUnique({
      where: { id },
    });
  }

  update(id: number, updateDetallePedidoDto: UpdateDetallePedidoDto) {
    return this.prisma.detallePedido.update({
      where: { id },
      data: updateDetallePedidoDto,
    });
  }

  remove(id: number) {
    return this.prisma.detallePedido.delete({
      where: { id },
    });
  }
}
