import { PartialType } from '@nestjs/mapped-types';
import { CreateArtistaDto } from './create-artista.dto';

export class UpdateArtistaDto extends PartialType(CreateArtistaDto) {}
