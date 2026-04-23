import { Module } from '@nestjs/common';
import { DetallePedidoService } from './detalle-pedido.service';
import { DetallePedidoController } from './detalle-pedido.controller';

@Module({
  providers: [DetallePedidoService],
  controllers: [DetallePedidoController]
})
export class DetallePedidoModule {}
