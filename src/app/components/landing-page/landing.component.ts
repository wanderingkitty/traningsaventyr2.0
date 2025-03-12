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

      let transformValue = -scrollTop * 1.3;

      if (scrollTop > pageMiddle) {
        const scrollBeyondMiddle = scrollTop - pageMiddle;
        transformValue = -pageMiddle * 1.4 + scrollBeyondMiddle * 0.7;
      }

      content.style.transform = `translateY(${transformValue}px)`;
    } else {
      console.warn('Title or content element not found!');
    }

    const trees = document.querySelector('.trees') as HTMLElement;
    if (trees) {
      trees.style.opacity = '1';

      const startScale = 1.3;
      const endScale = 1.1;

      const treeMaxScroll = maxScroll * 0.7;
      const treeProgress = Math.min(1, scrollTop / treeMaxScroll);

      const treeScale = startScale - (startScale - endScale) * treeProgress;

      const initialTreeOffset = 30;
      const treeY = initialTreeOffset * (1 - treeProgress);

      trees.style.transform = `scale(${treeScale}) translateY(${treeY}px)`;
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
