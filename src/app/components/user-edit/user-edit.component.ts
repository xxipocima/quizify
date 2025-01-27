import {Component, OnDestroy, OnInit} from '@angular/core';
import {first, Observable, Subject, switchMap, take} from "rxjs";
import {ActivatedRoute, Router} from "@angular/router";
import {QuizService} from "../../shared/quiz.service";
import {map, takeUntil} from "rxjs/operators";
import {QuizModal} from "../../shared/modal/quiz";
import {UserModal} from "../../shared/modal/user";
import {ClipboardService} from "../../shared/clipboard.service";
import {UsersService} from "../../shared/users.service";
import {CategoryService} from "../../shared/category.service";
import {CategoryModal} from "../../shared/modal/category";
import {findIconDefinition, IconName} from "@fortawesome/fontawesome-svg-core";
import {IconName as BootstrapIconName} from "ngx-bootstrap-icons/lib/types/icon-names.type";
import {PromoQuizModal} from "../../shared/modal/promoQuiz";

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.sass']
})
export class UserComponent implements OnInit, OnDestroy {
  quizzes: (QuizModal | null)[] = [];
  users: (any | null)[] = [];
  public pageSize: number = 10;
  public quizzesIDs: string[] = [];
  public usersIDs: string[] = [];
  private currentIndex: number = 0;
  public user: UserModal | undefined = undefined;
  private unsubscribe$ = new Subject<void>();
  currentPage: number = 1;
  public userFound: boolean = true;
  public usersFound: boolean = true;
  public quizzesFound: boolean = true;
  constructor(
    private route: ActivatedRoute,
    public router: Router,
    private userService: UsersService,
    private quizService: QuizService,
    private categoryService: CategoryService,
    private clipboardService: ClipboardService
  ) { }

  ngOnInit(): void {
    this.userService.getUsersIDs().pipe(take(1)).subscribe((userIDs: any[]) => {
      for (const userId of userIDs) {
        if(!userId)
          return;
        this.usersIDs.push(userId);
      }
    });
    this.route.params.pipe(
      map(params => params['id']),
      switchMap(username => this.userService.getUserID(username))
    ).pipe(first()).subscribe(userID => {
      if (!userID) {
        this.loadMoreUsers();
        return;
      }
      this.userService.getUserData(userID).pipe(first()).subscribe(user => {
        if (!user) {
          this.userFound = false;
          return;
        }
      this.user = user as UserModal;
      if(!this.user.quizzes){
        this.quizzesFound = false;
        return;
      }
      this.quizzesIDs = this.user.quizzes;
      if (this.quizzesIDs.length === 0) {
        this.quizzesFound = false;
      } else {
        this.loadMoreQuizzes();
      }
    })})
  }

  loadMoreQuizzes(): void {
    const quizSubset = this.quizzesIDs.slice(this.currentIndex, this.currentIndex + this.pageSize);
    this.quizService.getQuizzes(quizSubset)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(quizzes => {
        if(!quizzes)
          return;
        this.quizzes = [...this.quizzes, ...quizzes];

        if(this.quizzes)
          this.quizzes.forEach(quiz => {
            if(quiz)
              this.categoryService.getCategory(quiz.categoryId)
                .pipe(takeUntil(this.unsubscribe$))
                .subscribe(category => {
                  if(category)
                  quiz.categoryName = category.name;
                });
          });

        this.currentIndex += this.pageSize;
      });
  }

  loadMoreUsers(): void {
    const userSubset = this.usersIDs.slice(this.currentIndex, this.currentIndex + this.pageSize);
    this.userService.getUsers(userSubset).pipe(takeUntil(this.unsubscribe$))
      .subscribe((users) => {
      for (const user of users) {
        if(!user)
          return;
        this.users = [...this.users, user];
      }
    });

    this.currentIndex += this.pageSize;
  }

  pageChange(newPage: number): void {
    this.currentPage = newPage;
    this.loadMoreQuizzes();
  }

  goToQuiz(quizId: string): void {
    this.router.navigate(["quiz", quizId]);
  }

  editUser(userName: string): void {
    this.router.navigate(["user", userName]);
  }

  getLimitedText(text: string, limit: number): string {
    if(!text)
      return "";

    if (text.length > limit) {
      return text.substring(0, limit) + '...';
    } else {
      return text;
    }
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  shareQuiz(id: string) {
    this.clipboardService.copyQuizUrl(id);
  }

}
