import { Test, TestingModule } from '@nestjs/testing';
import { ArtistaService } from './artista.service';

describe('ArtistaService', () => {
  let service: ArtistaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ArtistaService],
    }).compile();

    service = module.get<ArtistaService>(ArtistaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
