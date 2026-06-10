Trabajo fin de grado de David Hernández Carmona para 2º de Desarrollo de Aplicaciones Web. Consiste en una web de venta de vinilos.

## Índice

- [Diagrama Entidad-Relación](#diagrama-entidad-relación)
- [Backend](#backend)
  - [Arquitectura y estructura del código](#1-arquitectura-y-estructura-del-código)
  - [Prisma](#2-prisma)
  - [Librerías implementadas](#3-librerías-implementadas)
  - [Diseño del backend](#4-diseño-del-backend)
- [Frontend](#frontend)
- [Despliegue](#despliegue)

---

### Diagrama Entidad-Relación

Diagrama de la base de datos diseñado con **Mermaid**.

![ER](Entidad-relacion.png "Diagrama Entidad-Relación")

[↑ Volver arriba ↑](#índice)
---

### Backend

El backend está desarrollado con el framework **NestJS**, **Prisma ORM** como ORM y una base de datos **PostgreSQL**. A continuación se detallan las decisiones de arquitectura, comandos utilizados y librerías clave implementadas.


#### 1. Arquitectura y Estructura del Código

NestJS promueve una arquitectura modular limpia orientada al mantenimiento de código a gran escala. Para organizar el proyecto de forma desacoplada y reutilizable, se utilizaron comandos de generación automáticos del CLI de NestJS:

- **Inicialización del Backend:**
  ```bash
  nest new vinylab_backend
  ```
  Crea la base estándar del framework con inyección de dependencias y pruebas unitarias.

- **Generación de Recursos CRUD:**
  ```bash
  nest g res <nombre_recurso>
  ```
  Usado para generar los módulos de: `artista`, `categoria`, `vinilo`, `usuario`, `rol`, y `pedido`. Este comando genera todo el esqueleto necesario bajo el patrón modular de NestJS:

  - **Controladores:** Manejan las peticiones HTTP externas y asocian las rutas.
  - **Servicios:** Albergan la lógica de la API y llamadas al ORM.
  - **Módulos:** Encapsulan y exponen los controladores y servicios relacionados.
  - **DTOs:** Definen el tipado de los datos de entrada/salida y sus validaciones.


#### 2. Comandos Prisma
  - `npx prisma init`: Crea la carpeta de Prisma y el archivo de configuración `.env` inicial.
  - `npx prisma migrate dev --name init_vinylab`: Aplica cambios en la base de datos de PostgreSQL, generando los archivos de migración `.sql`.
  - `npx prisma generate`: Genera el código interno de TypeScript del cliente de Prisma, adaptado al esquema.
  - `npx prisma db seed`: Ejecuta el script `prisma/seed.js`, que limpia las tablas y recrea datos iniciales como son roles, usuarios administrador y cliente predeterminados, categorías musicales, artistas y vinilos con imágenes y datos completos.
  - `npx prisma studio`: Arranca un panel visual de administración en local para consultar, crear y modificar datos manualmente de forma ágil.


#### 3. Librerías implementadas

* **`@nestjs/common`, `@nestjs/core`, `@nestjs/platform-express`**: El núcleo del framework. Gestiona la inyección de dependencias, el enrutamiento REST y el servidor Express subyacente.
* **`@nestjs/config`**: Facilita la inyección de las variables de entorno definidas en `.env`.
* **`@nestjs/jwt`, `@nestjs/passport`, `passport`, `passport-jwt`**: Implementan el sistema de seguridad y autenticación. Generan y validan tokens JWT firmados digitalmente.
* **`bcrypt`**: Permite almacenar contraseñas de forma segura, evitando almacenar contraseñas en texto plano mediante funciones hash.
* **`class-validator` y `class-transformer`**: Validan de forma estricta los cuerpos de las peticiones mediante decoradores, como `@IsString()`, `@IsEmail()`, `@IsNotEmpty()` en los DTOs.
* **`@prisma/client` & `@prisma/adapter-pg`**: Habilitan la comunicación directa de Prisma con PostgreSQL.
* **`@nestjs/mapped-types`**: Permite reutilizar tipos de DTOs, reduciendo la duplicación de código.

#### 4. Diseño del Backend

- **Guards:**
  - `JwtAuthGuard`: Protege todas las rutas por defecto y requiere un token JWT válido, exceptuando las rutas decoradas con `@Public()`.
  - `RolesGuard`: Comprueba si el usuario tiene el rol requerido (`Cliente` o `Admin`), indicado por el decorador `@Roles(...)`.
- **Validación**
  El servidor utiliza un `ValidationPipe` global con:
  - `whitelist: true`: Elimina cualquier campo sobrante que no esté definido en el DTO.
  - `transform: true`: Convierte los parámetros de ruta y cuerpos de petición a sus tipos nativos correspondientes. Por ejemplo, strings de ID a enteros.
- **Límites de Carga:**
  Se incrementó la capacidad máxima de recepción de peticiones HTTP en `main.ts` a `10mb` para permitir el almacenamiento de portadas en formato base64 ya que el tamaño máximo por defecto es 1mb, no permite subir imágenes de mayor tamaño y puede dar errores o no visualizarse la imagen correctamente.
- **Servicio Estático e Integración Single-Page Application (SPA):**
  Si el compilado de producción del frontend se encuentra disponible en la carpeta `public`, el backend lo sirve de forma directa y redirige cualquier ruta del navegador que no pertenezca a la API hacia `index.html`.

[↑ Volver arriba ↑](#índice)
---

### Frontend


### Despliegue


[↑ Volver arriba ↑](#índice)



