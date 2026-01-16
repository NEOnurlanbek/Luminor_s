import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { Follower, Followers, Following, Followings } from '../../libs/dto/follow/follow';
import { Direction, Message } from '../../libs/enums/common.enum';
import { MemberService } from '../member/member.service';
import { FollowInquiry } from '../../libs/dto/follow/follow.input';
import { lookupFollowerData, lookupFollowingData } from '../../libs/config';
import { T } from '../../libs/types/common';

@Injectable()
export class FollowService {
  constructor(
    @InjectModel('Follow') private readonly followModel: Model<Follower | Following>,
    private memberService: MemberService,
  ) {}

  public async subscribe(follower: ObjectId, following: ObjectId): Promise<Following> {
    if (follower.toString() === following.toString()) {
      throw new InternalServerErrorException(Message.SELF_SUBSCRIPTION_DENIED);
    }

    const targetId = await this.memberService.getMember(null, following);
    if (!targetId) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

    const result = await this.registerSubscribition(follower, following);

    await this.memberService.memberStatsEditor({ _id: follower, targetKey: 'memberFollowings', modifier: 1 });
    await this.memberService.memberStatsEditor({ _id: following, targetKey: 'memberFollowers', modifier: 1 });

    return result;
  }

  private async registerSubscribition(followerId: ObjectId, followingId): Promise<Following> {
    try {
      return await this.followModel.create({
        followingId: followingId,
        followerId: followerId,
      });
    } catch (err) {
      throw new BadRequestException(Message.CREATE_FAILED);
    }
  }

  public async unsubscribe(followerId: ObjectId, followingId: ObjectId): Promise<Following> {
    const targetData = await this.memberService.getMember(null, followingId);
    if (!targetData) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

    const result = await this.followModel.findOneAndDelete({ followingId: followingId, followerId: followerId }).exec();
    if (!result) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

    await this.memberService.memberStatsEditor({ _id: followerId, targetKey: 'memberFollowings', modifier: -1 });
    await this.memberService.memberStatsEditor({ _id: followingId, targetKey: 'memberFollowers', modifier: -1 });

    return result;
  }

  public async getMemberFollowings(memberId: ObjectId, input: FollowInquiry): Promise<Followings> {
    const { page, limit, search } = input;
    if (!search?.followerId) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

    const match: T = { followerId: search.followerId };
    const result = await this.followModel.aggregate([
      { $match: match },
      { $sort: { createdAt: Direction.DESC }},
      {
        $facet: {
          list: [
            { $skip: (page - 1) * limit }, 
            { $limit: limit },
            lookupFollowingData,
            {$unwind: '$followingData'}
          ],
          metaCounter: [{$count: 'total'}],
        },
      },
    ]).exec();
    if(!result) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

    return result[0];
  }

  public async getMemberFollowers(memberId: ObjectId, input: FollowInquiry): Promise<Followers> {
    const {page, limit, search} = input;
    if(!search?.followingId) throw new InternalServerErrorException(Message.BAD_REQUEST);

    const match: T = {followingId: search.followingId}

    const result = await this.followModel.aggregate([
      {$match: match}, 
      {$sort: {createdAt: Direction.DESC}},
      {
        $facet: {
          list: [
            {$skip: (page - 1) * limit},
            {$limit: limit},
            lookupFollowerData,
            {$unwind: '$followerData'}
          ],
          metaCounter: [{$count: 'total'}]
        }
      }
    ]).exec();
    if(!result) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

    return result[0];
  }
}
