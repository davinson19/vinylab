import { IsInt, IsNotEmpty, IsOptional, Min } from 'class-validator';

export class CreateDetallePedidoDto {
  @IsInt()
  @IsNotEmpty()
  pedidoId: number;

  @IsInt()
  @IsNotEmpty()
  viniloId: number;

  @IsInt()
  @IsOptional()
  @Min(1)
  cantidad?: number;
}
