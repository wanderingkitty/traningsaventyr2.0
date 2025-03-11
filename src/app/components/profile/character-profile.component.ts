import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { CharacterService } from '../services/character.service';
import { Observable, Subscription } from 'rxjs';
import { User } from 'backend/models/user';
import { Character, CharacterProfile } from 'backend/models/character';

@Component({
  selector: 'app-character-profile',
  templateUrl: './character-profile.component.html',
  styleUrls: ['./character-profile.component.scss'],
  standalone: true,
  imports: [CommonModule],
})
export class CharacterProfileComponent implements OnInit, OnDestroy {
  character?: Character;
  characterProfile?: CharacterProfile;
  user$: Observable<User>;
  progressSubscription: Subscription = new Subscription();
  Math = Math;

  constructor(
    private router: Router,
    private authService: AuthService,
    private characterService: CharacterService,
    private cdr: ChangeDetectorRef
  ) {
    this.user$ = this.authService.currentUser$;

    // Get character from navigation state
    const navigation = this.router.getCurrentNavigation();
    this.character = navigation?.extras?.state?.['character'];

    console.log('Initial character from navigation state:', this.character);
  }

  ngOnInit() {
    window.scrollTo(0, 0);
    console.log('Character profile component initialized');

    // Загрузка персонажа из localStorage (если не был передан через навигацию)
    this.loadCharacterFromStorage();

    if (this.character) {
      // Подписываемся на обновления прогресса для конкретного персонажа
      this.progressSubscription = this.characterService
        .getCharacterProgress$(this.character)
        .subscribe((progress) => {
          console.log(
            'Progress update received for character',
            this.character?.name,
            ':',
            progress
          );

          if (this.character && this.characterProfile) {
            // Обновляем данные в characterProfile.progress
            this.characterProfile.progress = { ...progress };

            // Также обновляем данные в character и characterProfile.characterData для совместимости
            this.character.level = progress.level;
            this.character.xp = progress.experience;
            this.character.xpToNextLevel = progress.experienceToNextLevel;

            if (this.characterProfile.characterData) {
              this.characterProfile.characterData.level = progress.level;
              this.characterProfile.characterData.xp = progress.experience;
              this.characterProfile.characterData.xpToNextLevel =
                progress.experienceToNextLevel;
            }

            // ВАЖНО: Обновляем специальные способности при изменении уровня
            this.updateSpecialAbilities();

            console.log(
              'Updated character profile for',
              this.character.name,
              ':',
              this.characterProfile
            );

            // Запускаем обнаружение изменений
            this.cdr.detectChanges();
          }
        });
    }

    // Инициализируем свойства персонажа
    this.initializeCharacterProperties();

    // Загружаем свежие данные о прогрессе с сервера
    this.loadUserProgress();

    // Обновляем достижения
    this.updateAchievementProgress();

    // Нормализуем достижения для правильного отображения
    this.normalizeAchievements();
  }

  ngOnDestroy() {
    // Отписываемся при уничтожении компонента
    if (this.progressSubscription) {
      this.progressSubscription.unsubscribe();
    }
  }

  getCurrentExp(): number {
    return Math.floor(this.characterProfile?.progress?.experience || 0);
  }

  getExpToNextLevel(): number {
    return Math.floor(
      this.characterProfile?.progress?.experienceToNextLevel || 1000
    );
  }

  getRemainingExp(): number {
    const current = this.characterProfile?.progress?.experience || 0;
    const needed =
      this.characterProfile?.progress?.experienceToNextLevel || 1000;
    return Math.ceil(needed - current);
  }

