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
[Volver arriba ↑](#índice)

- [Instalación](#instalación)
- [Creación de módulos](#creación-de-módulos)


#### Instalación

El backend está hecho con **NestJS**, **Prisma ORM** y una base de datos **PostgreSQL**. Para poder trabajar con el proyecto es necesario instalar la **CLI** de **NestJS** con **npm**:

```bash
npm i -g @nestjs/cli
```

Para generar el proyecto, seleccionando **npm** como gestor de paquetes cuando el terminal lo pregunte:

```bash
nest new vinylab_backend
```
Se instala **Prisma ORM**:

```bash
npm install prisma --save-dev
```
Y se inicializa para generar el directorio `prisma/` y el archivo `.env`:

```bash
npx prisma init
```

Se han inicializado las variables de entorno en `.env`, creado un `docker-compose.yml` con **PostgreSQL**, **pgAdmin** para poder gestionar la base de datos y que tenga persistencia de datos:

```bash
docker-compose up -d
```

Una vez configurada la base de datos, se crean los modelos en el archivo `prisma/schema.prisma` y se migran a la base de datos con el comando:

```bash
npx prisma migrate dev --name init_vinylab
```

A partir de aquí se puede consultar la base de datos desde:

**Prisma Studio**:
```bash
npx prisma studio
```

**pgAdmin**:
- Acceder a localhost:5050 que estará corriendo en un contenedor docker.
- usuario y contraseña definidos en el archivo `.env`

#### Creación de módulos

Para generar la estructura básica (módulo, servicio y controlador) de cada modelo se han utilizado los siguientes comandos: a

```bash
npx nest g module <modelo>
npx nest g service <modelo>
npx nest g controller <modelo>
```