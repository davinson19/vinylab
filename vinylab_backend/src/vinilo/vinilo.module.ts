import { Module } from '@nestjs/common';
import { ViniloService } from './vinilo.service';
import { ViniloController } from './vinilo.controller';

@Module({
  providers: [ViniloService],
  controllers: [ViniloController],
})
export class ViniloModule {}