  // Загрузка персонажа из localStorage
  loadCharacterFromStorage() {
    if (!this.character && typeof window !== 'undefined') {
      const savedCharacter = localStorage.getItem('selectedCharacter');
      if (savedCharacter) {
        try {
          this.character = JSON.parse(savedCharacter);
          console.log('Loaded character from localStorage:', this.character);

          // Инициализируем characterProfile после загрузки персонажа
          if (this.character) {
            const currentUser = this.authService.getCurrentUser();
            this.characterProfile = {
              userId: currentUser?.userId || '',
              selectedCharacterName: this.character.name,
              characterData: this.character,
              progress: {
                level: this.character.level || 1,
                experience: this.character.xp || 0,
                experienceToNextLevel: this.character.xpToNextLevel || 1000,
              },
            };

            // Устанавливаем текущего персонажа в сервисе
            this.characterService.selectCharacter(this.character);
          }
        } catch (error) {
          console.error('Error parsing character from localStorage:', error);
          this.router.navigate(['/character-creation']);
        }
      } else {
        console.warn('No character found in localStorage, redirecting...');
        this.router.navigate(['/character-creation']);
      }
    } else if (this.character) {
      // Если персонаж был получен из навигации, инициализируем characterProfile
      const currentUser = this.authService.getCurrentUser();
      this.characterProfile = {
        userId: currentUser?.userId || '',
        selectedCharacterName: this.character.name,
        characterData: this.character,
        progress: {
          level: this.character.level || 1,
          experience: this.character.xp || 0,
          experienceToNextLevel: this.character.xpToNextLevel || 1000,
        },
      };

      // Устанавливаем текущего персонажа в сервисе
      this.characterService.selectCharacter(this.character);
    }
  }

  // Загрузка прогресса с сервера
  loadUserProgress() {
    if (!this.character) {
      console.warn('No character to load progress for');
      return;
    }

    const currentUser = this.authService.getCurrentUser();
    if (!currentUser || !currentUser.name) {
      console.warn('No current user found, cannot load profile');
      return;
    }

    console.log('Requesting user profile for:', currentUser.name);

    this.characterService.getUserProfile(currentUser.name).subscribe({
      next: (profile) => {
        if (!profile || !profile.characterData) {
          console.warn('No profile data received from server');
          return;
        }
        if (this.character) {
          this.updateSpecialAbilities();
        }

        if (profile.characterData.name !== this.character?.name) {
          console.warn(
            'Profile data received from server does not match current character'
          );
          return;
        }

        console.log(
          'Received profile from server for character',
          this.character.name,
          ':',
          profile
        );

        // Сохраняем весь профиль
        this.characterProfile = profile;

        // Обновляем локальные данные персонажа
        const originalAchievements = this.character?.achievements || [];

        // Обновляем персонажа из профиля
        this.character = profile.characterData;

        // Убедимся, что уровень и опыт из прогресса синхронизированы с character
        if (profile.progress) {
          this.character.level = profile.progress.level;
          this.character.xp = profile.progress.experience;
          this.character.xpToNextLevel = profile.progress.experienceToNextLevel;
        }

        // Проверяем и обновляем достижения
        // Проверяем и обновляем достижения
        if (originalAchievements.length > 0 && this.character) {
          if (!this.character.achievements) {
            this.character.achievements = originalAchievements;
          } else {
            // Обновляем статусы достижений из оригинальных
            originalAchievements.forEach((original) => {
              if (original.completed && this.character) {
                // добавляем проверку this.character здесь
                const existingAchievement = this.character.achievements?.find(
                  (a) => a.name === original.name
                );
                if (existingAchievement) {
                  existingAchievement.completed = true;
                  existingAchievement.progress = 100;
                } else if (this.character.achievements) {
                  // добавляем проверку achievements
                  this.character.achievements.push(original);
                }
              }
            });
          }
        }

        // Сохраняем персонажа локально после обновления
        this.characterService.saveCharacter(this.character);

        // Обновляем Subject в сервисе для других компонентов
        if (profile.progress) {
          this.characterService.updateProgressSubject(
            this.character.name,
            profile.progress
          );
        }

        // Нормализуем достижения после получения данных с сервера
        this.normalizeAchievements();

        // Запускаем обнаружение изменений
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading user profile:', error);
      },
    });
  }

