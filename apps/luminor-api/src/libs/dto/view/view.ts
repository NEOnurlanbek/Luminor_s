import { Field, ObjectType } from "@nestjs/graphql";
import type { ObjectId } from "mongoose";
import { ViewGroup } from "../../enums/view.enum";


@ObjectType()
export class View {
    @Field(() => String)
    _id: ObjectId;

    @Field(() => String)
    memberId: ObjectId;

    @Field(() => String)
    viewRefId: ObjectId;

    @Field(() => ViewGroup)
    viewGroup: ViewGroup;
    
    @Field(() => Date)
    createdAt: Date;

    @Field(() => Date)
    updatedAt: Date;
}