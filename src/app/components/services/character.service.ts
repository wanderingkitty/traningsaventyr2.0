import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';
import { Character, CharacterProfile } from 'backend/models/character';

import { BehaviorSubject, Observable, catchError, of, tap } from 'rxjs';

interface CharacterProgress {
  level: number;
  experience: number;
  experienceToNextLevel: number;
}

@Injectable({
  providedIn: 'root',
})
export class CharacterService {
  private apiUrl = 'http://localhost:1408/api/profiles';
  private baseXpRequirement = 1000;

  private characterSaveStatusSubject = new BehaviorSubject<{
    status: 'success' | 'error' | 'idle';
    message: string;
  }>({
    status: 'idle',
    message: '',
  });
  characterSaveStatus$ = this.characterSaveStatusSubject.asObservable();

  private characterProgressSubject = new BehaviorSubject<CharacterProgress>({
    level: 1,
    experience: 0,
    experienceToNextLevel: this.baseXpRequirement,
  });

  characterProgress$ = this.characterProgressSubject.asObservable();

  constructor(private http: HttpClient, private authService: AuthService) {
    this.loadCharacterProgress();
  }

  // Метод для выбора текущего персонажа
  selectCharacter(character: Character) {
    console.log('Selecting character:', character.name);

    // Сохраняем выбранного персонажа в localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('selectedCharacter', JSON.stringify(character));
    }
  }

  // Метод для сохранения персонажа
  saveCharacter(character: Character): void {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) return;

    const userId = currentUser.userId || currentUser.name;
    if (!userId) return;

    // Сохраняем персонажа в localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem(
        `character_${userId}_${character.name}`,
        JSON.stringify(character)
      );

      // Также сохраняем как выбранного персонажа
      localStorage.setItem('selectedCharacter', JSON.stringify(character));
    }

    // Также вызываем updateProfile для сохранения на сервере
    // Но не подписываемся на результат, чтобы избежать циклов
    // Это опционально, поскольку здесь мы не нуждаемся в обратной связи
    this.http
      .put(`${this.apiUrl}/${userId}`, {
        userId: userId,
        username: currentUser.name,
        selectedCharacterName: character.name,
        characterData: character,
        progress: this.characterProgressSubject.value,
      })
      .subscribe({
        next: () => console.log(`Character ${character.name} saved to server`),
        error: (err) => console.error('Error saving character to server:', err),
      });
  }

  updateProfileWithAllData(
    userId: string,
    character: Character,
    progress: any
  ): Observable<any> {
    const requestBody = {
      progress: progress,
      characterData: character,
    };

    console.log(`Sending complete update for user ${userId}:`, requestBody);
    return this.http.put(`${this.apiUrl}/progress/${userId}`, requestBody);
  }

  // Сначала добавьте этот метод в CharacterService:

  getUserProfiles(username: string): Observable<CharacterProfile[]> {
    if (!username) {
      console.error('Username is required to get profiles');
      return of([]);
    }

    return this.http
      .get<CharacterProfile[]>(`${this.apiUrl}/user/${username}`)
      .pipe(
        tap((profiles) => {
          console.log('Received user profiles:', profiles);
        }),
        catchError((error: any) => {
          console.error('Error fetching user profiles:', error);
          return of([]);
        })
      );
  }

  // Метод для получения Observable прогресса для конкретного персонажа
  getCharacterProgress$(
    character: Character | string
  ): Observable<CharacterProgress> {
    // Используем существующий BehaviorSubject
    return this.characterProgress$;
  }

  // Метод для обновления Subject прогресса
  updateProgressSubject(
    characterName: string,
    progress: CharacterProgress
  ): void {
    console.log(
      'Manually updating progress subject for',
      characterName,
      ':',
      progress
    );
    this.characterProgressSubject.next(progress);

    // Сохраняем в localStorage
    const currentUser = this.authService.getCurrentUser();
    if (currentUser && typeof window !== 'undefined') {
      localStorage.setItem(
        `character_progress_${currentUser.userId || currentUser.name}`,
        JSON.stringify(progress)
      );
    }
  }

  // Новый метод для получения профиля пользователя по имени
  getUserProfile(username: string): Observable<CharacterProfile | null> {
    if (!username) {
      console.error('Username is required to get profile');
      return of(null);
    }

    return this.http.get<CharacterProfile>(`${this.apiUrl}/${username}`).pipe(
      tap((profile) => {
        console.log('Recieved profile', profile);

        if (profile && profile.progress) {
          this.characterProgressSubject.next(profile.progress);

          if (typeof window !== 'undefined' && profile.userId) {
            localStorage.setItem(
              `character_progress_${profile.userId}`,
              JSON.stringify(profile.progress)
            );
          }
        }
      }),
      catchError((error: any) => {
        console.error('Error fetching profile:', error);
        return of(null);
      })
    );
  }

  createProfile(character: Character) {
    console.log('Creating profile with character data:', character);
    const currentUser = this.authService.getCurrentUser();

    if (!currentUser) {
      console.error('No logged in user found');
      return of({ error: 'No user logged in' });
    }

    if (!character.avatar) {
      character.avatar = this.getDefaultAvatarForClass(character.name);
    }

    // EXPLICITLY set to level 1 and reset experience
    const initialProgress = {
      level: 1,
      experience: 0,
      experienceToNextLevel: this.baseXpRequirement,
    };

    // Sync character data with initial progress
    character.level = 1;
    character.xp = 0;
    character.xpToNextLevel = this.baseXpRequirement;

    // Update the progress subject to ensure it starts at level 1
    this.characterProgressSubject.next(initialProgress);

    const profileData = {
      userId: currentUser.userId || currentUser.name,
      username: currentUser.name,
      selectedCharacterName: character.name,
      characterData: character,
      progress: initialProgress,
    };

    console.log('Creating profile with data:', profileData);
    return this.http.post(this.apiUrl, profileData);
  }

  // Исправленный метод updateProfile для CharacterService
  updateProfile(characterName: string, character: Character): Observable<any> {
    console.log(
      `[CharacterService] Обновление профиля для персонажа: ${characterName}`
    );

    if (!character) {
      console.error('[CharacterService] Персонаж не определен в updateProfile');
      return of({ error: 'No character data provided' });
    }

    if (!character.avatar) {
      character.avatar = this.getDefaultAvatarForClass(character.name);
    }

    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      return of({ error: 'No user logged in' });
    }
    const userId = currentUser.userId || currentUser.name;

    // Проверка состояния достижений перед отправкой
    if (character.achievements) {
      console.log(
        `[CharacterService] updateProfile: Количество достижений: ${character.achievements.length}`
      );

      // Проверяем завершенные достижения
      const completedAchievements = character.achievements.filter(
        (a) => a.completed
      );
      console.log(
        `[CharacterService] updateProfile: Завершенные достижения: ${completedAchievements.length}`
      );
      if (completedAchievements.length > 0) {
        console.log(
          `[CharacterService] updateProfile: Имена завершенных достижений: ${completedAchievements
            .map((a) => a.name)
            .join(', ')}`
        );
      }

      // Исправляем достижения с нулевым прогрессом, но отмеченные как выполненные
      character.achievements.forEach((achievement) => {
        if (achievement.completed && achievement.progress === 0) {
          console.log(
            `[CharacterService] Исправляем прогресс для выполненного достижения: ${achievement.name}`
          );
          achievement.progress = 100;
        }
      });
    }

    // Синхронизируем данные о прогрессе с персонажем
    const currentProgress = this.characterProgressSubject.value;
    character.level = currentProgress.level;
    character.xp = currentProgress.experience;
    character.xpToNextLevel = currentProgress.experienceToNextLevel;

    // Создаем глубокую копию для защиты от случайных изменений
    const characterCopy = JSON.parse(JSON.stringify(character));

    // Важно: убедимся, что characterData включен
    const profileData = {
      userId: userId,
      username: currentUser.name,
      selectedCharacterName: character.name,
      characterData: characterCopy,
      progress: currentProgress,
    };

    console.log('[CharacterService] Отправка профиля на сервер:', {
      userId: profileData.userId,
      characterName: profileData.selectedCharacterName,
      hasAchievements:
        characterCopy.achievements && characterCopy.achievements.length > 0,
    });

    return this.http.put(`${this.apiUrl}/${userId}`, profileData).pipe(
      tap((response) => {
        console.log(
          '[CharacterService] Ответ сервера на обновление профиля:',
          response
        );
        // Обновляем локальные данные после успешного обновления на сервере
        this.saveCharacter(character);
      }),
      catchError((error) => {
        console.error('[CharacterService] Ошибка обновления профиля:', error);
        return of({ error: 'Failed to update profile' });
      })
    );
  }

  // Добавьте в CharacterService
  getExistingCharacter(characterName: string): Character | null {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) return null;

    const userId = currentUser.userId || currentUser.name;
    if (!userId) return null;

    // Пытаемся найти персонажа в localStorage
    if (typeof window !== 'undefined') {
      const savedCharacter = localStorage.getItem(
        `character_${userId}_${characterName}`
      );
      if (savedCharacter) {
        try {
          const character = JSON.parse(savedCharacter);
          console.log(
            `Loaded existing character ${characterName} from localStorage`
          );

          // Синхронизируем с текущим прогрессом
          const currentProgress = this.characterProgressSubject.value;
          character.level = currentProgress.level;
          character.xp = currentProgress.experience;
          character.xpToNextLevel = currentProgress.experienceToNextLevel;

          return character;
        } catch (error) {
          console.error('Error parsing saved character:', error);
        }
      }
    }

    return null;
  }

  private loadCharacterProgress() {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) return;

    if (typeof window !== 'undefined') {
      const savedProgress = localStorage.getItem(
        `character_progress_${currentUser.userId || currentUser.name}`
      );
      if (savedProgress) {
        try {
          const parsedProgress = JSON.parse(savedProgress);
          // Ensure level is at least 1
          parsedProgress.level = Math.max(1, parsedProgress.level || 1);
          parsedProgress.experience = Math.max(
            0,
            parsedProgress.experience || 0
          );

          this.characterProgressSubject.next(parsedProgress);
        } catch (error) {
          console.error('Error parsing saved progress:', error);
          // Reset to default if parsing fails
          this.characterProgressSubject.next({
            level: 1,
            experience: 0,
            experienceToNextLevel: this.baseXpRequirement,
          });
        }
      }
    }
  }

  private saveCharacterProgress(progress: CharacterProgress) {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) return;

    if (typeof window !== 'undefined') {
      localStorage.setItem(
        `character_progress_${currentUser.userId || currentUser.name}`,
        JSON.stringify(progress)
      );
    }

    this.characterProgressSubject.next(progress);

    this.updateUserProgress(currentUser.userId || currentUser.name, progress);
  }

  private updateUserProgress(userId: string, progress: CharacterProgress) {
    if (!userId) return;

    // Получаем текущего персонажа из localStorage
    let currentCharacter = null;
    if (typeof window !== 'undefined') {
      const selectedCharacter = localStorage.getItem('selectedCharacter');
      if (selectedCharacter) {
        try {
          currentCharacter = JSON.parse(selectedCharacter);
        } catch (error) {
          console.error('Error parsing selected character:', error);
        }
      }
    }

    // Отправляем как прогресс, так и данные о персонаже
    this.http
      .put(`${this.apiUrl}/progress/${userId}`, {
        progress,
        characterData: currentCharacter, // Добавляем данные персонажа
      })
      .pipe(
        catchError((error) => {
          console.error('Error updating progress on server:', error);
          return of(null);
        })
      )
      .subscribe();
  }

  private calculateXpForNextLevel(level: number): number {
    // Формула: база XP * 1.5^(уровень-1)
    return Math.round(this.baseXpRequirement * Math.pow(1.5, level - 1));
  }

  addExperience(amount: number) {
    const currentProgress = this.characterProgressSubject.value;
    let { level, experience } = currentProgress;

    // Добавляем XP
    experience += amount;

    // Проверяем на повышение уровня
    let experienceToNextLevel = this.calculateXpForNextLevel(level);
    let leveledUp = false;

    // Обрабатываем множественные повышения уровня, если получено много XP
    while (experience >= experienceToNextLevel) {
      level++;
      experience -= experienceToNextLevel;
      experienceToNextLevel = this.calculateXpForNextLevel(level);
      leveledUp = true;
    }

    // Сохраняем обновленный прогресс
    const newProgress = { level, experience, experienceToNextLevel };
    this.saveCharacterProgress(newProgress);

    return { leveledUp, newLevel: level };
  }

  // Получаем текущий уровень персонажа
  getCurrentLevel(): number {
    return this.characterProgressSubject.value.level;
  }

  // Получаем текущий прогресс персонажа
  getCurrentProgress(): CharacterProgress {
    return this.characterProgressSubject.value;
  }

  // Получаем информацию о текущем опыте и опыте, необходимом для следующего уровня
  getExperienceInfo(): { current: number; needed: number; percentage: number } {
    const { experience, experienceToNextLevel } =
      this.characterProgressSubject.value;
    const percentage = Math.round((experience / experienceToNextLevel) * 100);
    return { current: experience, needed: experienceToNextLevel, percentage };
  }

  // Вспомогательный метод для получения аватара по умолчанию
  private getDefaultAvatarForClass(className: string): string {
    switch (className.toLowerCase()) {
      case 'ascender':
        return '/assets/ascender-img.jpg';
      case 'runner':
        return '/assets/running-avatar.jpg';
      case 'zen warrior':
        return '/assets/yoga-avatar.jpg';
      default:
        return '/assets/default-avatar.png';
    }
  }
}
