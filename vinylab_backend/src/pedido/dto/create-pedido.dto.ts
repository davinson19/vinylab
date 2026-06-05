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
  viniloId: number;

  @IsInt()
  @IsNotEmpty()
  @Min(1)
  cantidad: number;
}

export class CreatePedidoDto {
  @IsInt()
  @IsNotEmpty()
  usuarioId: number;

  @IsNumber()
  @Min(0)
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
