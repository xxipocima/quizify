import {Component, OnInit, HostBinding, HostListener} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import {ActivatedRoute, Router} from '@angular/router';
import { MatRadioChange } from '@angular/material/radio';
import {QuizService} from "../../shared/quiz.service";
import {UsersService} from "../../shared/users.service";
import {QuestionModal} from "../../shared/modal/question";
import {faArrowLeft} from "@fortawesome/free-solid-svg-icons";
import { Location } from '@angular/common'
import {QuizModal} from "../../shared/modal/quiz";
import {first, switchMap, take} from "rxjs";
import {AuthService} from "../../shared/auth/auth.service";
import {ResultService} from "../../shared/result.service";
import {map} from "rxjs/operators";
import {IconName as BootstrapIconName} from "ngx-bootstrap-icons/lib/types/icon-names.type";
import {CategoryService} from "../../shared/category.service";
import {ResultModal} from "../../shared/modal/result";

@Component({
  selector: 'app-quiz-by-tag',
  templateUrl: './quiz-by-tag.component.html',
  styleUrls: ['./quiz-by-tag.component.sass']
})
export class QuizByTagComponent implements OnInit {

  faArrowLeft = faArrowLeft;
  public quizzes: (QuizModal | null)[] = [];
  public quizzesIDs: string[] = [];
  public selectedAnswer: number = 0;
  public isLoading: Boolean = false;
  public resultID: string = "";
  public tagName: string = "";
  public categoryFound: boolean = true;
  public isQuizNotFound = false;
  public userAttempts: number = 0;
  public quizzesFound: boolean = true;

  constructor(
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
    if(!this.authService.getUserID()){
      this.router.navigate(['sign-in']);
      return;
    }
    const currentUser = JSON.parse(localStorage.getItem('user')!);
    this.userAttempts = this.authService.getAttempts(currentUser)
    if(this.userAttempts <= 0){
      this.router.navigate(['package']);
      return;
    }

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
        this.authService.UpdateUserTakedQuiz(res);
        this.resultID = res;
        }
      )

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

    this.quizService.getQuizzesQuestions(quizIDs).pipe(first()).subscribe(
      res => {

        let questions: QuestionModal[] = [];
        for (let i = 0; i < res.length; i++) {
          // @ts-ignore
          questions += res[i];
        }
        if(!questions)
        {
          this.isQuizNotFound=true;
          this.isLoading = false;
          return;
        }

        this.quizService.questionData = questions;
        this.startTimer();
        this.saveResultsAtTimer();
        this.isLoading = false;
      }
    );
  }
  saveResults(){
    this.isLoading = true;
    this.resultService.updateResult(this.quizService.resultID, {
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
        this.isLoading = false;
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

  selectAnswer(id: any, points: any){
    this.quizService.answers[this.quizService.qnProgress] = id;
    this.quizService.answersTime[this.quizService.qnProgress] = this.quizService.displayTimeElapsed();
    this.quizService.points[this.quizService.qnProgress] = points;
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
}
