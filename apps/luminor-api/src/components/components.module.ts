import { Module } from '@nestjs/common';
import { MemberModule } from './member/member.module';
import { PropertyModule } from './property/property.module';
import { AuthModule } from './auth/auth.module';
import { ViewModule } from './view/view.module';
import { BoardArticleModule } from './board-article/board-article.module';
import { CommentModule } from './comment/comment.module';
import { LikeModule } from './like/like.module';
import { FollowModule } from './follow/follow.module';
@Module({
  imports: [MemberModule, PropertyModule, AuthModule, ViewModule, BoardArticleModule, CommentModule, LikeModule, FollowModule],
  exports: [MemberModule],
})
export class ComponentsModule {}
