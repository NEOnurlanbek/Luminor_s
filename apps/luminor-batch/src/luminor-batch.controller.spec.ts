import { Test, TestingModule } from '@nestjs/testing';
import { LuminorBatchController } from './luminor-batch.controller';
import { LuminorBatchService } from './luminor-batch.service';

describe('LuminorBatchController', () => {
  let luminorBatchController: LuminorBatchController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [LuminorBatchController],
      providers: [LuminorBatchService],
    }).compile();

    luminorBatchController = app.get<LuminorBatchController>(LuminorBatchController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(luminorBatchController.getHello()).toBe('Hello World!');
    });
  });
});
