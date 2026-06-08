import {
  IsString,
  IsNotEmpty,
  IsInt,
  IsNumber,
  IsOptional,
  IsArray,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class PedidoItemDto {
  @IsInt()
  @IsNotEmpty()
  @Min(1)
  @Type(() => Number)
  viniloId: number;

  @IsInt()
  @IsNotEmpty()
  @Min(1)
  @Type(() => Number)
  cantidad: number;
}

export class CreatePedidoDto {
  @IsInt()
  @IsNotEmpty()
  @Type(() => Number)
  usuarioId: number;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  importeTotal: number;

  @IsString()
  @IsOptional()
  estado?: string;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => PedidoItemDto)
  vinilos?: PedidoItemDto[];
}
