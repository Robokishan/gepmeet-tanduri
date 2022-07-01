import {
  BaseEntity,
  Cascade,
  Collection,
  Entity,
  OneToMany,
  PrimaryKey,
  Property,
  SerializedPrimaryKey
} from '@mikro-orm/core';
import { ObjectId } from '@mikro-orm/mongodb';
import { Field, ObjectType } from 'type-graphql';
import { Permission } from './Permission';

@ObjectType()
@Entity()
export class Conversation extends BaseEntity<Conversation, '_id'> {
  @PrimaryKey()
  _id!: ObjectId;

  @Field()
  @SerializedPrimaryKey()
  id!: string;

  @Field()
  @Property()
  title!: string;

  @Field()
  @Property()
  description!: string;

  @Field(() => [Permission], { nullable: true })
  @OneToMany(() => Permission, (permission) => permission.conversation, {
    nullable: true,
    cascade: [Cascade.ALL]
  })
  members = new Collection<Permission>(this);
}
