import { ObjectId } from 'mongodb';

export interface User {
  userId: string;
  name: string;
  password: string;
  class: string;
}
