import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Character, CharacterProfile } from '../models/character.model';
import { CharacterService } from '../services/character.service';
import { AuthService } from '../services/auth.service';
import { characters } from './character-data';

@Component({
  selector: 'app-character-creation',
  templateUrl: './character-creation.component.html',
  styleUrls: ['./character-creation.component.scss'],
  standalone: true,
  imports: [CommonModule],
})
export class CharacterCreationComponent implements OnInit {
  constructor(
    private router: Router,
    private characterService: CharacterService,
    private authService: AuthService
  ) {}
  currentYear: number = new Date().getFullYear();
  characters: Character[] = characters;

  selectedCharacter: Character = this.characters[0];
  loading = true;
  existingProfile: CharacterProfile | null = null;

  ngOnInit() {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      console.log('User not logged in, redirecting to login');
      this.router.navigate(['/login']);
      return;
    }

    // Проверяем localStorage на наличие сохраненного персонажа для текущего пользователя
    if (typeof window !== 'undefined') {
      const savedCharacter = localStorage.getItem(
        `character_${currentUser.name}`
      );

      if (savedCharacter) {
        this.selectedCharacter = JSON.parse(savedCharacter);

        // Проверяем, нужно ли автоматически переходить
        const shouldAutoNavigate =
          localStorage.getItem('autoNavigate') === 'true';

        if (shouldAutoNavigate) {
          // Автоматически переходим на страницу профиля
          this.continue();

          // Сбрасываем флаг автоперехода
          localStorage.removeItem('autoNavigate');
          return;
        }
      }
    }

