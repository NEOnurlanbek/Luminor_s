import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { FollowService } from './follow.service';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/guards/auth.guard';
import { Followers, Following, Followings } from '../../libs/dto/follow/follow';
import type { ObjectId } from 'mongoose';
import { shapeIntoMongoObjectId } from '../../libs/config';
import { AuthMember } from '../auth/decorators/authMember.decorator';
import { FollowInquiry } from '../../libs/dto/follow/follow.input';
import { WithoutGuard } from '../auth/guards/without.guard';

@Resolver()
export class FollowResolver {
  constructor(private readonly followService: FollowService) {}

  @UseGuards(AuthGuard)
  @Mutation(() => Following)
  public async subscribe(@Args('input') input: string, @AuthMember('_id') memberId: ObjectId): Promise<Following> {
    console.log('Mutation: subscribe');
    const following = shapeIntoMongoObjectId(input);
    return await this.followService.subscribe(memberId, following);
  }

  @UseGuards(AuthGuard)
  @Mutation(() => Following)
  public async unsubscribe(@Args('input') input: string, @AuthMember('_id') memberId: ObjectId): Promise<Following> {
    console.log('Mutation: usubscribe');
    const followingId = shapeIntoMongoObjectId(input);
    return await this.followService.unsubscribe(memberId, followingId);
  }

  @UseGuards(WithoutGuard)
  @Query(() => Followings)
  public async getMemberFollowings(@Args('input') input: FollowInquiry, @AuthMember('_id') memberId: ObjectId ):Promise<Followings> {
    console.log('Mutation: getMemberFollowings');
    input.search.followerId = shapeIntoMongoObjectId(input.search.followerId);
    return await this.followService.getMemberFollowings(memberId, input)
  }

  @UseGuards(WithoutGuard)
  @Query(() => Followers)
  public async getMemberFollowers(@Args('input') input: FollowInquiry, @AuthMember('_id') memberId: ObjectId): Promise<Followers> {
    console.log('Query: getMemberFollowers');
    input.search.followingId = shapeIntoMongoObjectId(input?.search?.followingId);
    return await this.followService.getMemberFollowers(memberId, input)
  }

}
