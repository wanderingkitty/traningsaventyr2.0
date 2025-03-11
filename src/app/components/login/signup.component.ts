import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, RouterModule],
})
export class SignupComponent {
  username = '';
  password = '';
  message = '';
  isRegistering = false;
  constructor(private authService: AuthService, private router: Router) {}

  async onSignup() {
    if (this.username.trim().length < 3) {
      this.message = 'Username must be at least 3 characters long';
      return;
    }

    if (this.password.length < 4) {
      this.message = 'The password must be at least 4 characters long';
      return;
    }

    try {
      this.isRegistering = true;
      this.message = '';

      const result = await this.authService.signup(
        this.username,
        this.password
      );

      if (!result) {
        this.message = 'Registration error, try another username';
      }
    } catch (error) {
      this.message = 'Registration error';
      console.error('Signup error:', error);
    } finally {
      this.isRegistering = false;
    }
  }

  onMainScreen() {
    this.router.navigate(['/']);
  }
}
