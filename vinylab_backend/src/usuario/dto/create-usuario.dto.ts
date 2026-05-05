import {
  IsString,
  IsNotEmpty,
  IsInt,
  IsEmail,
  IsOptional,
  IsBoolean,
} from 'class-validator';

export class CreateUsuarioDto {
  @IsInt()
  @IsNotEmpty()
  rolId: number;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsString()
  @IsNotEmpty()
  contrasena: string;

  @IsString()
  @IsOptional()
  direccion?: string;
}
