import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {SecureInnerPagesGuard} from "./shared/auth/secure-inner-pages.guard";
import {AuthGuard} from "./shared/auth/auth.guard";
import {UserProfileComponent} from "./components/user-profile/user-profile.component";
import {SignInComponent} from "./components/sign-in/sign-in.component";
import {HomeComponent} from "./components/home/home.component";
import {RegisterSuccessComponent} from "./components/sign-in/register-success/register-success.component";
import {ForgotPasswordComponent} from "./components/sign-in/forgot-password/forgot-password.component";
import {QuizComponent} from "./components/quiz/quiz.component";
import {ResultComponent} from "./components/result/result.component";
import {QuizCreatorComponent} from "./components/quiz-creator/quiz-creator.component";
import {CategoryComponent} from "./components/category/category.component";
import {UserComponent} from "./components/user/user.component";
import {UserEditComponent} from "./components/user-edit/user-edit.component";
import {TagCreateComponent} from "./components/tag-create/tag-create.component";
import {PackageComponent} from "./components/package/package.component";
import {QuizByTagComponent} from "./components/quiz-by-tag/quiz-by-tag.component";

const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    pathMatch: 'full'
  },
  { path: 'account',
    component: UserProfileComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'sign-in',
    component: SignInComponent,
    canActivate: [SecureInnerPagesGuard],
  },
  {
    path: 'sign-in/forgot',
    component: ForgotPasswordComponent,
    canActivate: [SecureInnerPagesGuard],
  },
  {
    path: 'sign-in/register-complete',
    component: RegisterSuccessComponent
  },
  {
    path: 'quiz',
    component: QuizComponent
  },
  {
    path: 'quiz/:id',
    component: QuizComponent
  },
  {
    path: 'result',
    component: ResultComponent
  },
  {
    path: 'create-quiz',
    component: QuizCreatorComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'edit-quiz/:id',
    component: QuizCreatorComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'tag/:id',
    component: CategoryComponent
  },
  {
    path: 'tag-create',
    component: TagCreateComponent
  },
  {
    path: 'user/:id',
    component: UserComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'user-edit/:id',
    component: UserEditComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'test/:id',
    component: QuizByTagComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'users',
    component: UserComponent
  },
  {
    path: 'package',
    component: PackageComponent
  },
  { path: '**', redirectTo: '' }
];
@NgModule({
  imports: [RouterModule.forRoot(routes,  { useHash: true })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
