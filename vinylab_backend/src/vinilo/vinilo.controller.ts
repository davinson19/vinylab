import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { ViniloService } from './vinilo.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { CreateViniloDto } from './dto/create-vinilo.dto';
import { UpdateViniloDto } from './dto/update-vinilo.dto';

@Roles('Admin')
@Controller('vinilo')
export class ViniloController {
  constructor(private readonly viniloService: ViniloService) {}

  @Post()
  create(@Body() createViniloDto: CreateViniloDto) {
    return this.viniloService.create(createViniloDto);
  }

  @Roles('Admin', 'Cliente')
  @Get()
  findAll() {
    return this.viniloService.findAll();
  }

  @Roles('Admin', 'Cliente')
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.viniloService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateViniloDto: UpdateViniloDto) {
    return this.viniloService.update(id, updateViniloDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.viniloService.remove(id);
  }
}
