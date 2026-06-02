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

async function getBase64Image(url) {
  const maxRetries = 5;
  let delay = 1000;
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      });
      
      if (response.status === 429) {
        console.warn(`Rate limited (429) for ${url}. Retrying in ${delay}ms... (Attempt ${i + 1}/${maxRetries})`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        delay *= 2; // Exponential backoff
        continue;
      }
      
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const mimeType = response.headers.get('content-type') || 'image/png';
      return `data:${mimeType};base64,${buffer.toString('base64')}`;
    } catch (error) {
      if (i === maxRetries - 1) {
        console.error(`Failed to fetch image from ${url} after ${maxRetries} attempts, using original URL:`, error);
        return url;
      }
      console.warn(`Error fetching ${url}: ${error.message}. Retrying in ${delay}ms...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
      delay *= 2;
    }
  }
  return url;
}

async function main() {
  console.log('🌱 Starting database seeding (JS)...');

  // Clean all tables and reset serial/identity sequences to ensure IDs start at 1
  console.log('Cleaning existing tables and resetting sequences...');
  await prisma.$executeRawUnsafe(
    `TRUNCATE TABLE "DetallePedido", "Pedido", "Vinilo", "Artista", "Categoria", "Usuario", "Rol" RESTART IDENTITY CASCADE;`
  );

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

  const rap = await prisma.categoria.upsert({
    where: { nombre: 'Rap' },
    update: {},
    create: { nombre: 'Rap' },
  });

  // 4. Seed Artists
  console.log('Creating artists...');
  const artistsData = [
    'Pink Floyd',
    'Daft Punk',
    'Michael Jackson',
    'Miles Davis',
    'Led Zeppelin',
    'Queen',
    'Nirvana',
    'Madonna',
    'ABBA',
    'Adele',
    'Billie Eilish',
    'John Coltrane',
    'Dave Brubeck',
    'Bill Evans',
    'Herbie Hancock',
    'The Prodigy',
    'Kraftwerk',
    'Chemical Brothers',
    'Eminem',
    '2Pac',
    'The Notorious B.I.G.',
    'Kendrick Lamar',
    'Wu-Tang Clan'
  ];

  const artists = {};
  for (const name of artistsData) {
    artists[name] = await prisma.artista.upsert({
      where: { nombre: name },
      update: {},
      create: { nombre: name },
    });
  }

  // 5. Seed Vinyls
  console.log('Creating vinyl records...');
  const vinyls = [
    // --- ROCK ---
    {
      categoriaId: rock.id,
      artistaId: artists['Pink Floyd'].id,
      titulo: 'The Dark Side of the Moon',
      descripcion: 'Uno de los álbumes más influyentes y aclamados de todos los tiempos. Un hito en la historia de la música rock.',
      precio: 29.99,
      anioLanzamiento: 1973,
      stock: 15,
      portada: 'https://upload.wikimedia.org/wikipedia/en/3/3b/Dark_Side_of_the_Moon.png',
    },
    {
      categoriaId: rock.id,
      artistaId: artists['Pink Floyd'].id,
      titulo: 'Wish You Were Here',
      descripcion: 'Un emotivo tributo a su antiguo compañero de banda Syd Barrett, incluye la mítica canción homónima.',
      precio: 32.50,
      anioLanzamiento: 1975,
      stock: 8,
      portada: 'https://upload.wikimedia.org/wikipedia/en/a/a4/Pink_Floyd%2C_Wish_You_Were_Here_%281975%29.png',
    },
    {
      categoriaId: rock.id,
      artistaId: artists['Led Zeppelin'].id,
      titulo: 'Led Zeppelin IV',
      descripcion: 'El legendario cuarto álbum sin título de la banda, que incluye "Stairway to Heaven" y fusiona el hard rock y el folk.',
      precio: 34.99,
      anioLanzamiento: 1971,
      stock: 10,
      portada: 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Zeppelin_IV.jpg',
    },
    {
      categoriaId: rock.id,
      artistaId: artists['Queen'].id,
      titulo: 'A Night at the Opera',
      descripcion: 'El aclamado cuarto álbum de estudio de la banda británica de rock, conteniendo su obra maestra "Bohemian Rhapsody".',
      precio: 36.00,
      anioLanzamiento: 1975,
      stock: 12,
      portada: 'https://upload.wikimedia.org/wikipedia/en/4/4d/Queen_A_Night_At_The_Opera.png',
    },
    {
      categoriaId: rock.id,
      artistaId: artists['Nirvana'].id,
      titulo: 'Nevermind',
      descripcion: 'El álbum que popularizó el rock alternativo y el movimiento grunge en todo el mundo, con el himno "Smells Like Teen Spirit".',
      precio: 28.50,
      anioLanzamiento: 1991,
      stock: 18,
      portada: 'https://upload.wikimedia.org/wikipedia/en/b/b7/NirvanaNevermindalbumcover.jpg',
    },
    // --- POP ---
    {
      categoriaId: pop.id,
      artistaId: artists['Michael Jackson'].id,
      titulo: 'Thriller',
      descripcion: 'El álbum más vendido de la historia de la música, un clásico imprescindible del rey del pop.',
      precio: 25.99,
      anioLanzamiento: 1982,
      stock: 20,
      portada: 'https://upload.wikimedia.org/wikipedia/en/5/55/Michael_Jackson_-_Thriller.png',
    },
    {
      categoriaId: pop.id,
      artistaId: artists['Madonna'].id,
      titulo: 'Like a Virgin',
      descripcion: 'El álbum que consolidó a Madonna como un icono de la cultura pop y la moda mundial a mediados de los 80.',
      precio: 24.50,
      anioLanzamiento: 1984,
      stock: 12,
      portada: 'https://upload.wikimedia.org/wikipedia/en/1/17/LikeAVirgin1984.png',
    },
    {
      categoriaId: pop.id,
      artistaId: artists['ABBA'].id,
      titulo: 'Arrival',
      descripcion: 'Uno de los álbumes más icónicos del cuarteto sueco, con éxitos globales inmortales como "Dancing Queen".',
      precio: 26.00,
      anioLanzamiento: 1976,
      stock: 10,
      portada: 'https://upload.wikimedia.org/wikipedia/en/7/71/ABBA_-_Arrival.png',
    },
    {
      categoriaId: pop.id,
      artistaId: artists['Adele'].id,
      titulo: '21',
      descripcion: 'El multipremiado segundo álbum de la cantante británica, cargado de emotivos éxitos como "Rolling in the Deep" y "Someone Like You".',
      precio: 29.99,
      anioLanzamiento: 2011,
      stock: 15,
      portada: 'https://upload.wikimedia.org/wikipedia/en/1/1b/Adele_-_21.png',
    },
    {
      categoriaId: pop.id,
      artistaId: artists['Billie Eilish'].id,
      titulo: 'When We All Fall Asleep, Where Do We Go?',
      descripcion: 'El aclamado álbum de estudio debut de Billie Eilish, caracterizado por su estilo oscuro de pop y su sonido vanguardista.',
      precio: 31.50,
      anioLanzamiento: 2019,
      stock: 14,
      portada: 'https://upload.wikimedia.org/wikipedia/en/3/38/When_We_All_Fall_Asleep%2C_Where_Do_We_Go%3F.png',
    },
    // --- JAZZ ---
    {
      categoriaId: jazz.id,
      artistaId: artists['Miles Davis'].id,
      titulo: 'Kind of Blue',
      descripcion: 'La obra maestra del jazz modal, considerada por muchos como la mejor grabación de jazz de la historia.',
      precio: 27.50,
      anioLanzamiento: 1959,
      stock: 10,
      portada: 'https://m.media-amazon.com/images/I/71LUnUhqSOL._SL1200_.jpg',
    },
    {
      categoriaId: jazz.id,
      artistaId: artists['John Coltrane'].id,
      titulo: 'A Love Supreme',
      descripcion: 'Un álbum espiritual y profundamente expresivo, ampliamente considerado como una de las obras cumbre del saxofonista.',
      precio: 28.00,
      anioLanzamiento: 1965,
      stock: 8,
      portada: 'https://upload.wikimedia.org/wikipedia/en/9/9a/John_Coltrane_-_A_Love_Supreme.jpg',
    },
    {
      categoriaId: jazz.id,
      artistaId: artists['Dave Brubeck'].id,
      titulo: 'Time Out',
      descripcion: 'Un pionero álbum de jazz famoso por el uso de firmas de tiempo inusuales, que incluye el legendario tema "Take Five".',
      precio: 26.50,
      anioLanzamiento: 1959,
      stock: 9,
      portada: 'https://upload.wikimedia.org/wikipedia/en/e/e5/Time_out_album_cover.jpg',
    },
    {
      categoriaId: jazz.id,
      artistaId: artists['Bill Evans'].id,
      titulo: 'Waltz for Debby',
      descripcion: 'Un concierto en vivo legendario grabado en el Village Vanguard, mostrando una telepatía trío sin precedentes.',
      precio: 29.00,
      anioLanzamiento: 1962,
      stock: 7,
      portada: 'https://upload.wikimedia.org/wikipedia/en/c/c9/Bill_Evans_Trio_-_Waltz_for_Debby.png',
    },
    {
      categoriaId: jazz.id,
      artistaId: artists['Herbie Hancock'].id,
      titulo: 'Head Hunters',
      descripcion: 'El álbum de fusión que mezcló el jazz con el funk pesado de manera revolucionaria, abriendo nuevas fronteras musicales.',
      precio: 27.99,
      anioLanzamiento: 1973,
      stock: 11,
      portada: 'https://upload.wikimedia.org/wikipedia/en/5/54/Herbie-Hancock-Head-Hunters.png',
    },
    // --- ELECTRÓNICA ---
    {
      categoriaId: electronic.id,
      artistaId: artists['Daft Punk'].id,
      titulo: 'Random Access Memories',
      descripcion: 'Álbum ganador de múltiples premios Grammy que rinde homenaje a la música americana de finales de los 70 y principios de los 80.',
      precio: 35.00,
      anioLanzamiento: 2013,
      stock: 12,
      portada: 'https://upload.wikimedia.org/wikipedia/en/2/26/Daft_Punk_-_Random_Access_Memories.png',
    },
    {
      categoriaId: electronic.id,
      artistaId: artists['Daft Punk'].id,
      titulo: 'Discovery',
      descripcion: 'El aclamado segundo álbum del dúo francés que definió el house y dance pop de los años 2000, con himnos como "One More Time".',
      precio: 33.00,
      anioLanzamiento: 2001,
      stock: 15,
      portada: 'https://upload.wikimedia.org/wikipedia/en/2/27/Daft_Punk_-_Discovery.png',
    },
    {
      categoriaId: electronic.id,
      artistaId: artists['The Prodigy'].id,
      titulo: 'The Fat of the Land',
      descripcion: 'El explosivo álbum que llevó el breakbeat y la música electrónica de club a las masas globales, incluyendo "Firestarter".',
      precio: 31.99,
      anioLanzamiento: 1997,
      stock: 9,
      portada: 'https://upload.wikimedia.org/wikipedia/en/3/3b/TheProdigy-TheFatOfTheLand.jpg',
    },
    {
      categoriaId: electronic.id,
      artistaId: artists['Kraftwerk'].id,
      titulo: 'The Man-Machine',
      descripcion: 'La obra maestra del grupo pionero alemán de música electrónica, conteniendo clásicos como "The Model" y "Neon Lights".',
      precio: 29.50,
      anioLanzamiento: 1978,
      stock: 8,
      portada: 'https://upload.wikimedia.org/wikipedia/en/7/7f/Kraftwerk_-_The_Man-Machine.png',
    },
    {
      categoriaId: electronic.id,
      artistaId: artists['Chemical Brothers'].id,
      titulo: 'Dig Your Own Hole',
      descripcion: 'Un álbum seminal de la era del Big Beat, repleto de ritmos potentes y psicodelia electrónica, con el clásico "Block Rockin\' Beats".',
      precio: 30.00,
      anioLanzamiento: 1997,
      stock: 11,
      portada: 'https://upload.wikimedia.org/wikipedia/en/a/a4/Dig_your_own_hole_album_cover.jpg',
    },
    // --- RAP ---
    {
      categoriaId: rap.id,
      artistaId: artists['Eminem'].id,
      titulo: 'The Marshall Mathers LP',
      descripcion: 'Uno de los álbumes de hip-hop más influyentes y vendidos de la historia, una mirada cruda e ingeniosa a la fama y la sociedad.',
      precio: 28.99,
      anioLanzamiento: 2000,
      stock: 16,
      portada: 'https://upload.wikimedia.org/wikipedia/en/a/ae/The_Marshall_Mathers_LP.jpg',
    },
    {
      categoriaId: rap.id,
      artistaId: artists['2Pac'].id,
      titulo: 'All Eyez on Me',
      descripcion: 'El legendario álbum doble de 2Pac, considerado una de las mayores obras maestras del rap de la costa oeste.',
      precio: 34.90,
      anioLanzamiento: 1996,
      stock: 14,
      portada: 'https://upload.wikimedia.org/wikipedia/en/1/16/Alleyezonme.jpg',
    },
    {
      categoriaId: rap.id,
      artistaId: artists['The Notorious B.I.G.'].id,
      titulo: 'Ready to Die',
      descripcion: 'El influyente álbum debut que redefinió el hip-hop de la costa este, aclamado por sus rimas narrativas y estilo fluido.',
      precio: 32.00,
      anioLanzamiento: 1994,
      stock: 10,
      portada: 'https://upload.wikimedia.org/wikipedia/en/9/97/Ready_To_Die.jpg',
    },
    {
      categoriaId: rap.id,
      artistaId: artists['Kendrick Lamar'].id,
      titulo: 'Good Kid, M.A.A.D City',
      descripcion: 'Una aclamada obra conceptual que narra las vivencias de juventud de Kendrick en Compton, considerada un clásico moderno.',
      precio: 30.50,
      anioLanzamiento: 2012,
      stock: 12,
      portada: 'https://upload.wikimedia.org/wikipedia/en/9/93/KendrickGKMC.jpg',
    },
    {
      categoriaId: rap.id,
      artistaId: artists['Wu-Tang Clan'].id,
      titulo: 'Enter the Wu-Tang (36 Chambers)',
      descripcion: 'El debut revolucionario que redefinió la música hip-hop underground con ritmos ásperos y samples de películas de artes marciales.',
      precio: 29.99,
      anioLanzamiento: 1993,
      stock: 11,
      portada: 'https://upload.wikimedia.org/wikipedia/en/5/53/Wu-TangClanEntertheWu-Tangalbumcover.jpg',
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
      console.log(`Processing cover image for ${vinyl.titulo}...`);
      if (vinyl.portada && vinyl.portada.startsWith('http')) {
        // Add a 500ms delay between image fetches to prevent Wikipedia rate-limiting
        await new Promise((resolve) => setTimeout(resolve, 500));
        vinyl.portada = await getBase64Image(vinyl.portada);
      }
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
