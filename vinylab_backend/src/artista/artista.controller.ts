import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { ArtistaService } from './artista.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { CreateArtistaDto } from './dto/create-artista.dto';
import { UpdateArtistaDto } from './dto/update-artista.dto';

@Roles('Admin')
@Controller('artista')
export class ArtistaController {
  constructor(private readonly artistaService: ArtistaService) {}

  @Post()
  create(@Body() createArtistaDto: CreateArtistaDto) {
    return this.artistaService.create(createArtistaDto);
  }

  @Roles('Admin', 'Cliente')
  @Get()
  findAll() {
    return this.artistaService.findAll();
  }

  @Roles('Admin', 'Cliente')
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.artistaService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateArtistaDto: UpdateArtistaDto,
  ) {
    return this.artistaService.update(id, updateArtistaDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.artistaService.remove(id);
  }
}
