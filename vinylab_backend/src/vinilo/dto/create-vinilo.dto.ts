import {
  IsString,
  IsNotEmpty,
  IsInt,
  IsOptional,
  IsNumber,
  Min,
} from 'class-validator';

export class CreateViniloDto {
  @IsInt()
  @IsNotEmpty()
  categoriaId: number;

  @IsInt()
  @IsNotEmpty()
  artistaId: number;

  @IsString()
  @IsNotEmpty()
  titulo: string;

  @IsString()
  @IsOptional()
  descripcion?: string;

  @IsNumber()
  @Min(0)
  precio: number;

  @IsInt()
  @IsNotEmpty()
  anioLanzamiento: number;

  @IsInt()
  @IsOptional()
  @Min(0)
  stock?: number;

  @IsString()
  @IsOptional()
  portada?: string;
}
