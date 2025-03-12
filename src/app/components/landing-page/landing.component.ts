import { Component, HostListener, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { CharacterService } from '../services/character.service';

@Component({
  selector: 'app-landing',
  templateUrl: 'landing.component.html',
  styleUrls: ['landing.component.scss'],
  standalone: true,
  imports: [RouterModule],
})
export class LandingComponent implements OnInit {
  isLoggedIn = false;

  constructor(
    private router: Router,
    private authService: AuthService,
    private characterService: CharacterService
  ) {}

  ngOnInit() {
    const currentUser = this.authService.getCurrentUser();
    this.isLoggedIn = !!currentUser;

    console.log(
      'Current user status:',
      this.isLoggedIn ? 'Logged in' : 'Not logged in'
    );
    this.handleParallax();
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.handleParallax();
  }

  private handleParallax(): void {
    const scrollTop = window.scrollY;
    const maxScroll = 800;
    const windowHeight = window.innerHeight;
    const pageMiddle = windowHeight / 2;

    const title = document.querySelector('.title') as HTMLElement;
    const content = document.querySelector('.content') as HTMLElement;

    if (title && content) {
      const contentRect = content.getBoundingClientRect();
      const contentTop = contentRect.top + window.scrollY;

      const contentMovedDown = contentTop < 0;

      if (contentMovedDown) {
        const contentOffset = Math.abs(contentTop);

        title.style.transform = `translateY(${contentOffset * 0.7}px)`;
        title.style.marginTop = -scrollTop * 0.3 + 'px';
      } else {
        title.style.transform = 'translateY(0)';
        title.style.marginTop = -scrollTop * 0.5 + 'px';
      }

      // Возвращаем более быстрое движение контента, как в оригинале
      // но все же немного медленнее
      let transformValue = -scrollTop * 1.0; // Было 1.3, затем 0.8, делаем 1.0

      if (scrollTop > pageMiddle) {
        const scrollBeyondMiddle = scrollTop - pageMiddle;
        transformValue = -pageMiddle * 1.0 + scrollBeyondMiddle * 0.6;
      }

      // Проверяем размер экрана и немного корректируем на мобильных устройствах
      const screenWidth = window.innerWidth;
      if (screenWidth <= 768) {
        transformValue = Math.max(transformValue, -windowHeight * 1.2); // Ограничиваем максимальное смещение
      }

      content.style.transform = `translateY(${transformValue}px)`;
    } else {
      console.warn('Title or content element not found!');
    }

    // Обработка гор для правильного параллакса
    const mountainsBack = document.querySelector(
      '.mountains-back'
    ) as HTMLElement;
    const mountainsMid = document.querySelector(
      '.mountains-mid'
    ) as HTMLElement;
    const mountainsFront = document.querySelector(
      '.mountains-front'
    ) as HTMLElement;

    if (mountainsBack && mountainsMid && mountainsFront) {
      // Горы двигаются немного быстрее при прокрутке
      mountainsBack.style.transform = `translateY(${scrollTop * 0.1}px)`;
      mountainsMid.style.transform = `translateY(${scrollTop * 0.15}px)`;
      mountainsFront.style.transform = `translateY(${scrollTop * 0.2}px)`;
    }

    const trees = document.querySelector('.trees') as HTMLElement;
    if (trees) {
      trees.style.opacity = '1';

      const startScale = 1.3;
      const endScale = 1.1;

      const treeMaxScroll = maxScroll * 0.7;
      const treeProgress = Math.min(1, scrollTop / treeMaxScroll);

      const treeScale = startScale - (startScale - endScale) * treeProgress;

      // Адаптивное начальное смещение в зависимости от устройства
      const screenWidth = window.innerWidth;
      const screenHeight = window.innerHeight;

      // Базовые настройки для разных размеров экрана
      let baseOffset;
      let treeScaleFactor = treeScale;

      if (screenWidth <= 480) {
        // Мобильные устройства
        baseOffset = 0;
        treeScaleFactor = 1.0;
      } else if (screenWidth <= 768) {
        // Планшеты
        baseOffset = 0;
        treeScaleFactor = 1.1;
      } else if (screenHeight < 600) {
        // Очень низкие экраны
        baseOffset = -50;
      } else if (screenHeight < 800) {
        // Средние экраны
        baseOffset = -100;
      } else {
        // Большие экраны
        baseOffset = -150;
      }

      // Деревья двигаются вниз при прокрутке с немного увеличенной скоростью
      let treeY = baseOffset;
      if (scrollTop > 0) {
        treeY = baseOffset + scrollTop * 0.35; // Увеличиваем с 0.3 до 0.35
      }

      trees.style.cssText = `
        opacity: 1;
        transform: scale(${treeScaleFactor}) translateY(${treeY}px);
        z-index: 7; 
        position: absolute;
        bottom: 0;
        left: 0;
        width: 100%;
        pointer-events: none;
      `;
    }
  }

  getStarted() {
    console.log('getStarted clicked');
    const currentUser = this.authService.getCurrentUser();

    if (currentUser) {
      this.characterService.getUserProfile(currentUser.name).subscribe({
        next: (profile) => {
          console.log('Profile found:', profile);
          if (profile) {
            this.router.navigate(['/character-profile']);
          } else {
            this.router.navigate(['/character-creation']);
          }
        },
        error: (err) => {
          console.error('Error getting profile:', err);
          this.router.navigate(['/character-creation']);
        },
      });
    } else {
      this.router.navigate(['/login']);
    }
  }

  learnMore() {
    this.router.navigate(['/about']);
  }
}
