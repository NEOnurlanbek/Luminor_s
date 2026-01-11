import { registerEnumType } from '@nestjs/graphql';

export enum BoardArticleCategory {
  FREE = 'FREE',
  RECOMMEND = 'RECOMMEND',
  NEWS = 'NEWS',
  HUMOR = 'HUMOR',
}

registerEnumType(BoardArticleCategory, {
  name: 'BoardArticleCategory',
});

export enum BoardArticleStatus {
    ACTIVE = 'ACTIV',
    DELETE = 'DELETE',
  }

  registerEnumType(BoardArticleStatus, {
    name: 'BoardArticleStatus',
  });