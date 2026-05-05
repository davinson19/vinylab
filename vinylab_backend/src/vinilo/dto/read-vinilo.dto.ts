export class ReadViniloDto {
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
