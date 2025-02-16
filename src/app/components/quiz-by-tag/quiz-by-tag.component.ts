import {Component, OnInit, HostBinding, HostListener, OnDestroy} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import {ActivatedRoute, Router} from '@angular/router';
import { MatRadioChange } from '@angular/material/radio';
import {QuizService} from "../../shared/quiz.service";
import {UsersService} from "../../shared/users.service";
import {QuestionModal} from "../../shared/modal/question";
import {faArrowLeft} from "@fortawesome/free-solid-svg-icons";
import { Location } from '@angular/common'
import {QuizModal} from "../../shared/modal/quiz";
import {first, Subject, switchMap, take} from "rxjs";
import {AuthService} from "../../shared/auth/auth.service";
import {ResultService} from "../../shared/result.service";
import {map, takeUntil} from "rxjs/operators";
import {IconName as BootstrapIconName} from "ngx-bootstrap-icons/lib/types/icon-names.type";
import {CategoryService} from "../../shared/category.service";
import {ResultModal} from "../../shared/modal/result";
import {UserModal} from "../../shared/modal/user";
import {MatSnackBar} from "@angular/material/snack-bar";

@Component({
  selector: 'app-quiz-by-tag',
  templateUrl: './quiz-by-tag.component.html',
  styleUrls: ['./quiz-by-tag.component.sass']
})
export class QuizByTagComponent implements OnInit, OnDestroy {

  faArrowLeft = faArrowLeft;
  questions: (QuestionModal | null | QuestionModal[])[] = [];
  private unsubscribe$ = new Subject<void>();
  public quizzesIDs: string[] = [];
  public selectedAnswer: number = 0;
  public isLoading: Boolean = false;
  public resultID: string = "";
  public tagName: string = "";
  public categoryFound: boolean = true;
  public isQuizNotFound = false;
  public userAttempts: number = 0;
  public userTakedQuizId: string = "";
  public userResults: string[] = [];
  public arrayAnswers: any[] = [];
  public arrayPoints: any[] = [];
  public quizzesFound: boolean = true;

  constructor(
    private snackBar: MatSnackBar,
    private route: ActivatedRoute,
    public quizService: QuizService,
    public UsersService: UsersService,
    public sanitizer: DomSanitizer,
    public router: Router,
    public authService: AuthService,
    public categoryService: CategoryService,
    public resultService: ResultService
  ) { }

  ngOnInit(): void {
    this.isLoading = true;
    const userId = this.authService.getUserID()
    if(!userId){
      this.router.navigate(['sign-in']);
      return;
    }
    const currentUser = this.authService.getCurrentUserData();

    this.userAttempts = this.authService.getAttempts(currentUser);
    this.userResults = this.authService.getResults(currentUser);
    this.userTakedQuizId = this.authService.getTakedQuizId(currentUser);
    this.resultService.getResults(this.userResults).pipe(take(1))
      .subscribe(
        (results: (ResultModal | null)[]) => {
          if(results) {
            this.route.params.subscribe(params => {
              results.forEach(result => {
                if(result?.categoryName === 'awareness' && params['id'] === 'awareness' && this.userTakedQuizId === ''){
                  this.router.navigate(['package']);
                  return;
                }
              });
            });
          }
        }
      );

    this.route.params.subscribe(params => {
      if (params['id'] === 'knowledge' && !this.isPaid){
        this.router.navigate(['package']);
        return;
      }
      if (params['id'] === 'skills' && !this.isPaid){
        this.router.navigate(['package']);
        return;
      }
    });

    if(this.userAttempts <= 0){
      this.router.navigate(['package']);
      return;
    }

    console.log('currentUser.takedQuizId', currentUser)
    console.log('currentUser.takedQuizId', currentUser.takedQuizId)
    if (currentUser.takedQuizId === '') {

      this.resultService.createResult({
        questionData: [],
        answers: [],
        points: [],
        answersTime: [],
        seconds: 0,
        qnProgress: 0,
        correctAnsCount: 0,
        score: 0,
        resultID: '',
        userId: '',
        categoryName: '',
      }).then(res => {
        console.log('resultService',res)
        this.authService.UpdateUserTakedQuiz(res);
        this.resultID = res;
        }
      );

    this.route.params.pipe(
      map(params => params['id']),
      switchMap(id => this.categoryService.getCategory(id))
    ).pipe(first()).subscribe(category => {
      if (!category) {
        this.categoryFound = false;
        return;
      }
      this.tagName = category.id;
      if(!category.quizzes){
        this.quizzesFound = false;
        return;
      }
      this.quizzesIDs = category.quizzes;
      if (this.quizzesIDs.length === 0) {
        this.quizzesFound = false;
      } else {
        this.getQuizzesQuestions(category.quizzes);
      }
    });
      this.quizService.qnProgress = 0;
      this.quizService.seconds = 0;
      this.quizService.resultID = this.resultID;
      this.quizService.tagId = this.tagName;

    } else {
      this.resultService.getResultData(currentUser.takedQuizId).pipe(first()).subscribe(
        res => {

          const result: ResultModal = res as ResultModal;

          if(!result)
          {
            this.isQuizNotFound=true;
            return;
          }
          //@ts-ignore
          this.resultID = result.resultID;
          this.quizService.questionData = result.questionData;
          this.quizService.answers = result.answers;
          this.quizService.points = result.points;
          this.quizService.answersTime = result.answersTime;
          this.quizService.seconds = result.seconds;
          this.quizService.qnProgress = result.qnProgress;
          this.quizService.correctAnsCount = result.correctAnsCount;
          this.quizService.resultID = currentUser.takedQuizId;
          this.quizService.tagId = result.categoryName;
          this.startTimer();
          this.saveResultsAtTimer();
          this.isLoading = false;
        }
      );
    }
  }

