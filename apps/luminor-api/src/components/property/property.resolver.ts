import { Mutation, Resolver } from '@nestjs/graphql';
import { PropertyService } from './property.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { AuthMember } from '../auth/decorators/authMember.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { MemberType } from '../../libs/enums/member.enum';
import { UseGuards } from '@nestjs/common';

@Resolver()
export class PropertyResolver {
    constructor(private readonly propertyService: PropertyService) {}
    
    @Roles(MemberType.AGENT)
    @UseGuards(AuthGuard)
    @Mutation(() => String)
    public async createProperty(): Promise<string> {
        return 'property'
    }
}
