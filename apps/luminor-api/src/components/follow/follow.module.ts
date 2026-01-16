import { Module } from '@nestjs/common';
import { FollowService } from './follow.service';
import { FollowResolver } from './follow.resolver';
import { MongooseModule } from '@nestjs/mongoose';
import FollowSchema from '../../schemas/Follow.model';
import { MemberModule } from '../member/member.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'Follow', schema: FollowSchema }]),
  MemberModule,
  AuthModule,
],
  providers: [FollowResolver, FollowService],
  exports: [FollowService],
})
export class FollowModule {}
