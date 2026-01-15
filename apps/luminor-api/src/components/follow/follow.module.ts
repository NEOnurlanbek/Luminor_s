import { Module } from '@nestjs/common';
import { FollowService } from './follow.service';
import { FollowResolver } from './follow.resolver';
import { MongooseModule } from '@nestjs/mongoose';
import FollowSchema from '../../schemas/Follow.model';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'Follow', schema: FollowSchema }])],
  providers: [FollowResolver, FollowService],
  exports: [FollowService],
})
export class FollowModule {}
