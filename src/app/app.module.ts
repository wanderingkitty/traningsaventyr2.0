// app/app.module.ts
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { routes } from './app.routes';
import { AppComponent } from './app.component';
import { LandingComponent } from './components/landing-page/landing.component';
import { LoginPageComponent } from './components/login/login-page.component';
import { CharacterCreationComponent } from './components/character-creation/character-creation.component';
import { CharacterProfileComponent } from './components/profile/character-profile.component';
import { WorkoutComponent } from './components/workouts/workout-logging.component';

@NgModule({
  imports: [
    BrowserModule,
    RouterModule.forRoot(routes),
    AppComponent,
    LandingComponent,
    LoginPageComponent,
    CharacterCreationComponent,
    CharacterProfileComponent,
    WorkoutComponent,
  ],
  providers: [],
})
export class AppModule {}
