import { Test, TestingModule } from '@nestjs/testing';
import { ArtistaController } from './artista.controller';

describe('ArtistaController', () => {
  let controller: ArtistaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ArtistaController],
    }).compile();

    controller = module.get<ArtistaController>(ArtistaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
