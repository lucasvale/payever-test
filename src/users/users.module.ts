import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { usersProviders } from './users.providers';
import { DatabaseModule } from '../db/db.module';
import { EmailService } from '../email/email.service';
import { RabbitMQService } from '../rabbitmq/rabbitmq.service';

@Module({
  providers: [UsersService, EmailService, RabbitMQService, ...usersProviders],
  controllers: [UsersController],
  imports: [DatabaseModule],
})
export class UsersModule {}
