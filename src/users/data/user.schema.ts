import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as mongoose from 'mongoose';
import { isEmail } from 'validator';

export type UserDocument = User & Document;

@Schema()
export class User {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true, validate: [isEmail] })
  email: string;

  @Prop({ required: false })
  avatar: string;

  _id: mongoose.Types.ObjectId;
}

export const UserSchema = SchemaFactory.createForClass(User);
