import {
  BaseEntity,
  Entity,
  PrimaryKey,
  Property,
  SerializedPrimaryKey,
  Unique
} from '@mikro-orm/core';
import { ObjectId } from '@mikro-orm/mongodb';
import { Field, InputType, ObjectType } from 'type-graphql';

type UserStatus = 'unverified' | 'verified';

@ObjectType()
@Entity()
@Unique({ properties: ['username', 'email'] })
export class User extends BaseEntity<User, '_id'> {
  @PrimaryKey()
  _id!: ObjectId;

  @Field(() => String)
  @SerializedPrimaryKey()
  id!: string;

  @Field(() => String)
  @Property()
  name!: string;

  @Field(() => String)
  @Property()
  @Unique()
  username!: string;

  @Field()
  @Property()
  verified!: UserStatus;

  @Field(() => String)
  @Property()
  @Unique()
  email!: string;

  @Property()
  password!: string;

  @Field({ nullable: true })
  @Property()
  details?: string;

  @Field()
  @Property()
  createdAt: Date = new Date();

  @Field()
  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();
}

@InputType()
export class RegistrationInput {
  @Field(() => String)
  name!: string;

  @Field(() => String)
  username!: string;

  @Field(() => String)
  email!: string;

  @Field(() => String)
  password!: string;

  @Field(() => String)
  details!: string;
}

@InputType()
export class LoginInput {
  @Field()
  email: string;

  @Field()
  password: string;
}