  updateSpecialAbilities() {
    if (this.character?.specialAbilities) {
      // Simply map the abilities based on current level
      this.character.specialAbilities = this.character.specialAbilities.map(
        (ability) => ({
          ...ability,
          // Use the level from characterProfile to ensure consistency
          unlocked:
            (this.characterProfile?.progress?.level ?? 1) >=
            (ability.requiredLevel ?? ability.unlockedAtLevel ?? Infinity),
        })
      );

      // Optional: Save the updated character
      this.characterService.saveCharacter(this.character);
    }
  }

  checkAndUpdateAbilities() {
    if (this.character) {
      // Ensure abilities are updated when level changes
      this.updateSpecialAbilities();

      // Log for debugging
      console.log(
        'Abilities after update:',
        this.character.specialAbilities.map(
          (a) => `${a.name}: ${a.unlocked ? 'Unlocked' : 'Locked'}`
        )
      );
    }
  }

  // Method to get next unlockable ability
  getNextAbilityDescription(): string | null {
    if (!this.character?.specialAbilities?.length) return null;

    const nextAbility = this.character.specialAbilities.find(
      (ability) =>
        !ability.unlocked &&
        (this.character?.level ?? 1) >=
          (ability.requiredLevel ?? ability.unlockedAtLevel ?? Infinity)
    );

    return nextAbility
      ? `Next ability '${nextAbility.name}' unlocks at level ${
          nextAbility.requiredLevel ?? nextAbility.unlockedAtLevel
        }`
      : null;
  }

  // Method to get unlocked abilities
  getUnlockedAbilities() {
    return (
      this.character?.specialAbilities?.filter((ability) => ability.unlocked) ??
      []
    );
  }

  // Метод для нормализации достижений
  normalizeAchievements() {
    if (!this.character || !this.character.achievements) {
      console.warn('No character or achievements to normalize');
      return;
    }

    console.log('Normalizing achievements for character:', this.character.name);
    console.log(
      'Achievements before normalization:',
      this.character.achievements
    );

    // Создаем новый массив для нормализованных достижений
    const normalizedAchievements = this.character.achievements.map(
      (achievement) => {
        // Создаем копию достижения
        const normalized = { ...achievement };

        // Убедимся, что completed имеет тип boolean
        if (typeof normalized.completed === 'string') {
          normalized.completed = normalized.completed === 'true';
        }

        // Если completed не установлено, устанавливаем его в false
        if (normalized.completed === undefined) {
          normalized.completed = false;
        }

        // Устанавливаем прогресс в зависимости от статуса completed
        if (normalized.completed === true) {
          normalized.progress = 100;
        } else if (
          normalized.progress === undefined ||
          normalized.progress === null
        ) {
          normalized.progress = 0;
        }

        return normalized;
      }
    );

    // Заменяем массив достижений на нормализованный
    this.character.achievements = normalizedAchievements;

    // Обновляем данные в characterProfile
    if (this.characterProfile?.characterData) {
      this.characterProfile.characterData.achievements = [
        ...normalizedAchievements,
      ];
    }

    // Сохраняем персонажа с нормализованными достижениями
    this.characterService.saveCharacter(this.character);

    console.log(
      'Achievements after normalization:',
      this.character.achievements
    );

    // Принудительно обновляем отображение
    this.cdr.detectChanges();
  }

  // Метод для инициализации свойств персонажа
  private initializeCharacterProperties() {
    if (!this.character) {
      console.warn('Cannot initialize properties: Character is undefined');
      return;
    }

    console.log('Initializing character properties for:', this.character.name);

    // Initialize arrays if not defined
    if (!this.character.achievements) {
      this.character.achievements = [];
    }

    if (!this.character.challenges) {
      this.character.challenges = [];
    }

    if (!this.character.specialAbilities) {
      this.character.specialAbilities = [];
    }

    // Initialize stats if not defined
    if (!this.character.stats) {
      this.character.stats = {
        totalWorkouts: 0,
        totalXpGained: 0,
      };
    } else {
      // Убедимся, что все необходимые свойства присутствуют
      if (this.character.stats.totalWorkouts === undefined) {
        this.character.stats.totalWorkouts = 0;
      }
      if (this.character.stats.totalXpGained === undefined) {
        this.character.stats.totalXpGained = 0;
      }
    }

    // Set default values for numeric properties if not defined
    if (this.character.xp === undefined) this.character.xp = 0;
    if (this.character.level === undefined) this.character.level = 1;
    if (this.character.xpToNextLevel === undefined)
      this.character.xpToNextLevel = 1000;
  }

