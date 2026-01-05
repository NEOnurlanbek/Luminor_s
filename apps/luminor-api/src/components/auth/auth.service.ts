import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { T } from '../../libs/types/common';
import { Member } from '../../libs/dto/member/member';
import { shapeIntoMongoObjectId } from '../../libs/config';

@Injectable()
export class AuthService {
  constructor(private jwtServer: JwtService) {}
  public async hashPassword(memberPassword: string): Promise<string> {
    const solt = await bcrypt.genSalt();
    return await bcrypt.hash(memberPassword, solt);
  }

  public async comparePassword(password: string, hashedPassword: string | undefined): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword);
  }

  public async createToken(member: Member): Promise<string> {
    const payload: T = {};

    Object.keys(member['_doc'] ? member['_doc'] : member).map((ele) => {
      payload[`${ele}`] = member[`${ele}`];
    });
    delete payload.memberPassword;
    console.log('payload', payload);
    return await this.jwtServer.signAsync(payload);
  }

  public async verifyToken(token: string): Promise<Member> {
    const member = await this.jwtServer.verifyAsync(token);
    member._id = shapeIntoMongoObjectId(member._id);
    return member;
  }
}
