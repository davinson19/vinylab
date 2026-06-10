import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  Req,
  ForbiddenException,
} from '@nestjs/common';
import { UsuarioService } from './usuario.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';

@Roles('Admin')
@Controller('usuario')
export class UsuarioController {
  constructor(private readonly usuarioService: UsuarioService) {}

  @Post()
  create(@Body() createUsuarioDto: CreateUsuarioDto) {
    return this.usuarioService.create(createUsuarioDto);
  }

  @Get()
  findAll() {
    return this.usuarioService.findAll();
  }

  @Roles('Admin', 'Cliente')
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    if (req.user.rolName === 'Cliente' && req.user.userId !== id) {
      throw new ForbiddenException('No puedes ver un perfil ajeno');
    }
    return this.usuarioService.findOne(id);
  }

  @Roles('Admin', 'Cliente')
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUsuarioDto: UpdateUsuarioDto,
    @Req() req: any,
  ) {
    if (req.user.rolName === 'Cliente' && req.user.userId !== id) {
      throw new ForbiddenException('No puedes modificar un perfil ajeno');
    }
    if (
      req.user.rolName === 'Cliente' &&
      updateUsuarioDto.rolId !== undefined
    ) {
      throw new ForbiddenException('No puedes modificar tu propio rol');
    }
    return this.usuarioService.update(id, updateUsuarioDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.usuarioService.remove(id);
  }
}
