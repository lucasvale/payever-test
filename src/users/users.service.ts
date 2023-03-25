import {
  Injectable,
  Inject,
  NotFoundException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Model } from 'mongoose';
import { User, UserDocument } from './data/user.schema';
import { EmailService } from '../email/email.service';
import { RabbitMQService } from '../rabbitmq/rabbitmq.service';

import { CreateUserDto } from './data/user.dto';

@Injectable()
export class UsersService {
  constructor(
    @Inject('USER_MODEL') private userModel: Model<User>,
    private readonly emailService: EmailService,
    private readonly rabbitMQService: RabbitMQService,
  ) {}

  async create(user: CreateUserDto): Promise<User> {
    try {
      const createdUser = new this.userModel(user);
      await createdUser.save();
      this.emailService.sendEmail(createdUser.email);

      await this.rabbitMQService.publish(
        'user-created',
        `user created: ${createdUser._id}`,
      );

      return createdUser;
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
    }
  }

  async findAll(): Promise<UserDocument[] | null> {
    return await this.userModel.find().exec();
  }

  async findOne(id: string): Promise<UserDocument | null> {
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      const user = await this.userModel.findById(id).exec();
      if (!user) {
        throw new NotFoundException(`User does not found`);
      }
      return user;
    }
    throw new NotFoundException(`User does not found`);
  }

  async getAvatar(id: string): Promise<string | null> {
    const user = await this.findOne(id);

    if (!user.avatar) {
      throw new NotFoundException('Avatar not found');
    }

    return user.avatar;
  }

  async uploadAvatar(id: string, image: string) {
    if (!image) {
      throw new HttpException('Image must be provided', HttpStatus.BAD_REQUEST);
    }

    const user = await this.findOne(id);

    user.avatar = image;

    return await user.save();
  }

  async deleteAvatar(id: string) {
    const user = await this.findOne(id);

    if (!user) {
      throw new Error('User not found');
    }

    // Remove the avatar from the user document
    user.avatar = undefined;
    await user.save();

    return;
  }
}