    this.loadExistingProfile();
  }
  loadExistingProfile() {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) return;
    this.loading = true;

    this.characterService.getUserProfile(currentUser.name).subscribe({
      next: (profile) => {
        console.log('Existing profile loaded:', profile);

        if (profile) {
          this.existingProfile = profile;
          if (profile.selectedCharacterName) {
            this.preSelectCharacter(profile.selectedCharacterName);
          }
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading profile:', error);
        this.loading = false;
      },
    });
  }

  preSelectCharacter(characterName: string) {
    const foundCharacter = this.characters.find(
      (c) => c.name === characterName
    );
    if (foundCharacter) {
      this.selectedCharacter = foundCharacter;
    }
  }

  isCharacterSelected(character: Character): boolean {
    return character.name === this.selectedCharacter.name;
  }

  selectCharacter(character: Character) {
    this.selectedCharacter = character;
    console.log('Selected character template:', character.name);

    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      console.error('User not logged in');
      return;
    }

    // Сначала проверим, есть ли у пользователя персонаж этого класса в localStorage
    if (typeof window !== 'undefined') {
      const savedCharacterKey = `character_${
        currentUser.userId || currentUser.name
      }_${character.name}`;
      const savedCharacter = localStorage.getItem(savedCharacterKey);

      if (savedCharacter) {
        try {
          console.log(
            `Found existing character ${character.name} in localStorage`
          );
          this.selectedCharacter = JSON.parse(savedCharacter);

          // Используем существующий персонаж
          console.log(
            'Using existing character from localStorage:',
            this.selectedCharacter
          );
          return;
        } catch (error) {
          console.error('Error parsing saved character:', error);
        }
      }
    }

    // Проверяем, есть ли существующий профиль с тем же именем
    if (
      this.existingProfile &&
      this.existingProfile.characterData &&
      this.existingProfile.characterData.name === character.name
    ) {
      console.log('Using existing character data from profile');
      this.selectedCharacter = { ...this.existingProfile.characterData };
      console.log('Selected existing character:', this.selectedCharacter);
    } else {
      // Используем шаблон, но создаем стабильный ID без timestamp
      this.selectedCharacter = { ...character };

      // Используем стабильный ID без временной метки
      if (
        this.selectedCharacter._id &&
        this.selectedCharacter._id.endsWith('-template')
      ) {
        this.selectedCharacter._id = `${character.name}`;
      }

      console.log('Using template character:', this.selectedCharacter);
    }
  }

  continue() {
    console.log('Navigating with character:', this.selectedCharacter);

    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      console.error('User not logged in');
      this.router.navigate(['/login']);
      return;
    }

    // Проверка, существует ли уже профиль для данного пользователя
    if (this.existingProfile) {
      console.log('Existing profile found:', this.existingProfile);

      // Проверяем, есть ли профиль с таким же именем класса
      if (
        this.existingProfile.selectedCharacterName ===
        this.selectedCharacter.name
      ) {
        console.log('Updating existing character profile with same class');

        // Сохраняем важные данные из существующего профиля
        if (this.existingProfile.characterData) {
          // Сохраняем ID, уровень, опыт и достижения из существующего профиля
          this.selectedCharacter._id = `${this.selectedCharacter.name}`;
          this.selectedCharacter.level =
            this.existingProfile.characterData.level || 1;
          this.selectedCharacter.xp =
            this.existingProfile.characterData.xp || 0;
          this.selectedCharacter.xpToNextLevel =
            this.existingProfile.characterData.xpToNextLevel || 1000;

          // Сохраняем достижения, если они есть
          if (
            this.existingProfile.characterData.achievements &&
            this.existingProfile.characterData.achievements.length > 0
          ) {
            this.selectedCharacter.achievements = JSON.parse(
              JSON.stringify(this.existingProfile.characterData.achievements)
            );
          }

          // Сохраняем другие важные данные, если они есть
          if (this.existingProfile.characterData.stats) {
            this.selectedCharacter.stats = {
              ...this.existingProfile.characterData.stats,
            };
          }
        }

        // Используем ID существующего профиля
        const profileId = this.existingProfile._id || '';
        if (!profileId) {
          console.error('Profile ID is undefined, cannot update profile');
          return;
        }

        console.log('Updating profile with ID:', profileId);

        // Сохраняем персонажа в localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem(
            `character_${currentUser.name}`,
            JSON.stringify(this.selectedCharacter)
          );
          localStorage.setItem(
            'selectedCharacter',
            JSON.stringify(this.selectedCharacter)
          );
        }

        // Обновляем существующий профиль
        this.characterService
          .updateProfile(profileId, this.selectedCharacter)
          .subscribe({
            next: (response) => {
              console.log('Profile updated successfully:', response);
              this.router.navigate(['/character-profile'], {
                state: { character: this.selectedCharacter },
              });
            },
            error: (error) => {
              console.error('Error updating profile:', error);
            },
          });
      } else {
        // Пользователь хочет создать персонажа другого класса
        console.log('Creating new character of different class');

        // Проверяем, есть ли уже персонаж этого класса в других профилях
        this.characterService.getUserProfiles(currentUser.name).subscribe({
          next: (profiles: CharacterProfile[]) => {
            console.log('All user profiles:', profiles);

            // Ищем профиль с таким же классом персонажа
            const existingClassProfile = profiles.find(
              (p: CharacterProfile) =>
                p.selectedCharacterName === this.selectedCharacter.name
            );

            if (existingClassProfile) {
              console.log(
                'Found existing profile for this class:',
                existingClassProfile
              );

              // Используем существующий профиль
              if (existingClassProfile.characterData) {
                this.selectedCharacter._id =
                  existingClassProfile.characterData._id ||
                  `${this.selectedCharacter.name}_${Date.now()}`;
                this.selectedCharacter.level =
                  existingClassProfile.characterData.level || 1;
                this.selectedCharacter.xp =
                  existingClassProfile.characterData.xp || 0;
                this.selectedCharacter.xpToNextLevel =
                  existingClassProfile.characterData.xpToNextLevel || 1000;

                // Сохраняем достижения, если они есть
                if (existingClassProfile.characterData.achievements) {
                  this.selectedCharacter.achievements = JSON.parse(
                    JSON.stringify(
                      existingClassProfile.characterData.achievements
                    )
                  );
                }
              }

              if (!existingClassProfile._id) {
                console.error(
                  'Existing class profile ID is undefined, cannot update profile'
                );
                this.createNewProfile();
                return;
              }

              // Обновляем существующий профиль
              this.characterService
                .updateProfile(existingClassProfile._id, this.selectedCharacter)
                .subscribe({
                  next: () => {
                    localStorage.setItem(
                      'selectedCharacter',
                      JSON.stringify(this.selectedCharacter)
                    );
                    this.router.navigate(['/character-profile'], {
                      state: { character: this.selectedCharacter },
                    });
                  },
                  error: (error) =>
                    console.error('Error updating profile:', error),
                });
            } else {
              // Создаем новый профиль, только если не нашли существующий для этого класса
              this.createNewProfile();
            }
          },
          error: () => {
            // В случае ошибки получения профилей, создаем новый
            this.createNewProfile();
          },
        });
      }
    } else {
      // Если профилей вообще нет, создаем новый
      this.createNewProfile();
    }
  }

  // Вспомогательный метод для создания нового профиля
  private createNewProfile() {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      console.error('User not logged in');
      return;
    }

    // Устанавливаем стабильный ID без временной метки
    if (
      this.selectedCharacter._id &&
      this.selectedCharacter._id.endsWith('-template')
    ) {
      this.selectedCharacter._id = `${this.selectedCharacter.name}`;
    } else if (!this.selectedCharacter._id) {
      this.selectedCharacter._id = `${this.selectedCharacter.name}`;
    }

    console.log('Creating new profile with character:', this.selectedCharacter);

    // Получаем текущий прогресс
    const currentProgress = this.characterService.getCurrentProgress();

    // Синхронизируем прогресс с персонажем
    this.selectedCharacter.level = currentProgress.level;
    this.selectedCharacter.xp = currentProgress.experience;
    this.selectedCharacter.xpToNextLevel =
      currentProgress.experienceToNextLevel;

    // Сохраняем в localStorage с правильным ключом
    if (typeof window !== 'undefined') {
      localStorage.setItem(
        `character_${currentUser.userId || currentUser.name}_${
          this.selectedCharacter.name
        }`,
        JSON.stringify(this.selectedCharacter)
      );
      localStorage.setItem(
        'selectedCharacter',
        JSON.stringify(this.selectedCharacter)
      );
    }

    this.characterService.createProfile(this.selectedCharacter).subscribe({
      next: (response) => {
        console.log('Profile created successfully:', response);
        this.router.navigate(['/character-profile'], {
          state: { character: this.selectedCharacter },
        });
      },
      error: (error) => {
        console.error('Error creating profile:', error);
      },
    });
  }

  onMainScreen() {
    this.router.navigate(['/']);
  }
}
