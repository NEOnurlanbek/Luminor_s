import { Injectable } from '@nestjs/common';

@Injectable()
export class LuminorBatchService {
  getHello(): string {
    return 'Hello World!';
  }
}
