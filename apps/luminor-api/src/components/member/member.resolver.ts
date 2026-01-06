import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { MemberService } from './member.service';
import { LoginInput, MemberInput } from '../../libs/dto/member/member.input';
import { Member } from '../../libs/dto/member/member';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/guards/auth.guard';
import { AuthMember } from '../auth/decorators/authMember.decorator';
import type { ObjectId } from 'mongoose';
import { RolesGuard } from '../auth/guards/roles.guard';
import { MemberType } from '../../libs/enums/member.enum';
import { Roles } from '../auth/decorators/roles.decorator';
import { MemberUpdate } from '../../libs/dto/member/member.update';

@Resolver()
export class MemberResolver {
  constructor(private readonly memberService: MemberService) {}
  @Mutation(() => Member)
  public async signup(@Args('input') input: MemberInput): Promise<Member> {
    console.log('Mutation: sugnup');
    console.log('signup input:', input);
    return await this.memberService.signup(input);
  }

  @Mutation(() => Member)
  public async login(@Args('input') input: LoginInput): Promise<Member> {
    console.log('Mutation: login');
    return await this.memberService.login(input);
  }
  @UseGuards(AuthGuard)
  @Mutation(() => Member)
  public async updateMember(
    @Args('input') input: MemberUpdate,
    @AuthMember('_id') memberId: ObjectId,
  ): Promise<Member> {
    console.log('Mutation: UpdateMember');
    return await this.memberService.updateMember(memberId, input);
  }

  @UseGuards(AuthGuard)
  @Query(() => String)
  public async checkAuth(@AuthMember('memberNick') memberNick: string): Promise<string> {
    console.log('query: checkAuth ');
    return `Hi ${memberNick}`;
  }

  @Roles(MemberType.USER)
  @UseGuards(RolesGuard)
  @Query(() => String)
  public async checkAuthRolsGuard(@AuthMember() authMember: Member) {
    return `Hi ${authMember.memberNick}, you are ${authMember.memberType} `;
  }

  @Query(() => String)
  public async getMember(): Promise<string> {
    return await this.memberService.getMember();
  }

  /** ADMIN */

  //AUTH
  @Roles(MemberType.ADMIN)
  @UseGuards(RolesGuard)
  @Mutation(() => String)
  public async getAllMembersByAdmin(): Promise<string> {
    return await this.memberService.getAllMembersByAdmin();
  }

  @Mutation(() => String)
  public async updateMemberByAdmin(): Promise<string> {
    return await this.memberService.updateMemberByAdmin();
  }
}
