import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { FollowService } from './follow.service';


@Resolver()
export class FollowResolver {
  constructor(private readonly followService: FollowService) {}

}
