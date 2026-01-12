import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { BoardArticle, BoardArticles } from '../../libs/dto/board-article/board-article';
import {
  AllBoardArticlesInquiry,
  BoardArticleInput,
  BoardArticlesInquiry,
} from '../../libs/dto/board-article/board-article.input';
import { Direction, Message } from '../../libs/enums/common.enum';
import { MemberService } from '../member/member.service';
import { ViewService } from '../view/view.service';
import { BoardArticleStatus } from '../../libs/enums/board-article.enum';
import { ViewGroup } from '../../libs/enums/view.enum';
import { StatisticModifier, T } from '../../libs/types/common';
import { BoardArticleUpdate } from '../../libs/dto/board-article/board-article.update';
import { lookupMember, shapeIntoMongoObjectId } from '../../libs/config';
import { count } from 'console';

@Injectable()
export class BoardArticleService {
  constructor(
    @InjectModel('BoardArticle')
    private readonly boardArticleModel: Model<BoardArticle>,
    private memberService: MemberService,
    private viewService: ViewService,
  ) {}

  public async createBoardArticle(memberId: ObjectId, input: BoardArticleInput): Promise<BoardArticle> {
    input.memberId = memberId;
    try {
      const result = await this.boardArticleModel.create(input);
      await this.memberService.memberStatsEditor({ _id: memberId, targetKey: 'memberArticles', modifier: 1 });
      return result;
    } catch (err) {
      console.log('Error, Service.model', err.message);
      throw new BadRequestException(Message.CREATE_FAILED);
    }
  }

  public async getBoardArticle(articleId: ObjectId, memberId: ObjectId): Promise<BoardArticle> {
    const search = { _id: articleId, articleStatus: BoardArticleStatus.ACTIVE };
    const result: BoardArticle | null = await this.boardArticleModel.findOne(search).lean().exec();
    if (!result) throw new InternalServerErrorException(Message.NO_DATA_FOUND);
    if (memberId) {
      const newView = await this.viewService.recordView({
        memberId: memberId,
        viewRefId: articleId,
        viewGroup: ViewGroup.ARTICLE,
      });
      if (newView) {
        await this.articleStatsEditor({ _id: articleId, targetKey: 'articleViews', modifier: 1 });
        result.articleViews++;
      }
    }
    result.memberData = await this.memberService.getMember(null, result.memberId);

    return result;
  }

  public async updateBoardArticle(memberId: ObjectId, input: BoardArticleUpdate): Promise<BoardArticle> {
    const { _id, ...updateData } = input;
    const articleId = shapeIntoMongoObjectId(_id);
    const search = {
      _id: articleId,
      memberId: memberId,
      articleStatus: BoardArticleStatus.ACTIVE,
    };
    const result = await this.boardArticleModel.findOneAndUpdate(search, updateData, { new: true }).exec();
    if (!result) throw new InternalServerErrorException(Message.UPDATE_FALED);
    if (result.articleStatus === BoardArticleStatus.DELETE) {
      await this.memberService.memberStatsEditor({
        _id: memberId,
        targetKey: 'memberArticles',
        modifier: -1,
      });
    }

    return result;
  }
  public async getBoardArticles(input: BoardArticlesInquiry): Promise<BoardArticles> {
    const { articleCategory, text, memberId } = input.search;

    // Match
    const match: T = {
      articleStatus: BoardArticleStatus.ACTIVE,
    };

    if (articleCategory) match.articleCategory = articleCategory;
    if (text) match.articleTitle = { $regex: new RegExp(text, 'i') };
    if (memberId) match.memberId = shapeIntoMongoObjectId(memberId);

    // Sort
    const sort: T = {
      [input?.sort ?? 'createdAt']: input?.direction ?? Direction.DESC,
    };

    // Aggregate
    const result = await this.boardArticleModel
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

    if (!result?.length) {
      throw new InternalServerErrorException(Message.NO_DATA_FOUND);
    }

    return result[0];
  }

  /** ADMIN */
  public async getAllBoardArticlesByAdmin(input: AllBoardArticlesInquiry): Promise<BoardArticles> {
    const { articleCategory, articleStatus } = input.search;

    //match
    const match: T = {};

    if (articleCategory) match.articleCategory = articleCategory;
    if (articleStatus) match.articleStatus = articleStatus;

    //sort
    const sort = { [input?.sort ?? 'createdAt']: input?.direction ?? Direction.DESC };

    //aggregate
    const result = await this.boardArticleModel.aggregate([
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
    ]).exec();
    if (!result.length) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

    return result[0];
  }

  public async updateBoardArticleByAdmin(input: BoardArticleUpdate): Promise<BoardArticle> {
    const { _id, ...updateData } = input;
    const search: T = {_id: _id, articleStatus: BoardArticleStatus.ACTIVE};
    const result = await this.boardArticleModel.findOneAndUpdate(search, updateData, {new:true}).exec();
    if(!result) throw new InternalServerErrorException(Message.UPDATE_FALED)
    if(result.articleStatus === BoardArticleStatus.DELETE) await this.memberService.memberStatsEditor({
        _id: result.memberId,
        targetKey: 'memberArticles',
        modifier: -1,
      });

      return result;
  }

  public async removeBoardArticleByAdmin(articleId: ObjectId): Promise<BoardArticle> {
    const search = {_id: articleId, articleStatus: BoardArticleStatus.DELETE};
    const result = await this.boardArticleModel.findOneAndDelete(search).exec();
    if(!result) throw new InternalServerErrorException(Message.REMOVE_FAILED);
    return result;
  }


  /** 8888888888888888888888888888888888888 */
  public async articleStatsEditor(input: StatisticModifier): Promise<BoardArticle | null> {
    const { _id, targetKey, modifier } = input;
    return await this.boardArticleModel
      .findByIdAndUpdate(_id, { $inc: { [targetKey]: modifier } }, { new: true })
      .exec();
  }
}
