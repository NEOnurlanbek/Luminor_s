import { Controller, Get, Logger } from '@nestjs/common';
import { BatchService } from './batch.service';
import { Cron, Interval, Timeout } from '@nestjs/schedule';
import { BATCH_ROLBACK, BATCH_TOP_PROPERTIES } from './libs/config';

@Controller()
export class BatchController {
  private logger:Logger = new Logger('BatchController');
  constructor(private readonly batchService: BatchService) {}
 

  @Timeout(1000) 
  timeout() {
    this.logger.debug('BATCH SERVER REDY')
  }

  @Cron('*/5 * * * * *')
  public async batchRollback() {
    try{
    this.logger['context'] = BATCH_ROLBACK;
    this.logger.debug('EXECUTED');
    await this.batchService.batchRollback()
  } catch(err) {
    this.logger.error(err)
  }
}

@Cron('*/5 * * * * *')
public async batchProperties() {
  try{
  this.logger['context'] = BATCH_TOP_PROPERTIES;
  this.logger.debug('EXECUTED');
  await this.batchService.batchProperties()
} catch(err) {
  this.logger.error(err)
}
}

@Cron('*/5 * * * * *')
public async batchAgents() {
  try{
  this.logger['context'] = BATCH_ROLBACK;
  this.logger.debug('EXECUTED');
  await this.batchService.batchAgents()
} catch(err) {
  this.logger.error(err)
}
}


  // @Interval(5000)
  // handleInterval() {
  //   this.logger.debug('INterval')
  // }

  @Get()
  getHello(): string {
    return this.batchService.getHello();
  }
}
function TimeOut(arg0: number): (target: BatchController, propertyKey: "getHello", descriptor: TypedPropertyDescriptor<() => string>) => void | TypedPropertyDescriptor<() => string> {
  throw new Error('Function not implemented.');
}

