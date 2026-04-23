import { Test, TestingModule } from '@nestjs/testing';
import { ViniloController } from './vinilo.controller';

describe('ViniloController', () => {
  let controller: ViniloController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ViniloController],
    }).compile();

    controller = module.get<ViniloController>(ViniloController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
