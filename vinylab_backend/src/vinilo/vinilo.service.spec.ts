import { Test, TestingModule } from '@nestjs/testing';
import { ViniloService } from './vinilo.service';

describe('ViniloService', () => {
  let service: ViniloService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ViniloService],
    }).compile();

    service = module.get<ViniloService>(ViniloService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