  public get valueAsStyle(): any {
    return this.sanitizer.bypassSecurityTrustStyle(`--progress-bar: ${this.getProgressValue}%`);
  }

  @HostListener('window:beforeunload')
  preventNavigation() {
    return this.quizService.qnProgress <= 0;
  }

  back(): void {
    // this.location.back()
  }


  public get getProgressValue() {
    const progressValue = (this.quizService.qnProgress + 1) * (100 / this.quizService.questionData.length);
    return progressValue;
  }

  // Getting quiz data
  getQuizzesQuestions(quizIDs: string[]) {
  //  this.quizService.sendData()

    this.quizService.getQuizzesQuestions(quizIDs).pipe(takeUntil(this.unsubscribe$)).subscribe(
      questions => {
        if(!questions)
        {
          this.isQuizNotFound = true;
          this.isLoading = false;
          return;
        }
        if(questions){
          questions.forEach(question => {
            // @ts-ignore
            question.forEach(item => {
              this.questions.push(item)
            });
          });

          this.quizService.questionData = this.questions as QuestionModal[];
          this.startTimer();
          this.saveResultsAtTimer();
          this.isLoading = false;
        }
      }
    );
  }
  saveResults(){
    console.log('this.quizService.answers',this.quizService.answers);
    this.resultService.updateResult(this.resultID, {
      questionData: this.quizService.questionData,
      answers: this.quizService.answers,
      points: this.quizService.points,
      answersTime: this.quizService.answersTime,
      seconds: this.quizService.seconds,
      qnProgress: this.quizService.qnProgress,
      correctAnsCount: this.quizService.correctAnsCount,
      score: this.quizService.totalScore(),
      resultID: this.quizService.resultID,
      userId: '',
      categoryName: this.quizService.tagId,
    }).then(res => {
      return res;
      }
    )
  }

  // Start timer
  saveResultsAtTimer() {
    // @ts-ignore
    this.quizService.saveResults = setInterval(() => {
      this.saveResults();
    }, 5000)
  }

  // Start timer
  startTimer() {
    // @ts-ignore
    this.quizService.timer = setInterval(() => {
      this.quizService.seconds++;
    }, 1000)
  }

  answerChecked(id: any, points: any, isChecked: boolean){
    if (isChecked){
      this.arrayAnswers.push(id);
      this.arrayPoints.push(points);
    } else {
      this.arrayAnswers.splice(this.arrayAnswers.indexOf(id), 1);
      this.arrayPoints.splice(this.arrayPoints.indexOf(id), 1);
    }
  }

  selectAnswer(){
    if (this.arrayAnswers.length <= 0){
      this.snackBar.open('Minimum one answer need to be chosen!', "OK", {
        duration: 5000
      });
      return;
    }
    this.quizService.answers[this.quizService.qnProgress] = JSON.stringify(this.arrayAnswers);
    this.arrayAnswers = [];
    this.quizService.points[this.quizService.qnProgress] = JSON.stringify(this.arrayPoints);
    this.arrayPoints = [];
    this.quizService.answersTime[this.quizService.qnProgress] = this.quizService.displayTimeElapsed();
    this.quizService.qnProgress++;
    this.saveResults();
    if (this.quizService.questionData.length == this.quizService.qnProgress) {
      // @ts-ignore
      clearInterval(this.quizService.timer);
      // @ts-ignore
      clearInterval(this.quizService.saveResults);
      this.authService.UpdateUserTakedQuiz('');
      this.authService.UpdateUserAttempts(this.userAttempts - 1);
      this.router.navigate(['/result']);
      return;
    }
  }
  get isAdmin() {
    return this.authService.isAdmin;
  }
  get isPaid() {
    return this.authService.isPaid;
  }

  ngOnDestroy(): void {
    // @ts-ignore
    clearInterval(this.quizService.timer);
    // @ts-ignore
    clearInterval(this.quizService.saveResults);
  }
}
