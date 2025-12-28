import { Controller, Get } from '@nestjs/common';
import { LuminorBatchService } from './luminor-batch.service';

@Controller()
export class LuminorBatchController {
  constructor(private readonly luminorBatchService: LuminorBatchService) {}

  @Get()
  getHello(): string {
    return this.luminorBatchService.getHello();
  }
}
