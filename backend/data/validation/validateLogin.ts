import { Collection } from 'mongodb';
import { User } from '../../models/user';

export type UserId = string;

export interface ValidationResult {
  user: User | null;
  error?: string;
}

export async function validateLogin(
  username: string,
  password: string,
  collection: Collection<User>
): Promise<ValidationResult> {
  try {
    const user = await collection.findOne({ name: username });
    console.log('Fetched user from DB:', user);

    if (!user) {
      return {
        user: null,
        error: 'User not found',
      };
    }

    if (user.password !== password) {
      return {
        user: null,
        error: 'Invalid password',
      };
    }

    return { user };
  } catch (error) {
    console.error('Error during login validation:', error);
    return {
      user: null,
      error: 'Database error',
    };
  }
}
