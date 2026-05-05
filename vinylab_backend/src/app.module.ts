import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RolModule } from './rol/rol.module';
import { UsuarioModule } from './usuario/usuario.module';
import { CategoriaModule } from './categoria/categoria.module';
import { ArtistaModule } from './artista/artista.module';
import { ViniloModule } from './vinilo/vinilo.module';
import { PedidoModule } from './pedido/pedido.module';
import { DetallePedidoModule } from './detalle-pedido/detalle-pedido.module';

@Module({
  imports: [
    RolModule,
    UsuarioModule,
    CategoriaModule,
    ArtistaModule,
    ViniloModule,
    PedidoModule,
    DetallePedidoModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
