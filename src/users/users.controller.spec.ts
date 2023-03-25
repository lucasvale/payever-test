import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { EmailService } from '../email/email.service';
import { RabbitMQService } from '../rabbitmq/rabbitmq.service';
import { usersProviders } from './users.providers';
import { DatabaseModule } from '../db/db.module';
import { CreateUserDto } from './data/user.dto';
import { HttpException, HttpStatus, NotFoundException } from '@nestjs/common';

import { faker } from '@faker-js/faker';

describe('UsersController', () => {
  let controller: UsersController;
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
      controllers: [UsersController],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  describe('createUser', () => {
    it('create a user', async () => {
      const createdUser: CreateUserDto = {
        name: faker.internet.userName(),
        email: faker.internet.email(),
      };

      const result = await controller.register(createdUser);

      const user = await service.findOne(String(result.data._id));

      expect(user).toEqual(
        expect.objectContaining({
          name: createdUser.name,
          email: createdUser.email,
          avatar: createdUser.avatar,
        }),
      );
    });
  });

  describe('findOne', () => {
    it('return user by ID', async () => {
      const user: CreateUserDto = {
        name: faker.internet.userName(),
        email: faker.internet.email(),
      };

      const createdUser = await service.create(user);

      const result = await controller.findOne({ id: String(createdUser._id) });

      expect(result.data).toEqual(
        expect.objectContaining({
          name: createdUser.name,
          email: createdUser.email,
        }),
      );
    });

    it('not find a user by ID', async () => {
      await expect(controller.findOne({ id: '1' })).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should pass an id', async () => {
      await expect(controller.findOne({ id: undefined })).rejects.toThrow(
        HttpException,
      );
    });
  });

  describe('listAll', () => {
    it('return all users', async () => {
      const user: CreateUserDto = {
        name: faker.internet.userName(),
        email: faker.internet.email(),
      };

      const createdUser = await service.create(user);

      const result = await controller.listUsers();

      expect(result.data).toHaveLength(result.data.length);

      expect(result.data).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            name: createdUser.name,
            email: createdUser.email,
          }),
        ]),
      );
    });
  });

  describe('uploadAvatar', () => {
    const mockedFile = {
      originalname: 'avatar.jpg',
      buffer: Buffer.from('some avatar image content'),
    };

    it('upload user avatar', async () => {
      const users = await controller.listUsers();

      if (users.data.length > 0) {
        const user = users.data[0];
        const result = await controller.uploadAvatar(
          mockedFile,
          String(user._id),
        );
        expect(result).toEqual({ statusCode: HttpStatus.CREATED, data: {} });
      }
    });

    it('user not found', async () => {
      const userId = '';
      await expect(controller.uploadAvatar(mockedFile, userId)).rejects.toThrow(
        HttpException,
      );
    });

    it('avatar not found', async () => {
      const userId = '123';
      const emptyFile = { originalname: 'avatar.jpg' };
      await expect(controller.uploadAvatar(emptyFile, userId)).rejects.toThrow(
        HttpException,
      );
    });

    it('avatar extension error', async () => {
      const userId = '123';
      const invalidFile = {
        originalname: 'avatar.pdf',
        buffer: Buffer.from('some invalid file content'),
      };
      await expect(
        controller.uploadAvatar(invalidFile, userId),
      ).rejects.toThrow(HttpException);
    });
  });
});
