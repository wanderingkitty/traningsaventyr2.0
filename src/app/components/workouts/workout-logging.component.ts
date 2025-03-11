import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { CharacterService } from '../services/character.service';
import { Achievement, Character, Workout } from 'backend/models/character';
import {
  ascenderWorkouts,
  runnerWorkouts,
  zenWarriorWorkouts,
} from './workout-data';

@Component({
  selector: 'workout-page',
  templateUrl: './workout-logging.component.html',
  styleUrls: ['./workout-logging.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule],
})
export class WorkoutComponent implements OnInit {
  isRunning: boolean = false;
  private timer: any;
  currentTime: number = 0;
  character?: Character;

  completedExercises: { [key: string]: boolean } = {};
  completedAchievements: { [key: string]: boolean } = {};
  completedChallenges: { [key: string]: boolean } = {};

  totalXpGained: number = 0;
  routesCompleted: number = 0;

  notification: { show: boolean; message: string } = {
    show: false,
    message: '',
  };

  workouts: Workout[] = [];
  runnerWorkouts = runnerWorkouts;
  ascenderWorkouts = ascenderWorkouts;
  zenWarriorWorkouts = zenWarriorWorkouts;

  constructor(
    private router: Router,
    private characterService: CharacterService
  ) {}

  // Обновленный метод ngOnInit с проверкой соответствия достижений классу
  ngOnInit() {
    // Загружаем выбранного персонажа из localStorage
    const savedCharacter = localStorage.getItem('selectedCharacter');
    if (savedCharacter) {
      this.character = JSON.parse(savedCharacter);
      console.log('Loaded character in workout component:', this.character);

      // Инициализируем достижения, если их нет
      if (this.character && !this.character.achievements) {
        this.character.achievements = [];
        console.warn(
          'No achievements found for character, initializing empty array'
        );
      }

      // Инициализируем статистику, если её нет
      if (this.character && !this.character.stats) {
        this.character.stats = {
          totalWorkouts: 0,
          totalXpGained: 0,
        };
        console.warn(
          'No stats found for character, initializing default values'
        );
      }

      // Выбираем правильный набор тренировок в зависимости от класса персонажа
      this.loadWorkoutsForCharacterClass();
    } else {
      console.warn('No character found, redirecting...');
      this.router.navigate(['/character-creation']);
      return;
    }

    if (this.workouts.length > 0) {
      // Инициализируем completedExercises
      this.workouts[0].exercises.forEach((exercise) => {
        this.completedExercises[exercise.name] = false;
      });

      // ВАЖНОЕ ИЗМЕНЕНИЕ: Перед инициализацией completedAchievements
      // фильтруем достижения персонажа, чтобы убедиться, что все они
      // принадлежат текущему классу
      this.filterAchievementsByCurrentClass();

      // Инициализируем completedAchievements и синхронизируем с персонажем
      this.workouts[0].achievements.forEach((achievement) => {
        // По умолчанию устанавливаем, что достижение не выполнено
        this.completedAchievements[achievement.name] = false;

        // Проверяем, есть ли такое достижение у персонажа и выполнено ли оно
        if (this.character && this.character.achievements) {
          const characterAchievement = this.character.achievements.find(
            (a: any) => a.name === achievement.name
          );

          if (characterAchievement) {
            // Если достижение уже есть у персонажа, используем его статус
            this.completedAchievements[achievement.name] =
              characterAchievement.completed || false;

            // Если достижение уже выполнено, отмечаем это
            if (characterAchievement.completed) {
              console.log(`Achievement ${achievement.name} already completed`);
            }
          } else {
            // Если достижения нет у персонажа, добавляем его
            if (this.character.achievements) {
              this.character.achievements.push({
                ...achievement,
                progress: 0,
                completed: false,
              });
            }
          }
        }
      });

      // Initialize completedChallenges
      if (this.workouts[0].challenges) {
        this.workouts[0].challenges.forEach((challenge) => {
          this.completedChallenges[challenge.name] = false;
        });
      }

      // Сохраняем персонажа после инициализации достижений
      if (this.character) {
        console.log(
          'Saving character after achievement initialization:',
          this.character
        );
        this.characterService.saveCharacter(this.character);
        localStorage.setItem(
          'selectedCharacter',
          JSON.stringify(this.character)
        );
      }

      console.log(
        'Initialized achievements state:',
        this.completedAchievements
      );
    } else {
      console.warn('No workouts loaded');
    }

    // Вызываем отладку для проверки состояния достижений
    setTimeout(() => {
      this.debugAchievements();
    }, 1000);
  }

  completeChallenge(challenge: any, event: MouseEvent) {
    if (event) {
      event.preventDefault();
    }

    if (!this.isRunning) {
      this.showNotification('Start the timer first!');
      return;
    }

    if (!this.completedChallenges[challenge.name]) {
      this.completedChallenges[challenge.name] = true;

      const xpAmount = challenge.xpReward || 100;
      this.totalXpGained += xpAmount;
      this.workouts[0].progress.totalXpGained += xpAmount;

      // Update character challenges
      if (this.character && this.character.challenges) {
        const challengeIndex = this.character.challenges.findIndex(
          (c) => c.description === challenge.description
        );

        if (challengeIndex !== -1) {
          this.character.challenges[challengeIndex].progress = 100;
        } else {
          this.character.challenges.push({
            description: challenge.description,
            progress: 100,
            xpReward: challenge.xpReward,
            name: '',
          });
        }

        localStorage.setItem(
          'selectedCharacter',
          JSON.stringify(this.character)
        );
        this.characterService.saveCharacter(this.character);
      }

      this.showNotification(
        `Challenge completed: ${challenge.name}! +${xpAmount} XP`
      );
    }
  }

  // Обновленный метод loadWorkoutsForCharacterClass с фильтрацией достижений
  loadWorkoutsForCharacterClass() {
    if (!this.character) return;

    console.log('Загрузка тренировок для персонажа:', this.character.name);

    switch (this.character.name) {
      case 'Runner':
        this.workouts = [this.runnerWorkouts];
        console.log('Загружены тренировки для Runner');
        console.log(
          'Количество достижений Runner:',
          this.runnerWorkouts.achievements.length
        );
        console.log(
          'Имена достижений Runner:',
          this.runnerWorkouts.achievements.map((a) => a.name).join(', ')
        );
        break;
      case 'Ascender':
        this.workouts = [this.ascenderWorkouts];
        console.log('Загружены тренировки для Ascender');
        console.log(
          'Количество достижений Ascender:',
          this.ascenderWorkouts.achievements.length
        );
        console.log(
          'Имена достижений Ascender:',
          this.ascenderWorkouts.achievements.map((a) => a.name).join(', ')
        );
        break;
      case 'Zen Warrior':
        this.workouts = [this.zenWarriorWorkouts];
        console.log('Загружены тренировки для Zen Warrior');
        console.log(
          'Количество достижений Zen Warrior:',
          this.zenWarriorWorkouts.achievements.length
        );
        console.log(
          'Имена достижений Zen Warrior:',
          this.zenWarriorWorkouts.achievements.map((a) => a.name).join(', ')
        );
        break;
      default:
        this.workouts = [this.runnerWorkouts];
        console.warn(
          'Неизвестный класс персонажа, используем тренировки Runner по умолчанию'
        );
    }

    // ВАЖНО: После загрузки тренировок фильтруем достижения персонажа,
    // оставляя только те, которые относятся к текущему классу
    this.filterAchievementsByCurrentClass();

    // Вызываем отладку для проверки состояния достижений
    setTimeout(() => this.debugAchievements(), 500);
  }

  startTimer() {
    if (!this.isRunning) {
      this.isRunning = true;
      this.timer = setInterval(() => {
        this.currentTime++;
      }, 1000);
    }
  }

  pauseTimer() {
    this.isRunning = false;
    clearInterval(this.timer);
  }

  stopTimer() {
    this.isRunning = false;
    clearInterval(this.timer);
    this.currentTime = 0;
  }

  formatTime(seconds: number): string {
    return new Date(seconds * 1000).toISOString().slice(11, 19);
  }

  completeExercise(exercise: any, event: MouseEvent) {
    if (event) {
      event.preventDefault();
    }

    if (!this.isRunning) {
      this.showNotification('Start the timer first!');
      return;
    }

    if (!this.completedExercises[exercise.name]) {
      this.completedExercises[exercise.name] = true;

      const xpAmount =
        exercise.xpValue ||
        parseInt(exercise.xpReward?.replace('XP + ', '')) ||
        0;
      this.totalXpGained += xpAmount;
      this.workouts[0].progress.totalXpGained += xpAmount;

      this.showNotification(`Completed: ${exercise.name}! +${xpAmount} XP`);
    }
  }

  // Исправленный метод completeAchievement с общим интерфейсом Achievement
  completeAchievement(achievement: Achievement, event: MouseEvent) {
    if (event) {
      event.preventDefault();
    }

    if (!this.isRunning) {
      this.showNotification('Start the timer first!');
      return;
    }

    if (this.completedAchievements[achievement.name]) {
      this.showNotification(
        `Achievement ${achievement.name} already completed!`
      );
      return;
    }

    // Отмечаем достижение как выполненное в локальном объекте
    this.completedAchievements[achievement.name] = true;

    // Добавляем опыт
    const xpAmount = achievement.xpReward || 50;
    this.totalXpGained += xpAmount;
    this.workouts[0].progress.totalXpGained += xpAmount;
    this.routesCompleted++;
    this.workouts[0].progress.routesCompleted++;

    // Проверяем существует ли персонаж и массив достижений
    if (!this.character) {
      console.error('Character is undefined, cannot update achievements');
      this.showNotification(
        `Achievement: ${achievement.name}! +${xpAmount} XP`
      );
      return;
    }

    // Инициализируем массив достижений, если он не существует
    if (!this.character.achievements) {
      this.character.achievements = [];
    }

    // Обновляем достижение в объекте персонажа
    const characterAchievementIndex = this.character.achievements.findIndex(
      (a) => a.name === achievement.name
    );

    if (characterAchievementIndex !== -1) {
      console.log('Updating achievement in character:', achievement.name);
      // Обновляем состояние достижения
      this.character.achievements[characterAchievementIndex].progress = 100;
      this.character.achievements[characterAchievementIndex].completed = true;

      // Если есть currentValue в оригинальном достижении, обновляем и его
      if (achievement.currentValue !== undefined) {
        this.character.achievements[characterAchievementIndex].currentValue =
          achievement.currentValue;
        // Также обновляем current для совместимости со старым кодом
        this.character.achievements[characterAchievementIndex].current =
          achievement.currentValue;
      }
    } else {
      console.log(
        'Achievement not found in character object:',
        achievement.name
      );

      // Создаем копию достижения для персонажа
      const newAchievement: Achievement = {
        ...achievement,
        progress: 100,
        completed: true,
      };

      // Добавляем достижение в список
      this.character.achievements.push(newAchievement);
    }

    // Выводим для отладки
    console.log('Updated achievements:', this.character.achievements);

    // Обновляем в localStorage
    localStorage.setItem('selectedCharacter', JSON.stringify(this.character));

    // Также обновляем в сервисе
    this.characterService.saveCharacter(this.character);

    // Показываем уведомление
    this.showNotification(`Achievement: ${achievement.name}! +${xpAmount} XP`);
  }

  showNotification(message: string) {
    this.notification = { show: true, message };

    // Скрываем уведомление через 3 секунды
    setTimeout(() => {
      this.notification = { show: false, message: '' };
    }, 3000);
  }

  // Исправленный метод completeWorkout с общим интерфейсом Achievement
  completeWorkout() {
    if (this.workouts.length === 0) {
      this.showNotification('No workout loaded!');
      return;
    }

    const hasCompletedExercises = Object.values(this.completedExercises).some(
      (completed) => completed
    );
    const hasCompletedAchievements = Object.values(
      this.completedAchievements
    ).some((completed) => completed);

    if (!hasCompletedExercises && !hasCompletedAchievements) {
      this.showNotification(
        'Complete at least one exercise, challenge or achievement!'
      );
      return;
    }

    const allExercisesCompleted = Object.values(this.completedExercises).every(
      (completed) => completed
    );
    if (allExercisesCompleted) {
      const bonusXP = Math.round(this.totalXpGained * 0.25);
      this.totalXpGained += bonusXP;
      this.workouts[0].progress.totalXpGained += bonusXP;
      this.showNotification(
        `Bonus for completing all exercises: +${bonusXP} XP!`
      );
    }

    try {
      if (!this.character) {
        this.showNotification('No character loaded!');
        return;
      }

      // Добавляем опыт конкретному персонажу
      const levelInfo = this.characterService.addExperience(this.totalXpGained);

      // Обновляем данные персонажа
      // Обновляем статистику тренировок - ВАЖНО: правильно инициализируем stats
      if (!this.character.stats) {
        this.character.stats = {
          totalWorkouts: 0,
          totalXpGained: 0,
        };
      }

      // Инкрементируем счетчик тренировок и опыта
      const currentWorkouts = this.character.stats.totalWorkouts || 0;
      const currentXpGained = this.character.stats.totalXpGained || 0;

      this.character.stats.totalWorkouts = currentWorkouts + 1;
      this.character.stats.totalXpGained = currentXpGained + this.totalXpGained;

      console.log('Updated character stats:', this.character.stats);

      // Получаем текущий прогресс
      const currentProgress = this.characterService.getCurrentProgress();

      // Обновляем уровень и опыт персонажа
      this.character.level = currentProgress.level;
      this.character.xp = currentProgress.experience;
      this.character.xpToNextLevel = currentProgress.experienceToNextLevel;

      // Инициализируем массив достижений, если он не существует
      if (!this.character.achievements) {
        this.character.achievements = [];
      }

      // Создаем глубокую копию массива достижений для избежания проблем с ссылками
      const achievementsCopy = JSON.parse(
        JSON.stringify(this.character.achievements)
      );

      // Проверяем достижения и обновляем их статус
      Object.keys(this.completedAchievements).forEach((achievementName) => {
        if (this.completedAchievements[achievementName]) {
          const achievementIndex = achievementsCopy.findIndex(
            (a: { name: string }) => a.name === achievementName
          );

          if (achievementIndex !== -1) {
            console.log(`Marking achievement as completed: ${achievementName}`);
            achievementsCopy[achievementIndex].completed = true;
            achievementsCopy[achievementIndex].progress = 100;
          } else {
            // Если достижение не найдено в массиве, добавляем его
            // Найдем оригинальное достижение в данных тренировки
            const workoutAchievement = this.workouts[0].achievements.find(
              (a) => a.name === achievementName
            );

            if (workoutAchievement) {
              // Копируем достижение и отмечаем как выполненное
              achievementsCopy.push({
                ...workoutAchievement,
                progress: 100,
                completed: true,
              });
            }
          }
        }
      });

      // Присваиваем обновленный массив обратно
      this.character.achievements = achievementsCopy;

      console.log(
        'Saving updated character with achievements and stats:',
        this.character
      );
      console.log('Achievement count:', this.character.achievements.length);
      console.log(
        'Achievement names:',
        this.character.achievements.map((a) => a.name).join(', ')
      );

      // Сохраняем персонажа локально
      this.characterService.saveCharacter(this.character);

      // Важно: используем localStorage для быстрого доступа в других компонентах
      localStorage.setItem('selectedCharacter', JSON.stringify(this.character));

      // Обновляем профиль персонажа в базе данных
      this.characterService
        .updateProfile(this.character.name, this.character)
        .subscribe({
          next: (response) => {
            console.log('Profile updated successfully:', response);
            this.showNotification('Progress saved!');

            // Показываем уведомление о повышении уровня
            if (levelInfo && levelInfo.leveledUp) {
              this.showNotification(
                `Level Up! You are now level ${levelInfo.newLevel}!`
              );
            }

            // Переходим на профиль персонажа
            setTimeout(() => {
              this.router.navigate(['/character-profile']);
            }, 1500);
          },
          error: (error) => {
            console.error('Error updating profile:', error);
            this.showNotification('Error saving progress!');

            // Даже в случае ошибки переходим на профиль персонажа
            setTimeout(() => {
              this.router.navigate(['/character-profile']);
            }, 1500);
          },
        });
    } catch (error) {
      console.error('Error saving workout progress:', error);
      this.showNotification('Error saving progress!');

      this.stopTimer();

      setTimeout(() => {
        this.router.navigate(['/character-profile']);
      }, 1500);
    }
  }

  /**
   * Проверяет, принадлежит ли достижение текущему классу персонажа
   */
  isAchievementForCurrentClass(achievementName: string): boolean {
    if (!this.character) return false;

    // Получаем достижения текущей тренировки
    const currentClassAchievements = this.workouts[0]?.achievements || [];

    // Проверяем, есть ли достижение с таким именем в текущем классе
    return currentClassAchievements.some((a) => a.name === achievementName);
  }

  /**
   * Фильтрует достижения персонажа, оставляя только те,
   * которые принадлежат текущему классу
   */
  filterAchievementsByCurrentClass() {
    if (
      !this.character ||
      !this.character.achievements ||
      !this.workouts ||
      this.workouts.length === 0
    ) {
      return;
    }

    console.log(
      'Фильтрация достижений по текущему классу персонажа:',
      this.character.name
    );

    // Получаем имена всех достижений текущего класса
    const currentClassAchievementNames = this.workouts[0].achievements.map(
      (a) => a.name
    );

    console.log('Достижения текущего класса:', currentClassAchievementNames);

    // Фильтруем достижения персонажа, оставляя только те, которые принадлежат текущему классу
    const filteredAchievements = this.character.achievements.filter(
      (achievement) => currentClassAchievementNames.includes(achievement.name)
    );

    const removedCount =
      this.character.achievements.length - filteredAchievements.length;

    if (removedCount > 0) {
      console.log(
        `Удалено ${removedCount} достижений, не принадлежащих классу ${this.character.name}`
      );
      console.log(
        'Удаленные достижения:',
        this.character.achievements
          .filter((a) => !currentClassAchievementNames.includes(a.name))
          .map((a) => a.name)
      );

      // Обновляем список достижений персонажа
      this.character.achievements = filteredAchievements;

      // Сохраняем обновленные данные
      localStorage.setItem('selectedCharacter', JSON.stringify(this.character));
      this.characterService.saveCharacter(this.character);

      console.log(
        'Количество достижений после фильтрации:',
        this.character.achievements.length
      );
    } else {
      console.log('Все достижения персонажа соответствуют текущему классу');
    }
  }

  debugAchievements() {
    if (!this.character || !this.workouts || this.workouts.length === 0) {
      console.error('Данные для отладки не готовы');
      return;
    }

    console.log(
      `[Отладка] Персонаж: ${this.character.name}, достижений: ${
        this.character.achievements?.length || 0
      }`
    );

    // Проверяем соответствие достижений текущему классу
    if (this.character.achievements && this.character.achievements.length > 0) {
      const currentClassAchievementNames = this.workouts[0].achievements.map(
        (a) => a.name
      );
      const invalidAchievements = this.character.achievements.filter(
        (a) => !currentClassAchievementNames.includes(a.name)
      );

      if (invalidAchievements.length > 0) {
        console.warn(
          'Найдены достижения, не принадлежащие текущему классу:',
          invalidAchievements.map((a) => a.name).join(', ')
        );
      }
    }

    // Проверяем статус выполнения
    const completedAchievementsCount =
      this.character.achievements?.filter((a) => a.completed).length || 0;
    console.log(
      `[Отладка] Выполнено достижений: ${completedAchievementsCount}`
    );
  }
}
