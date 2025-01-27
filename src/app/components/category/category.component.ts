import {Component, OnDestroy, OnInit} from '@angular/core';
import {first, Subject, switchMap} from "rxjs";
import {ActivatedRoute, Router} from "@angular/router";
import {CategoryService} from "../../shared/category.service";
import {map, takeUntil} from "rxjs/operators";
import {QuizService} from "../../shared/quiz.service";
import {QuizModal} from "../../shared/modal/quiz";
import {CategoryModal} from "../../shared/modal/category";
import {IconName as BootstrapIconName} from "ngx-bootstrap-icons/lib/types/icon-names.type";
import {ClipboardService} from "../../shared/clipboard.service";
import {UsersService} from "../../shared/users.service";
import {ConfirmDialogComponent} from "../user-profile/ConfirmDialog.component";
import {MatDialog} from "@angular/material/dialog";
import {AuthService} from "../../shared/auth/auth.service";

@Component({
  selector: 'app-category',
  templateUrl: './category.component.html',
  styleUrls: ['./category.component.sass']
})
export class CategoryComponent implements OnInit, OnDestroy {
  quizzes: (QuizModal | null)[] = [];
  public pageSize: number = 10;
  public quizzesIDs: string[] = [];
  private currentIndex: number = 0;
  public category: CategoryModal | null = null;
  public icon: BootstrapIconName | undefined;
  private unsubscribe$ = new Subject<void>();
  currentPage: number = 1;
  public categoryFound: boolean = true;
  public quizzesFound: boolean = true;
  constructor(
    public authService: AuthService,
    private route: ActivatedRoute,
    public router: Router,
    private categoryService: CategoryService,
    private quizService: QuizService,
    private userService: UsersService,
    private clipboardService: ClipboardService,
    public dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.route.params.pipe(
      map(params => params['id']),
      switchMap(id => this.categoryService.getCategory(id))
    ).pipe(first()).subscribe(category => {
      if (!category) {
        this.categoryFound = false;
        return;
      }
      this.category = category;
      this.icon = category.icon as BootstrapIconName
      if(!category.quizzes){
        this.quizzesFound = false;
        return;
      }
      this.quizzesIDs = category.quizzes;
      if (this.quizzesIDs.length === 0) {
        this.quizzesFound = false;
      } else {
        this.loadMoreQuizzes();
      }
    });
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
          this.userService.getUsername(quiz.authorId)
            .pipe(takeUntil(this.unsubscribe$))
            .subscribe(username => {
              quiz.authorName = username;
            });
        });


        this.currentIndex += this.pageSize;
      });
  }

  pageChange(newPage: number): void {
    this.currentPage = newPage;
    this.loadMoreQuizzes();
  }

  goToQuiz(quizId: string): void {
    this.router.navigate(["quiz", quizId]);
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
  editQuiz(quiz: QuizModal): void {
    this.router.navigate(['edit-quiz', quiz.quizID])
  }
  deleteQuiz(quiz: QuizModal): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '250px',
    });

    dialogRef.afterClosed().subscribe(result => {
      if(result) {
        if(quiz.quizID) {
          this.quizService.deleteQuiz(quiz.quizID).then(() => {
            this.loadMoreQuizzes();
          });
        }
      }
    });
  }
  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
  get isAdmin() {
    return this.authService.isAdmin;
  }
  get isPaid() {
    return this.authService.isPaid;
  }
  shareQuiz(id: string) {
    this.clipboardService.copyQuizUrl(id);
  }

}
