import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:1408/api/users';
  public currentUserSubject = new BehaviorSubject<any>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {
    if (typeof window !== 'undefined') {
      this.loadUserFromStorage();
    }
  }

  private loadUserFromStorage() {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      this.currentUserSubject.next(JSON.parse(savedUser));
    }
  }

  async login(username: string, password: string) {
    try {
      const response = await fetch(`${this.apiUrl}/login`, {
        method: 'POST',
        headers: { 'Content-type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        const userData = { name: username };
        if (typeof window !== 'undefined') {
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(userData));
        }
        this.currentUserSubject.next(userData);
        this.router.navigate(['/character-creation']);
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  }

  async signup(username: string, password: string) {
    try {
      const response = await fetch(`${this.apiUrl}/signup`, {
        method: 'POST',
        headers: { 'Content-type': 'application/json' },
        body: JSON.stringify({ name: username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        const userData = { name: username };
        if (typeof window !== 'undefined') {
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(userData));
        }
        this.currentUserSubject.next(userData);
        this.router.navigate(['/character-creation']);
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  }

  // В AuthService
  logout() {
    const savedCharacter = localStorage.getItem('selectedCharacter');
    const savedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    // Сохраняем персонажа на сервере напрямую из AuthService
    if (savedCharacter && savedUser && token) {
      try {
        const userData = JSON.parse(savedUser);
        const character = JSON.parse(savedCharacter);

        // Выполняем HTTP-запрос напрямую
        this.http
          .put(
            `http://localhost:1408/api/profiles/${userData.name}/characters/${character.name}`,
            {
              userId: userData.name,
              username: userData.name,
              selectedCharacterName: character.name,
              characterData: character,
            },
            {
              headers: {
                'Content-type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
            }
          )
          .subscribe({
            next: () => console.log('Персонаж сохранен перед выходом'),
            error: (err) => console.error('Ошибка сохранения персонажа:', err),
          });

        // Сохраняем в localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem(`character_${userData.name}`, savedCharacter);
        }
      } catch (error) {
        console.error('Ошибка при обработке данных персонажа:', error);
      }
    }

    // Стандартная логика выхода
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.setItem('autoNavigate', 'true');
    }

    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);

    if (typeof window !== 'undefined') {
      // Очищаем токен и текущего пользователя
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.setItem('autoNavigate', 'true');
    }

    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  getCurrentUser() {
    return this.currentUserSubject.value;
  }
}
