const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

const entities = {
  rol: {
    className: 'Rol',
    create: `import { IsString, IsNotEmpty } from 'class-validator';

export class CreateRolDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;
}
`,
    update: `import { PartialType } from '@nestjs/mapped-types';
import { CreateRolDto } from './create-rol.dto';

export class UpdateRolDto extends PartialType(CreateRolDto) {}
`,
    read: `export class ReadRolDto {
  id: number;
  nombre: string;
}
`
  },
  usuario: {
    className: 'Usuario',
    create: `import { IsString, IsNotEmpty, IsInt, IsEmail, IsOptional, IsBoolean } from 'class-validator';

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
`,
    update: `import { PartialType } from '@nestjs/mapped-types';
import { CreateUsuarioDto } from './create-usuario.dto';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateUsuarioDto extends PartialType(CreateUsuarioDto) {
  @IsBoolean()
  @IsOptional()
  verificado?: boolean;
}
`,
    read: `export class ReadUsuarioDto {
  id: number;
  rolId: number;
  email: string;
  nombre: string;
  direccion: string | null;
  verificado: boolean;
}
`
  },
  categoria: {
    className: 'Categoria',
    create: `import { IsString, IsNotEmpty } from 'class-validator';

export class CreateCategoriaDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;
}
`,
    update: `import { PartialType } from '@nestjs/mapped-types';
import { CreateCategoriaDto } from './create-categoria.dto';

export class UpdateCategoriaDto extends PartialType(CreateCategoriaDto) {}
`,
    read: `export class ReadCategoriaDto {
  id: number;
  nombre: string;
}
`
  },
  artista: {
    className: 'Artista',
    create: `import { IsString, IsNotEmpty } from 'class-validator';

export class CreateArtistaDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;
}
`,
    update: `import { PartialType } from '@nestjs/mapped-types';
import { CreateArtistaDto } from './create-artista.dto';

export class UpdateArtistaDto extends PartialType(CreateArtistaDto) {}
`,
    read: `export class ReadArtistaDto {
  id: number;
  nombre: string;
}
`
  },
  vinilo: {
    className: 'Vinilo',
    create: `import { IsString, IsNotEmpty, IsInt, IsOptional, IsNumber, Min } from 'class-validator';

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
`,
    update: `import { PartialType } from '@nestjs/mapped-types';
import { CreateViniloDto } from './create-vinilo.dto';

export class UpdateViniloDto extends PartialType(CreateViniloDto) {}
`,
    read: `export class ReadViniloDto {
  id: number;
  categoriaId: number;
  artistaId: number;
  titulo: string;
  descripcion: string | null;
  precio: number;
  anioLanzamiento: number;
  stock: number;
  portada: string | null;
}
`
  },
  pedido: {
    className: 'Pedido',
    create: `import { IsString, IsNotEmpty, IsInt, IsNumber, IsOptional, Min } from 'class-validator';

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
`,
    update: `import { PartialType } from '@nestjs/mapped-types';
import { CreatePedidoDto } from './create-pedido.dto';

export class UpdatePedidoDto extends PartialType(CreatePedidoDto) {}
`,
    read: `export class ReadPedidoDto {
  id: number;
  usuarioId: number;
  importeTotal: number;
  estado: string;
  fechaCreacion: Date;
}
`
  },
  'detalle-pedido': {
    className: 'DetallePedido',
    create: `import { IsInt, IsNotEmpty, IsOptional, Min } from 'class-validator';

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
`,
    update: `import { PartialType } from '@nestjs/mapped-types';
import { CreateDetallePedidoDto } from './create-detalle-pedido.dto';

export class UpdateDetallePedidoDto extends PartialType(CreateDetallePedidoDto) {}
`,
    read: `export class ReadDetallePedidoDto {
  id: number;
  pedidoId: number;
  viniloId: number;
  cantidad: number;
}
`
  }
};

for (const [entityName, dtos] of Object.entries(entities)) {
  const entityDir = path.join(srcDir, entityName);
  const dtoDir = path.join(entityDir, 'dto');
  
  if (!fs.existsSync(entityDir)) {
    console.log("Skipping " + entityName + ", dir not found");
    continue;
  }
  
  if (!fs.existsSync(dtoDir)) {
    fs.mkdirSync(dtoDir);
  }

  const createFileName = path.join(dtoDir, "create-" + entityName + ".dto.ts");
  const updateFileName = path.join(dtoDir, "update-" + entityName + ".dto.ts");
  const readFileName = path.join(dtoDir, "read-" + entityName + ".dto.ts");

  fs.writeFileSync(createFileName, dtos.create);
  fs.writeFileSync(updateFileName, dtos.update);
  fs.writeFileSync(readFileName, dtos.read);

  console.log("Created DTOs for " + entityName);
}
