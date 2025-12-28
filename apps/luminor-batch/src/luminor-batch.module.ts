import { Module } from '@nestjs/common';
import { LuminorBatchController } from './luminor-batch.controller';
import { LuminorBatchService } from './luminor-batch.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule.forRoot()],
  controllers: [LuminorBatchController],
  providers: [LuminorBatchService],
})
export class LuminorBatchModule {}
