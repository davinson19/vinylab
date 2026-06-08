import {
  IsString,
  IsNotEmpty,
  IsInt,
  IsOptional,
  IsNumber,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateViniloDto {
  @IsInt()
  @IsNotEmpty()
  @Type(() => Number)
  categoriaId: number;

  @IsInt()
  @IsNotEmpty()
  @Type(() => Number)
  artistaId: number;

  @IsString()
  @IsNotEmpty()
  titulo: string;

  @IsString()
  @IsOptional()
  descripcion?: string;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  precio: number;

  @IsInt()
  @IsNotEmpty()
  @Min(0)
  @Type(() => Number)
  anioLanzamiento: number;

  @IsInt()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  stock?: number;

  @IsString()
  @IsOptional()
  portada?: string;
}
