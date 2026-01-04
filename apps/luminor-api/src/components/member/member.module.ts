import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MemberResolver } from './member.resolver';
import { MemberService } from './member.service';
import MemberSchema from '../../schemas/Member.model';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'Member', schema: MemberSchema }])],
  providers: [MemberService, MemberResolver],
  exports: [MemberService],
})
export class MemberModule {}
