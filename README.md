Trabajo fin de grado de David Hernández Carmona para 2º de Desarrollo de Aplicaciones Web. Consiste en una web de venta de vinilos.

## Índice

- [Diagrama Entidad-Relación](#diagrama-entidad-relación)
- [Backend](#backend)

---

### Diagrama Entidad-Relación


Diagrama de la base de datos diseñado con **Mermaid**.

![ER](Diagrama_entidad_relación.png "Diagrama Entidad-Relación")

---

### Backend 

El backend está desarrollado con **NestJS** como framework, **Prisma ORM** como ORM y una base de datos **PostgreSQL**. Se podrá consultar la base de datos utilizando prisma studio con el comando `npx prisma studio`.

#### Rutas CRUD

Endpoints de la API para la gestión de las entidades:

- **Rol**
  - `GET /rol` (All)
  - `POST /rol`
  - `GET /rol/:id` (One)
  - `PATCH /rol/:id`
  - `DELETE /rol/:id`
- **Usuario**
  - `GET /usuario` (All)
  - `POST /usuario`
  - `GET /usuario/:id` (One)
  - `PATCH /usuario/:id`
  - `DELETE /usuario/:id`
- **Categoria**
  - `GET /categoria` (All)
  - `POST /categoria`
  - `GET /categoria/:id` (One)
  - `PATCH /categoria/:id`
  - `DELETE /categoria/:id`
- **Artista**
  - `GET /artista` (All)
  - `POST /artista`
  - `GET /artista/:id` (One)
  - `PATCH /artista/:id`
  - `DELETE /artista/:id`
- **Vinilo**
  - `GET /vinilo` (All)
  - `POST /vinilo`
  - `GET /vinilo/:id` (One)
  - `PATCH /vinilo/:id`
  - `DELETE /vinilo/:id`
- **Pedido**
  - `GET /pedido` (All)
  - `POST /pedido`
  - `GET /pedido/:id` (One)
  - `PATCH /pedido/:id`
  - `DELETE /pedido/:id`
- **Detalle Pedido**
  - `GET /detalle-pedido` (All)
  - `POST /detalle-pedido`
  - `GET /detalle-pedido/:id` (One)
  - `PATCH /detalle-pedido/:id`
  - `DELETE /detalle-pedido/:id`


