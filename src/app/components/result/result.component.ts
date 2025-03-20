import { Component, OnInit } from '@angular/core';

import {ActivatedRoute, Router} from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import {QuizService} from "../../shared/quiz.service";
import {map} from "rxjs/operators";
import {first, switchMap} from "rxjs";
import {IconName as BootstrapIconName} from "ngx-bootstrap-icons/lib/types/icon-names.type";
import {ResultService} from "../../shared/result.service";

@Component({
  selector: 'app-result',
  templateUrl: './result.component.html',
  styleUrls: ['./result.component.sass']
})
export class ResultComponent implements OnInit {


  public userDetails: any;
  public isSubmitted: boolean = false;
  public resultAnswes: any;
  public resultId: string | undefined;

  constructor(
    public quizService: QuizService,
    private _snackBar: MatSnackBar,
    private route: ActivatedRoute,
    private resultService: ResultService,
    public router: Router
  ) { }

  ngOnInit(): void {
    this.route.params.pipe(
      map(params => this.resultId = params['id']),
      switchMap(id => this.resultService.getResultData(id))
    ).pipe(first()).subscribe(result => {
      if(result){
        this.quizService.questionData = result.questionData;
        this.quizService.answers = result.answers;
        this.quizService.points = result.points;
        this.quizService.answersTime = result.answersTime;
        this.quizService.seconds = result.seconds;
        this.quizService.qnProgress = result.qnProgress;
        this.quizService.correctAnsCount = result.correctAnsCount;
        // @ts-ignore
        this.quizService.resultID = result.resultID;
        this.quizService.tagId = result.categoryName;
        this.quizService.recommendations = result.recommendations;
      }
      console.log(this.quizService.questionData)
      if(this.quizService.questionData.length === 0)
        this.router.navigate([""]);
      this.quizService.correctAnsCount = 0;
      this.resultAnswes = this.quizService.answers.map(value => JSON.parse(value))
      this.getAnswers();
    });
  }

  getAnswers() {
    if (this.quizService.questionData) {
      this.quizService.questionData.filter((question, i)=> {

        // if (question.answer === this.quizService.answers[i]) {
          this.quizService.correctAnsCount++;
        // }
      })
    }
  }


  filteredResult() {
    if (this.quizService.questionData.length) {
      const userId = this.userDetails.id;
      const questionData = this.quizService.questionData;
      const timeTaken = this.quizService.displayTimeElapsed();
      const score = this.quizService.correctAnsCount * 100;
      if (userId && questionData.length && timeTaken && score >= 0) {
        const finalData = {
          time: timeTaken,
          questionData: questionData,
          score: score + '/' + (this.quizService.questionData.length * 100)
        }
        return { userId, finalData }
      }
      else {
        return null;
      }
    }
    return null;
  }

  submit() {
    this.isSubmitted = true;
    const filteredData = this.filteredResult();
    if (!filteredData) {
      this.isSubmitted = false;
      return null;
    }
    return null;
  }

  retry() {
    this.router.navigate(["quiz", this.quizService.quizId]);
  }

}