  // Method to update achievement progress
  updateAchievementProgress() {
    if (!this.character || !this.character.achievements) {
      console.warn('No character or achievements to update');
      return;
    }

    console.log('Updating achievement progress...');

    this.character.achievements.forEach((achievement) => {
      // Convert string 'completed' to boolean if needed
      if (typeof achievement.completed === 'string') {
        achievement.completed = achievement.completed === 'true';
      }

      // Set progress to 100% for completed achievements
      if (achievement.completed === true) {
        achievement.progress = 100;
      }
    });

    // Update characterProfile
    if (this.characterProfile?.characterData) {
      this.characterProfile.characterData.achievements = [
        ...this.character.achievements,
      ];
    }

    // Save character
    this.characterService.saveCharacter(this.character);

    // Force UI update
    this.cdr.detectChanges();
  }

  // Apply server progress data to achievements
  applyProgressData(progressData: any) {
    if (!progressData || !this.character?.achievements) return;

    this.character.achievements.forEach((achievement: any) => {
      const achievementProgress = progressData[achievement.name];
      if (achievementProgress) {
        achievement.progress = achievementProgress.progress;
        achievement.current = achievementProgress.current;
        achievement.completed = achievementProgress.completed;
      }
    });

    // Сохраняем персонажа с обновленными достижениями
    this.characterService.saveCharacter(this.character);

    // Запускаем обнаружение изменений
    this.cdr.detectChanges();
  }

  goBack() {
    // Сохраняем текущего персонажа перед переходом
    if (this.character) {
      console.log('Saving character before switching:', this.character.name);

      // Нормализуем достижения перед сохранением
      this.normalizeAchievements();

      // Сохраняем в localStorage
      localStorage.setItem('selectedCharacter', JSON.stringify(this.character));

      // Получаем имя пользователя вместо ID (userID = username в вашем случае)
      const currentUser = this.authService.getCurrentUser();
      const username = currentUser?.name || '';

      console.log('goBack: Current user:', username);
      console.log('goBack: Character data:', this.character);

      // Сохраняем на сервере (используя имя персонажа вместо ID)
      this.characterService
        .updateProfile(this.character.name, this.character)
        .subscribe({
          next: (response) => {
            console.log(
              'Character successfully saved before navigation:',
              response
            );
            this.router.navigate(['/character-creation']);
          },
          error: (error) => {
            console.error('Error saving character before navigation:', error);
            this.router.navigate(['/character-creation']);
          },
        });
    } else {
      this.router.navigate(['/character-creation']);
    }
  }

  onLogout() {
    this.authService.logout();
  }

  startWorkout() {
    // Сохраняем выбранного персонажа перед переходом
    if (this.character) {
      // Сохраняем в localStorage для использования на странице тренировки
      localStorage.setItem('selectedCharacter', JSON.stringify(this.character));
    }
    this.router.navigate(['/workout-page']);
  }

  // Method to get next level reward
  getNextLevelReward(currentLevel: number): string {
    const rewards = [
      'New ability: Strength Boost',
      'Increased stamina',
      'New ability: Endurance Master',
      'Improved recovery',
      'New ability: Mental Focus',
    ];

    return rewards[currentLevel % rewards.length];
  }

  // Метод для ручного обновления данных с сервера
  refreshData() {
    console.log('Refreshing character data from server...');

    // Получаем данные с сервера
    this.loadUserProgress();

    // Нормализуем достижения
    this.normalizeAchievements();

    // Обновляем отображение достижений
    this.updateAchievementProgress();

    // Показываем уведомление пользователю
    alert('Data refreshed!');
  }
}
