import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { Comment, Comments } from '../../libs/dto/comment/comment';
import { CommentInput, CommentsInquiry } from '../../libs/dto/comment/comment.input';
import { MemberService } from '../member/member.service';
import { PropertyService } from '../property/property.service';
import { BoardArticleService } from '../board-article/board-article.service';
import { Direction, Message } from '../../libs/enums/common.enum';
import { CommentGroup, CommentStatus } from '../../libs/enums/comment.enum';
import { CommentUpdate } from '../../libs/dto/comment/comment.update';
import { T } from '../../libs/types/common';
import { lookupMember } from '../../libs/config';

@Injectable()
export class CommentService {
  constructor(
    @InjectModel('Comment')
    private readonly commentModel: Model<Comment>,
    private readonly memberService: MemberService,
    private readonly propertyService: PropertyService,
    private readonly boarArticleService: BoardArticleService,
  ) {}

  public async createComment(memberId: ObjectId, input: CommentInput): Promise<Comment> {
    input.memberId = memberId;
    let result: Comment | null = null;
    try {
      result = await this.commentModel.create(input);
    } catch (err) {
      console.log('Error, Service model', err);
      throw new InternalServerErrorException(Message.CREATE_FAILED);
    }
    switch (result.commentGroup) {
      case CommentGroup.PROPERTY:
        await this.propertyService.propertyStatsEditor({
          _id: result.commentRefId,
          targetKey: 'propertyComments',
          modifier: 1,
        });
        break;
      case CommentGroup.MEMBER:
        await this.memberService.memberStatsEditor({
          _id: result.commentRefId,
          targetKey: 'memberComments',
          modifier: 1,
        });
        break;
      case CommentGroup.ARTICLE:
        await this.boarArticleService.articleStatsEditor({
          _id: result.commentRefId,
          targetKey: 'articleComments',
          modifier: 1,
        });
        break;
    }
    if (!result) throw new InternalServerErrorException(Message.CREATE_FAILED);

    return result;
  }

  public async updateComment(memberId: ObjectId, input: CommentUpdate): Promise<Comment> {
    const { _id, ...updateData } = input;
    const search = { _id: _id, memberId: memberId, commentStatus: CommentStatus.ACTIVE };

    const result = await this.commentModel.findOneAndUpdate(search, updateData, { new: true });
    if (!result) throw new InternalServerErrorException(Message.UPDATE_FALED);

    if (result?.commentStatus === CommentStatus.DELETE) {
      switch (result.commentGroup) {
        case CommentGroup.PROPERTY:
          await this.propertyService.propertyStatsEditor({
            _id: result.commentRefId,
            targetKey: 'propertyComments',
            modifier: -1,
          });
          break;
        case CommentGroup.MEMBER:
          await this.memberService.memberStatsEditor({
            _id: result.commentRefId,
            targetKey: 'memberComments',
            modifier: -1,
          });
          break;
        case CommentGroup.ARTICLE:
          await this.boarArticleService.articleStatsEditor({
            _id: result.commentRefId,
            targetKey: 'articleComments',
            modifier: -1,
          });
          break;
      }
    }
    return result;
  }

  public async getComments(input: CommentsInquiry): Promise<Comments> {
    const {commentRefId} = input.search;
    //match
    const match: T = {commentRefId: commentRefId, commentStatus: CommentStatus.ACTIVE };

    //sort
    const sort: T = { [input.sort ?? 'createdAt']: input.direction ?? Direction.DESC };

    //aggregate
    const result = await this.commentModel
      .aggregate([
        { $match: match },
        { $sort: sort },
        {
          $facet: {
            list: [
              { $skip: (input.page - 1) * input.limit },
              { $limit: input.limit },
              lookupMember,
              { $unwind: '$memberData' },
            ],
            metaCounter: [{ $count: 'total' }],
          },
        },
      ])
      .exec();
    if (!result.length) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

    return result[0];
  }
}
