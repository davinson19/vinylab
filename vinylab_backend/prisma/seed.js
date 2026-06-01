const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const pg = require('pg');
const bcrypt = require('bcrypt');

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL is not defined in the environment variables');
}
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Starting database seeding (JS)...');

  // 1. Seed Roles
  console.log('Creating roles...');
  const adminRol = await prisma.rol.upsert({
    where: { nombre: 'Admin' },
    update: {},
    create: {
      id: 1,
      nombre: 'Admin',
    },
  });

  const clienteRol = await prisma.rol.upsert({
    where: { nombre: 'Cliente' },
    update: {},
    create: {
      id: 2,
      nombre: 'Cliente',
    },
  });

  console.log(`Roles created/verified: ${adminRol.nombre} (ID: ${adminRol.id}), ${clienteRol.nombre} (ID: ${clienteRol.id})`);

  // 2. Seed Default Users
  console.log('Creating default users...');
  const saltOrRounds = 10;  
  
  const adminPasswordHash = await bcrypt.hash('admin123', saltOrRounds);
  const adminUser = await prisma.usuario.upsert({
    where: { email: 'admin@vinylab.com' },
    update: {},
    create: {
      nombre: 'Administrador',
      email: 'admin@vinylab.com',
      contrasena: adminPasswordHash,
      rolId: adminRol.id,
      direccion: 'VinyLab Head Office',
    },
  });

  const clientePasswordHash = await bcrypt.hash('cliente123', saltOrRounds);
  const clienteUser = await prisma.usuario.upsert({
    where: { email: 'cliente@vinylab.com' },
    update: {},
    create: {
      nombre: 'Cliente de Prueba',
      email: 'cliente@vinylab.com',
      contrasena: clientePasswordHash,
      rolId: clienteRol.id,
      direccion: 'Calle Principal 123, Madrid',
    },
  });

  console.log(`Users created/verified: ${adminUser.email} (Admin), ${clienteUser.email} (Cliente)`);

  // 3. Seed Categories
  console.log('Creating categories...');
  const rock = await prisma.categoria.upsert({
    where: { nombre: 'Rock' },
    update: {},
    create: { nombre: 'Rock' },
  });

  const pop = await prisma.categoria.upsert({
    where: { nombre: 'Pop' },
    update: {},
    create: { nombre: 'Pop' },
  });

  const jazz = await prisma.categoria.upsert({
    where: { nombre: 'Jazz' },
    update: {},
    create: { nombre: 'Jazz' },
  });

  const electronic = await prisma.categoria.upsert({
    where: { nombre: 'Electrónica' },
    update: {},
    create: { nombre: 'Electrónica' },
  });

  // 4. Seed Artists
  console.log('Creating artists...');
  const pinkFloyd = await prisma.artista.upsert({
    where: { nombre: 'Pink Floyd' },
    update: {},
    create: { nombre: 'Pink Floyd' },
  });

  const daftPunk = await prisma.artista.upsert({
    where: { nombre: 'Daft Punk' },
    update: {},
    create: { nombre: 'Daft Punk' },
  });

  const michaelJackson = await prisma.artista.upsert({
    where: { nombre: 'Michael Jackson' },
    update: {},
    create: { nombre: 'Michael Jackson' },
  });

  const milesDavis = await prisma.artista.upsert({
    where: { nombre: 'Miles Davis' },
    update: {},
    create: { nombre: 'Miles Davis' },
  });

  // 5. Seed Vinyls
  console.log('Creating vinyl records...');
  const vinyls = [
    {
      categoriaId: rock.id,
      artistaId: pinkFloyd.id,
      titulo: 'The Dark Side of the Moon',
      descripcion: 'Uno de los álbumes más influyentes y aclamados de todos los tiempos. Un hito en la historia de la música rock.',
      precio: 29.99,
      anioLanzamiento: 1973,
      stock: 15,
      portada: 'https://upload.wikimedia.org/wikipedia/en/3/3b/Dark_Side_of_the_Moon.png',
    },
    {
      categoriaId: rock.id,
      artistaId: pinkFloyd.id,
      titulo: 'Wish You Were Here',
      descripcion: 'Un emotivo tributo a su antiguo compañero de banda Syd Barrett, incluye la mítica canción homónima.',
      precio: 32.50,
      anioLanzamiento: 1975,
      stock: 8,
      portada: 'https://upload.wikimedia.org/wikipedia/en/a/a4/Pink_Floyd%2C_Wish_You_Were_Here_%281975%29.png',
    },
    {
      categoriaId: electronic.id,
      artistaId: daftPunk.id,
      titulo: 'Random Access Memories',
      descripcion: 'Álbum ganador de múltiples premios Grammy que rinde homenaje a la música americana de finales de los 70 y principios de los 80.',
      precio: 35.00,
      anioLanzamiento: 2013,
      stock: 12,
      portada: 'https://m.media-amazon.com/images/I/71YyP9qLpTL._SL1500_.jpg',
    },
    {
      categoriaId: pop.id,
      artistaId: michaelJackson.id,
      titulo: 'Thriller',
      descripcion: 'El álbum más vendido de la historia de la música, un clásico imprescindible del rey del pop.',
      precio: 25.99,
      anioLanzamiento: 1982,
      stock: 20,
      portada: 'https://upload.wikimedia.org/wikipedia/en/5/55/Michael_Jackson_-_Thriller.png',
    },
    {
      categoriaId: jazz.id,
      artistaId: milesDavis.id,
      titulo: 'Kind of Blue',
      descripcion: 'La obra maestra del jazz modal, considerada por muchos como la mejor grabación de jazz de la historia.',
      precio: 27.50,
      anioLanzamiento: 1959,
      stock: 10,
      portada: 'https://m.media-amazon.com/images/I/71LUnUhqSOL._SL1200_.jpg',
    },
  ];

  for (const vinyl of vinyls) {
    const existe = await prisma.vinilo.findFirst({
      where: {
        titulo: vinyl.titulo,
        artistaId: vinyl.artistaId,
      },
    });
    if (!existe) {
      await prisma.vinilo.create({ data: vinyl });
    }
  }

  console.log('🎉 Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
