-- CreateTable
CREATE TABLE "Rol" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "Rol_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Usuario" (
    "id" SERIAL NOT NULL,
    "rolId" INTEGER NOT NULL,
    "email" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "contrasena" TEXT NOT NULL,
    "direccion" TEXT,
    "verificado" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Categoria" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "Categoria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Artista" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "Artista_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vinilo" (
    "id" SERIAL NOT NULL,
    "categoriaId" INTEGER NOT NULL,
    "artistaId" INTEGER NOT NULL,
    "titulo" TEXT NOT NULL,
    "descripcion" TEXT,
    "precio" DECIMAL(10,2) NOT NULL,
    "anioLanzamiento" INTEGER NOT NULL,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "portada" TEXT,

    CONSTRAINT "Vinilo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pedido" (
    "id" SERIAL NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "importeTotal" DECIMAL(10,2) NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'PAGADO',
    "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Pedido_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DetallePedido" (
    "id" SERIAL NOT NULL,
    "pedidoId" INTEGER NOT NULL,
    "viniloId" INTEGER NOT NULL,
    "cantidad" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "DetallePedido_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Rol_nombre_key" ON "Rol"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_nombre_key" ON "Usuario"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "Categoria_nombre_key" ON "Categoria"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "Artista_nombre_key" ON "Artista"("nombre");

-- AddForeignKey
ALTER TABLE "Usuario" ADD CONSTRAINT "Usuario_rolId_fkey" FOREIGN KEY ("rolId") REFERENCES "Rol"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vinilo" ADD CONSTRAINT "Vinilo_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "Categoria"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vinilo" ADD CONSTRAINT "Vinilo_artistaId_fkey" FOREIGN KEY ("artistaId") REFERENCES "Artista"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pedido" ADD CONSTRAINT "Pedido_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DetallePedido" ADD CONSTRAINT "DetallePedido_pedidoId_fkey" FOREIGN KEY ("pedidoId") REFERENCES "Pedido"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DetallePedido" ADD CONSTRAINT "DetallePedido_viniloId_fkey" FOREIGN KEY ("viniloId") REFERENCES "Vinilo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
