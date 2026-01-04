import { Module } from '@nestjs/common';
import { MemberModule } from './member/member.module';
import { PropertyModule } from './property/property.module';
import { AuthModule } from './auth/auth.module';
@Module({
  imports: [MemberModule, PropertyModule, AuthModule],
  exports: [MemberModule],
})
export class ComponentsModule {}
