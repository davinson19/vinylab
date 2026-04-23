import { Module } from '@nestjs/common';
import { PedidoService } from './pedido.service';
import { PedidoController } from './pedido.controller';

@Module({
  providers: [PedidoService],
  controllers: [PedidoController]
})
export class PedidoModule {}
