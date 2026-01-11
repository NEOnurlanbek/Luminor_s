import { Field, InputType, Int } from '@nestjs/graphql';
import type { ObjectId } from 'mongoose';
import { BoardArticleCategory, BoardArticleStatus } from '../../enums/board-article.enum';
import { IsOptional, Length } from 'class-validator';

@InputType()
export class BoardArticle {
  @Field(() => String)
  _id: ObjectId;

  @IsOptional()
  @Field(() => BoardArticleStatus, { nullable: true })
  articleStatus?: BoardArticleStatus;

  @IsOptional()
  @Length(3, 50)
  @Field(() => String, { nullable: true })
  articleTitle?: string;

  @IsOptional()
  @Length(3, 300)
  @Field(() => String, { nullable: true })
  articleContent?: string;

  @IsOptional()
  @Field(() => String, { nullable: true })
  articleImage?: string;
}
