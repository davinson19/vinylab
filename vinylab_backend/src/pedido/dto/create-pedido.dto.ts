import {
  IsString,
  IsNotEmpty,
  IsInt,
  IsNumber,
  IsOptional,
  Min,
} from 'class-validator';

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
}
