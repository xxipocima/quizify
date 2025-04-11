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
import {ServicesComponent} from "./components/services/services.component";
import {ArticlesComponent} from "./components/articles/articles.component";
import {ArticleCreatorComponent} from "./components/article-creator/article-creator.component";
import {CategoryCreatorComponent} from "./components/category-creator/category-creator.component";

const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    pathMatch: 'full'
  },
  { path: 'services',
    component: ServicesComponent,
    data: {name: 'services'}
  },
  { path: 'free-test',
    component: ServicesComponent,
    data: {name: 'free-test'}
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
    path: 'result/:id',
    component: ResultComponent
  },
  {
    path: 'articles',
    component: ArticlesComponent
  },
  {
    path: 'articles/:id',
    component: ArticlesComponent
  },
  {
    path: 'create-quiz',
    component: QuizCreatorComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'edit-quiz/:id',
    component: QuizCreatorComponent,
    canActivate: [AuthGuard],
    data: {reload: true}
  },
  {
    path: 'create-article',
    component: ArticleCreatorComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'edit-article/:id',
    component: ArticleCreatorComponent,
    canActivate: [AuthGuard],
    data: {reload: true}
  },
  {
    path: 'create-category',
    component: CategoryCreatorComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'edit-category/:id',
    component: CategoryCreatorComponent,
    canActivate: [AuthGuard],
    data: {reload: true}
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
