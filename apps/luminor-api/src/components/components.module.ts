import { Module } from '@nestjs/common';
import { MemberModule } from './member/member.module';
import { PropertyModule } from './property/property.module';
import { AuthModule } from './auth/auth.module';
import { ViewModule } from './view/view.module';
@Module({
  imports: [MemberModule, PropertyModule, AuthModule, ViewModule],
  exports: [MemberModule],
})
export class ComponentsModule {}
