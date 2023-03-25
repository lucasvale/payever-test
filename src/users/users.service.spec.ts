import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { EmailService } from '../email/email.service';
import { RabbitMQService } from '../rabbitmq/rabbitmq.service';
import { usersProviders } from './users.providers';
import { DatabaseModule } from '../db/db.module';

import * as mongoose from 'mongoose';
import { CreateUserDto } from './data/user.dto';
import { HttpException } from '@nestjs/common';

import { faker } from '@faker-js/faker';

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        EmailService,
        RabbitMQService,
        ...usersProviders,
      ],
      imports: [DatabaseModule],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  describe('create', () => {
    it('create an user', async () => {
      const user: CreateUserDto = {
        name: faker.internet.userName(),
        email: faker.internet.email(),
      };

      const result = await service.create(user);

      expect(result).toMatchObject({
        _id: expect.any(mongoose.Types.ObjectId),
        name: user.name,
        email: user.email,
      });

      const savedUser = await service.findOne(String(result._id));

      expect(savedUser).toEqual(
        expect.objectContaining({
          name: savedUser.name,
          email: savedUser.email,
        }),
      );
    });
  });

  describe('getUsers', () => {
    it('return all users', async () => {
      const user: CreateUserDto = {
        name: faker.internet.userName(),
        email: faker.internet.email(),
      };

      const createdUser = await service.create(user);

      const results = await service.findAll();

      expect(results).toHaveLength(results.length);

      expect(results).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            name: createdUser.name,
            email: createdUser.email,
            avatar: createdUser.avatar,
          }),
        ]),
      );
    });
  });

  describe('getUserById', () => {
    it('return a user by ID', async () => {
      const user: CreateUserDto = {
        name: faker.internet.userName(),
        email: faker.internet.email(),
      };

      const createdUser = await service.create(user);

      const result = await service.findOne(String(createdUser._id));

      expect(result).toEqual(
        expect.objectContaining({
          name: createdUser.name,
          email: createdUser.email,
        }),
      );
    });
  });

  describe('uploadAvatar', () => {
    const mockedFile = {
      originalname: 'avatar.jpg',
      buffer: Buffer.from('some avatar image content'),
    };

    it('upload user avatar', async () => {
      const results = await service.findAll();

      if (results.length > 0) {
        const user = results[0];

        const result = await service.uploadAvatar(
          String(user._id),
          mockedFile.buffer.toString('base64'),
        );

        expect(result).toEqual(
          expect.objectContaining({
            name: user.name,
            avatar: mockedFile.buffer.toString('base64'),
          }),
        );
      }
    });

    it('empty image', async () => {
      await expect(service.uploadAvatar('', '')).rejects.toThrow(HttpException);
    });
  });
});
