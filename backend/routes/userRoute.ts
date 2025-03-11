import express from 'express';
import { getDb, connect } from '../data/dbConnection';
import { Collection, ObjectId } from 'mongodb';
import { User } from '../models/user.js';
import { validateLogin } from '../data/validation/validateLogin';
import { generateToken } from '../data/authMiddleware';

const userRouter = express.Router();

// GET all users
userRouter.get('/', async (req, res) => {
  try {
    const db = getDb();
    const users = await db.collection('users').find({}).toArray();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error getting users', error });
  }
});

// POST login
userRouter.post('/login', async (req, res) => {
  console.log('Received login request:', req.body);
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      status: 'error',
      message: 'Validation error',
      details: {
        missingFields: !username
          ? ['username']
          : !password
          ? ['password']
          : ['username', 'password'],
      },
    });
  }

  try {
    await connect();
    const userCollection: Collection<User> = getDb().collection('users');

    const validationResult = await validateLogin(
      username,
      password,
      userCollection
    );

    if (!validationResult.user) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication failed',
        details: {
          error: validationResult.error,
        },
      });
    }

    const token = generateToken(validationResult.user.userId);

    return res.status(200).json({
      status: 'success',
      message: 'Login successful',
      data: {
        token,
        user: {
          userId: validationResult.user.userId,
          name: validationResult.user.name,
          class: validationResult.user.class,
        },
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Server error',
      details: {
        error: 'Please try again later',
      },
    });
  }
});

//POST create new user
userRouter.post('/signup', async (req, res) => {
  console.log('Received signup request:', req.body);
  const { name, password, userClass } = req.body;

  try {
    await connect();
    const userCollection: Collection<User> = getDb().collection('users');

    const existingUser = await userCollection.findOne({ name });
    if (existingUser) {
      res.status(400).json({
        error: 'User already exists',
        message: 'Username already taken',
      });
      return;
    }

    const userId = new ObjectId().toString();
    const _id = new ObjectId();

    const newUser: User = {
      _id,
      userId,
      name,
      password,
      class: userClass,
    };

    await userCollection.insertOne(newUser);

    const token = generateToken(newUser.userId);
    return res.status(201).json({
      status: 'success',
      message: 'User created successfully',
      data: {
        token,
        user: {
          userId: newUser.userId,
          name: newUser.name,
          class: newUser.class,
        },
      },
    });
  } catch (error) {
    console.error('Signup error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Server error',
      details: {
        error: 'Please try again later',
      },
    });
  }
});

// Добавьте этот маршрут к вашему userRouter
userRouter.patch('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const updateData = req.body;

    console.log(`Updating user ${userId} with data:`, updateData);

    await connect();
    const userCollection = getDb().collection('users');

    const result = await userCollection.updateOne(
      { userId },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Пользователь не найден',
      });
    }

    return res.status(200).json({
      status: 'success',
      message: 'Пользователь успешно обновлен',
      data: {
        modifiedCount: result.modifiedCount,
      },
    });
  } catch (error) {
    console.error('Update user error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Ошибка сервера при обновлении пользователя',
      details: {
        error: 'Пожалуйста, попробуйте позже',
      },
    });
  }
});

export { userRouter };
