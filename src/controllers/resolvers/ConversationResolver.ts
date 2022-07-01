import {
  Arg,
  Authorized,
  Ctx,
  Field,
  InputType,
  Mutation,
  Query,
  Resolver
} from 'type-graphql';
import { Conversation } from '../../entities/Conversation';
import { Permission } from '../../entities/Permission';
import { User } from '../../entities/User';
import { Context } from '../../types/Context';
import Logger from '../../utils/logger';

// function sleep(ms: number) {
//   return new Promise((resolve) => setTimeout(resolve, ms));
// }

@InputType()
class ConversationInput {
  @Field()
  title: string;

  @Field()
  description: string;
}

@Resolver()
export class ConversationResolver {
  logger = new Logger();

  @Authorized()
  @Mutation(() => Conversation)
  async CreateConversation(
    @Arg('options') options: ConversationInput,
    @Ctx() { req, em }: Context
  ) {
    const user = await em.getRepository(User).findOneOrFail({ id: req.userId });
    const permission = new Permission();
    permission.user = user;
    permission.type = 'admin';

    const conversation = new Conversation();
    conversation.title = options.title;
    conversation.description = options.description;
    try {
      conversation.members.add(permission);
      await em.getRepository(Conversation).persistAndFlush(conversation);
      return conversation;
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  // todo: add pagination
  @Authorized()
  @Query(() => [Conversation])
  async GetConversations(@Ctx() { em }: Context) {
    return await em.getRepository(Conversation).find({}, { populate: true });
  }

  @Authorized()
  @Query(() => Conversation)
  async GetConversation(
    @Arg('conversationid', () => String) conversationid: string,
    @Ctx() { em }: Context
  ) {
    const data = await em
      .getRepository(Conversation)
      .findOne({ id: conversationid }, { populate: true });
    return data;
  }

  @Authorized()
  @Mutation(() => Boolean)
  async DeleteConversation(
    @Arg('id', () => String) id: string,
    @Ctx() { em }: Context
  ) {
    const conversation = await em
      .getRepository(Conversation)
      .findOneOrFail({ id }, { populate: ['members'] });
    await em.getRepository(Conversation).removeAndFlush(conversation);
    return true;
  }

  @Authorized()
  @Mutation(() => Boolean)
  async RemoveFromConversation(
    @Arg('id', () => String) id: string,
    @Ctx() { em }: Context
  ) {
    const interview = await em
      .getRepository(Conversation)
      .findOneOrFail({ id }, { populate: ['members'] });
    await em.getRepository(Conversation).removeAndFlush(interview);
    return true;
  }

  @Authorized()
  @Query(() => Conversation)
  async AddToConversation(@Arg('id') id: string, @Ctx() { em }: Context) {
    const interviewRepository = em.getRepository(Conversation);
    return interviewRepository.findOne({
      id: id
    });
  }

  @Authorized()
  @Query(() => Conversation)
  async EditConversation(@Arg('id') id: string, @Ctx() { em }: Context) {
    const interviewRepository = em.getRepository(Conversation);
    return interviewRepository.findOne({
      id: id
    });
  }
}
