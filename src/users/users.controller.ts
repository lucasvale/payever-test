import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateUserDto } from './data/user.dto';

@Controller('users')
export class UsersController {
  constructor(private userService: UsersService) {}

  @Get()
  async listUsers() {
    const users = await this.userService.findAll();
    return {
      statusCode: HttpStatus.OK,
      data: users,
    };
  }

  @Post()
  async register(@Body() user: CreateUserDto) {
    const userCreated = await this.userService.create(user);

    return { statusCode: HttpStatus.CREATED, data: userCreated };
  }

  @Get(':id')
  async findOne(@Param() params) {
    if (!params.id) {
      throw new HttpException('id mus be provided', HttpStatus.BAD_REQUEST);
    }

    const user = await this.userService.findOne(params.id);

    return {
      statusCode: HttpStatus.OK,
      data: user,
    };
  }

  @Post(':id/avatar')
  @UseInterceptors(FileInterceptor('avatar'))
  async uploadAvatar(
    @UploadedFile() file,
    @Param('id') id: string,
  ): Promise<any> {
    if (!id) {
      throw new HttpException(
        'User id must be provided',
        HttpStatus.BAD_REQUEST,
      );
    }

    const avatar = file?.buffer?.toString('base64');

    if (!avatar) {
      throw new HttpException(
        'User avatar image must be provided',
        HttpStatus.BAD_REQUEST,
      );
    }

    const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif'];

    const fileExtesion = file.originalname.split('.')[1];

    if (!allowedExtensions.includes(fileExtesion)) {
      throw new HttpException(
        'Image extension not allowed',
        HttpStatus.BAD_REQUEST,
      );
    }

    await this.userService.uploadAvatar(id, avatar);

    return {
      statusCode: HttpStatus.CREATED,
      data: {},
    };
  }

  @Delete(':id/avatar')
  async deleteAvatar(@Param('id') id: string) {
    await this.userService.deleteAvatar(id);

    return { message: 'Avatar deleted successfully' };
  }

  @Get(':id/avatar')
  async getAvatar(@Param('id') id: string, @Res() res: any) {
    const userAvatar = await this.userService.getAvatar(id);

    res.set('Content-Type', 'image/png');
    res.send(Buffer.from(userAvatar, 'base64'));
  }
}
