import { Injectable } from '@nestjs/common';

@Injectable()
export class BatchService {

  public async batchRollback(): Promise<void>{
    console.log('batchRollback');
  }

  public async batchProperties(): Promise<void>{
    console.log('batchRollback');
  }

  public async batchAgents(): Promise<void>{
    console.log('batchRollback');
  }

  getHello(): string {
    return 'Welcom to Luminor Batch Server!';
  }
}
