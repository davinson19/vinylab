export class ReadUsuarioDto {
  id: number;
  rolId: number;
  email: string;
  nombre: string;
  direccion: string | null;
  verificado: boolean;
}
