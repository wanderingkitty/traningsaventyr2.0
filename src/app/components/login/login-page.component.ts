// login-page.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { HttpClientModule } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, RouterModule],
})
export class LoginPageComponent {
  username = '';
  password = '';

  constructor(private authService: AuthService, private router: Router) {}

  async onLogin() {
    await this.authService.login(this.username, this.password);
  }

  onSignin() {
    this.router.navigate(['/signup']);
  }

  onMainScreen() {
    this.router.navigate(['/']);
  }
}
