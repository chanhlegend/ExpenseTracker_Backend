import { Types } from 'mongoose';

export interface JwtUser {
  _id: Types.ObjectId;
  name: string;
  email: string;
}
