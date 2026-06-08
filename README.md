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

Endpoints:
  - Leer todos: `GET /[entidad]`
  - Crear: `POST /[entidad]`
  - Leer uno: `GET /[entidad]/:id`
  - Actualizar: `PATCH /[entidad]/:id`
  - Eliminar: `DELETE /[entidad]/:id`

#### Autenticación y JWT

Endpoints de autenticación:
  - Registro de usuario: `POST /auth/register` (Espera el mismo body que la creación de Usuario).
  - Iniciar sesión: `POST /auth/login` (Espera `email` y `contrasena`).

**Cómo usar el token (JWT)**
Al iniciar sesión correctamente mediante `POST /auth/login`, el servidor devolverá una respuesta JSON con el token de acceso:

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

Para hacer peticiones a endpoints que estén protegidos, se debe incluir este token en la cabecera (header) de la petición HTTP usando el esquema Bearer:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Reiniciar Base de Datos

Vaciar la base de datos y reiniciar los IDs:

```bash
npx prisma migrate reset --force
```


NOTAS
- Arreglar formulario edicion vinilos, carrito y revisar los demas
- Buscador con filtros de categorias y artistas
- ¿Nuevas rutas para vista de producto (con comentarios y tracklists), perfil, carrito y pago?
