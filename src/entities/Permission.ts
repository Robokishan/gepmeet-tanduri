import {
  BaseEntity,
  Entity,
  ManyToOne,
  PrimaryKey,
  Property,
  SerializedPrimaryKey
} from '@mikro-orm/core';
import { ObjectId } from '@mikro-orm/mongodb';
import { Field, ObjectType } from 'type-graphql';
import { Conversation } from './Conversation';
import { User } from './User';

@ObjectType()
@Entity()
export class Permission extends BaseEntity<Permission, '_id'> {
  @PrimaryKey()
  _id!: ObjectId;

  @Field()
  @SerializedPrimaryKey()
  id!: string;

  @Field(() => Conversation)
  @ManyToOne(() => Conversation)
  conversation: Conversation;

  @Field(() => User)
  @ManyToOne(() => User, { cascade: [] })
  user!: User;

  @Field()
  @Property()
  type!: 'admin' | 'editor' | 'viewer';
}
