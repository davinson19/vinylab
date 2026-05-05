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

El backend está hecho con **NestJS**, **Prisma ORM**, **PostgreSQL** y **pgAdmin** para poder consultar la base de datos. Para acceder a pgAdmin, se debe acceder a localhost:5050 que estará corriendo en un contenedor docker.

Para generar la estructura básica (módulo, servicio y controlador) de cada modelo se han utilizado los siguientes comandos:

```bash
npx nest g module <modelo>
npx nest g service <modelo>
npx nest g controller <modelo>
```