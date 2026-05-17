import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, Req, ForbiddenException } from '@nestjs/common';
import { PedidoService } from './pedido.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { CreatePedidoDto } from './dto/create-pedido.dto';
import { UpdatePedidoDto } from './dto/update-pedido.dto';

@Roles('Admin')
@Controller('pedido')
export class PedidoController {
  constructor(private readonly pedidoService: PedidoService) {}

  @Roles('Cliente')
  @Post()
  create(@Body() createPedidoDto: CreatePedidoDto, @Req() req: any) {
    // Si queremos obligar a que el pedido se asigne al usuario logueado:
    createPedidoDto.usuarioId = req.user.userId;
    return this.pedidoService.create(createPedidoDto);
  }

  @Roles('Admin', 'Cliente')
  @Get()
  findAll(@Req() req: any) {
    if (req.user.rolName === 'Cliente') {
      return this.pedidoService.findByUsuario(req.user.userId);
    }
    return this.pedidoService.findAll();
  }

  @Roles('Admin', 'Cliente')
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    const pedido = await this.pedidoService.findOne(id);
    if (req.user.rolName === 'Cliente' && pedido?.usuarioId !== req.user.userId) {
      throw new ForbiddenException('No tienes permiso para ver este pedido');
    }
    return pedido;
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updatePedidoDto: UpdatePedidoDto) {
    return this.pedidoService.update(id, updatePedidoDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.pedidoService.remove(id);
  }
}
