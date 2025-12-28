import { NestFactory } from '@nestjs/core';
import { LuminorBatchModule } from './luminor-batch.module';

async function bootstrap() {
  const app = await NestFactory.create(LuminorBatchModule);
  await app.listen(process.env.PORT_BATCH ?? 3000);
}
bootstrap();
