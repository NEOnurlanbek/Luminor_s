import { Injectable } from '@nestjs/common';

@Injectable()
export class LuminorBatchService {
  getHello(): string {
    return 'Welcom to Luminor Batch Server!';
  }
}
