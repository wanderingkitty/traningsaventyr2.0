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
  private _ticking = false;

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
    // Add throttling for scroll events to prevent lag
    if (this._ticking) return;

    this._ticking = true;
    requestAnimationFrame(() => {
      const scrollTop = window.scrollY;
      const windowHeight = window.innerHeight;
      const pageMiddle = windowHeight / 2;
      const isMobile = window.innerWidth <= 768;

      // Simplify parallax on mobile devices
      if (isMobile) {
        this.handleMobileParallax(scrollTop, windowHeight);
      } else {
        this.handleDesktopParallax(scrollTop, windowHeight, pageMiddle);
      }

      this._ticking = false;
    });
  }

  // Optimized parallax for mobile devices
  private handleMobileParallax(scrollTop: number, windowHeight: number): void {
    const title = document.querySelector('.title') as HTMLElement;
    const content = document.querySelector('.content') as HTMLElement;

    if (title && content) {
      // Simpler transformations for title to reduce calculations
      title.style.transform = `translateY(${-scrollTop * 0.2}px)`;

      // Limit content movement for better performance
      const transformValue = Math.max(-scrollTop * 0.7, -windowHeight);
      content.style.transform = `translateY(${transformValue}px)`;
    }

    // Simplified mountain animations for mobile
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
      // Reduce complexity of mountain animations
      mountainsBack.style.transform = `translateY(${scrollTop * 0.05}px)`;
      mountainsMid.style.transform = `translateY(${scrollTop * 0.1}px)`;
      mountainsFront.style.transform = `translateY(${scrollTop * 0.15}px)`;
    }

    // Simplified tree animations for mobile
    const trees = document.querySelector('.trees') as HTMLElement;
    if (trees) {
      const screenWidth = window.innerWidth;
      let baseOffset = 0;
      let treeScaleFactor = 1.0;

      if (screenWidth <= 480) {
        baseOffset = 0;
        treeScaleFactor = 1.0;
      } else {
        baseOffset = 0;
        treeScaleFactor = 1.1;
      }

      // Simpler tree movement
      const treeY = baseOffset + scrollTop * 0.2;

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

  // Full parallax for desktop devices
  private handleDesktopParallax(
    scrollTop: number,
    windowHeight: number,
    pageMiddle: number
  ): void {
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

      let transformValue = -scrollTop * 1.0;

      if (scrollTop > pageMiddle) {
        const scrollBeyondMiddle = scrollTop - pageMiddle;
        transformValue = -pageMiddle * 1.0 + scrollBeyondMiddle * 0.6;
      }

      content.style.transform = `translateY(${transformValue}px)`;
    } else {
      console.warn('Title or content element not found!');
    }

    // Mountain parallax for desktop
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
      mountainsBack.style.transform = `translateY(${scrollTop * 0.1}px)`;
      mountainsMid.style.transform = `translateY(${scrollTop * 0.15}px)`;
      mountainsFront.style.transform = `translateY(${scrollTop * 0.2}px)`;
    }

    // Tree parallax for desktop
    const trees = document.querySelector('.trees') as HTMLElement;
    if (trees) {
      const startScale = 1.3;
      const endScale = 1.1;

      const treeMaxScroll = 800 * 0.7;
      const treeProgress = Math.min(1, scrollTop / treeMaxScroll);

      const treeScale = startScale - (startScale - endScale) * treeProgress;
      const screenHeight = window.innerHeight;

      let baseOffset;

      if (screenHeight < 600) {
        baseOffset = -50;
      } else if (screenHeight < 800) {
        baseOffset = -100;
      } else {
        baseOffset = -150;
      }

      let treeY = baseOffset;
      if (scrollTop > 0) {
        treeY = baseOffset + scrollTop * 0.35;
      }

      trees.style.cssText = `
        opacity: 1;
        transform: scale(${treeScale}) translateY(${treeY}px);
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
