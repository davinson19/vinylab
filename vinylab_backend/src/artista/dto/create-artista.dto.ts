import { IsString, IsNotEmpty } from 'class-validator';

export class CreateArtistaDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;
}
