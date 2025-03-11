import express from 'express';
import { getDb, connect } from '../data/dbConnection';
import { Collection } from 'mongodb';
import { User } from '../models/user.js';
import { CharacterProfile } from '../models/character';

const profileRouter = express.Router();

profileRouter.get('/', async (req, res) => {
  try {
    const db = getDb();
    const profiles = await db.collection('profiles').find({}).toArray();
    res.json(profiles);
  } catch (error: any) {
    res.status(500).json({ message: 'Error getting profiles' });
  }
});

// Получение профилей пользователя по имени
profileRouter.get('/user/:username', async (req, res) => {
  try {
    const { username } = req.params;
    console.log('Получение профилей для пользователя:', username);

    const db = getDb();
    const profiles = await db
      .collection('profiles')
      .find({
        username: username,
      })
      .toArray();

    res.json(profiles);
  } catch (error) {
    console.error('Ошибка получения профилей:', error);
    res.status(500).json({ message: 'Ошибка получения профилей пользователя' });
  }
});

profileRouter.get('/:userId', async (req, res) => {
  try {
    console.log('Requested userId:', req.params.userId);
    const db = getDb();
    const profile = await db.collection('profiles').findOne({
      userId: req.params.userId,
    });

    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }
    res.json(profile);
  } catch (error: any) {
    res.status(500).json({ message: 'Error getting profile' });
  }
});

profileRouter.post('/', async (req, res) => {
  try {
    const db = getDb();
    const profilesCollection = db.collection('profiles');

    const newProfile = {
      userId: req.body.userId,
      username: req.body.username,
      selectedCharacterName: req.body.selectedCharacterName,
      characterData: {
        ...req.body.characterData,
        challenges: req.body.characterData.challenges || [], // <--- Добавил проверку
      },
    };

    console.log('Saving profile:', newProfile);

    const result = await profilesCollection.insertOne(newProfile);
    res.status(201).json(result);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

// Эндпоинт для обновления прогресса
profileRouter.put('/progress/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { progress, characterData } = req.body;

    console.log(`Received profile update for user ${userId}:`, {
      progress,
      characterData,
    });

    if (!progress) {
      return res.status(400).json({ message: 'Progress data is required' });
    }

    const db = getDb();
    const profileCollection = db.collection('profiles');

    // Проверяем, есть ли профиль пользователя
    const existingProfile = await profileCollection.findOne({ userId });

    if (!existingProfile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    // Подготавливаем данные для обновления
    const updateData: any = {
      progress,
      updatedAt: new Date(),
    };

    // Если переданы данные персонажа, объединяем их с существующими данными
    if (characterData) {
      // Используем индексированный доступ для типизации
      const existingCharacterData = existingProfile['characterData'] || {};

      // Сохраняем существующие массивы, используя индексированный доступ
      const existingAchievements: any[] =
        existingCharacterData['achievements'] || [];
      const existingChallenges: any[] =
        existingCharacterData['challenges'] || [];
      const existingSpecialAbilities: any[] =
        existingCharacterData['specialAbilities'] || [];

      // Если в запросе есть новые массивы, используем их, иначе используем существующие
      let updatedAchievements = existingAchievements;

      // Обновляем отдельные достижения в массиве с типизацией
      if (
        characterData['achievements'] &&
        Array.isArray(characterData['achievements'])
      ) {
        // Для каждого достижения из запроса
        characterData['achievements'].forEach((newAchievement: any) => {
          // Находим соответствующее достижение в существующем массиве
          const existingIndex = existingAchievements.findIndex(
            (ea: any) => ea.name === newAchievement.name
          );

          if (existingIndex !== -1) {
            // Если нашли, обновляем его
            existingAchievements[existingIndex] = {
              ...existingAchievements[existingIndex],
              ...newAchievement,
            };
          } else {
            // Если не нашли, добавляем новое
            existingAchievements.push(newAchievement);
          }
        });

        updatedAchievements = existingAchievements;
      }

      // Обновляем или используем существующие массивы
      const updatedChallenges =
        characterData['challenges'] || existingChallenges;
      const updatedSpecialAbilities =
        characterData['specialAbilities'] || existingSpecialAbilities;

      // Создаем новый объект characterData с обновленными массивами, используя индексированный доступ
      updateData.characterData = {
        ...existingCharacterData,
        ...characterData,
        achievements: updatedAchievements,
        challenges: updatedChallenges,
        specialAbilities: updatedSpecialAbilities,
      };

      if (characterData['name']) {
        updateData.selectedCharacterName = characterData['name'];
      }
    }

    // Обновляем профиль
    const result = await profileCollection.updateOne(
      { userId },
      {
        $set: updateData,
      }
    );

    res.json({
      message: 'Profile updated successfully',
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error('Error updating progress:', error);
    res.status(500).json({ message: 'Error updating progress', error });
  }
});

profileRouter.put('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { characterData, selectedCharacterName, progress } = req.body;

    console.log(
      `Обновление профиля для пользователя ${userId}, персонаж: ${selectedCharacterName}`
    );

    const db = getDb();
    const profileCollection = db.collection('profiles');

    // Ищем профиль для этого пользователя и персонажа
    const existingProfile = await profileCollection.findOne({
      userId,
      selectedCharacterName,
    });

    if (existingProfile) {
      // Профиль существует - обновляем его
      console.log(
        `Найден существующий профиль для ${selectedCharacterName}, обновляем...`
      );

      // Подготовка данных обновления
      const updateData = {
        ...req.body,
        updatedAt: new Date(),
      };

      // Обновление профиля
      const result = await profileCollection.updateOne(
        {
          userId,
          selectedCharacterName,
        },
        { $set: updateData }
      );

      res.json({
        message: 'Профиль успешно обновлен',
        modifiedCount: result.modifiedCount,
      });
    } else {
      // Профиль не найден - создаем новый
      console.log(
        `Профиль для ${selectedCharacterName} не найден, создаем новый...`
      );

      const newProfile = {
        ...req.body,
        userId,
        selectedCharacterName,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const insertResult = await profileCollection.insertOne(newProfile);

      res.status(201).json({
        message: 'Создан новый профиль',
        insertedId: insertResult.insertedId,
      });
    }
  } catch (error) {
    console.error('Ошибка обновления профиля:', error);
    res.status(500).json({ message: 'Ошибка обновления профиля', error });
  }
});
export default profileRouter;
