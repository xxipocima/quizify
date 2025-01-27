import {Component, OnInit} from '@angular/core';
import {AbstractControl, FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {QuizModal} from "../../shared/modal/quiz";
import {CategoryService} from "../../shared/category.service";
import {QuizService} from "../../shared/quiz.service";
import {Observable, startWith, take} from "rxjs";
import {map} from "rxjs/operators";
import {CategoryModal} from "../../shared/modal/category";
import {QuestionModal} from "../../shared/modal/question";
import {ActivatedRoute, Router} from "@angular/router";
import {AuthService} from "../../shared/auth/auth.service";

interface Point {
  value: number;
  viewValue: number;
}
@Component({
  selector: 'app-quiz-creator',
  templateUrl: './quiz-creator.component.html',
  styleUrls: ['./quiz-creator.component.sass']
})
export class QuizCreatorComponent implements OnInit {

  // @ts-ignore
  quizForm: FormGroup;
  categories: Map<string, string> = new Map();
  points: Point[] = [
    {value: -5, viewValue: -5},
    {value: -4, viewValue: -4},
    {value: -3, viewValue: -3},
    {value: -2, viewValue: -2},
    {value: -1, viewValue: -1},
    {value: 0, viewValue: 0},
    {value: 1, viewValue: 1},
    {value: 2, viewValue: 2},
    {value: 3, viewValue: 3},
    {value: 4, viewValue: 4},
    {value: 5, viewValue: 5},
  ];
  filteredCategories: Observable<string[]> = new Observable<string[]>();
  lastValidCategory: string = '';
  isOpened: boolean = false;
  isLoading:boolean = true;
  isSubmitted:boolean = false;
  isEditQuizNotFound:boolean =false;

  quizId: string | undefined;

  editQuizId: string | undefined;

  constructor(private route: ActivatedRoute, public router: Router, private fb: FormBuilder, private authService: AuthService, private categoryService: CategoryService, private quizService: QuizService) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.editQuizId = params['id'];

      this.categoryService.getCategories().pipe(take(1)).subscribe((categoryModals: CategoryModal[]) => {

        this.isLoading = true;

        if (!categoryModals) return;
        categoryModals.forEach(categoryModal => this.categories.set(categoryModal.id, categoryModal.name));

        this.lastValidCategory = categoryModals[0].id;

        this.initForm();

        this.filteredCategories = this.quizForm.controls['categoryDisplay'].valueChanges
          .pipe(
            startWith(''),
            map(value => this._filter(value))
          );

        if (this.editQuizId) {
          this.quizService.getQuizData(this.editQuizId).subscribe((quiz) => {
            if(quiz) {

              if(quiz.authorId == this.authService.getUserID()) {
                this.fillFormWithQuizData(quiz);
              }
              else {
                this.isEditQuizNotFound = true;
              }

            }
            else{
              this.isEditQuizNotFound = true;
            }
            this.isLoading = false;
          });
        } else {
          this.isLoading = false;
        }
      });
    });
  }

  initForm(): void {
    this.quizForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      categoryId: [this.lastValidCategory, Validators.required],
      categoryDisplay: [this.categories.get(this.lastValidCategory)],
      questions: this.fb.array([
        this.initQuestion()
      ])
    });
  }

  fillFormWithQuizData(quiz: QuizModal): void {
    this.quizForm.patchValue({
      name: quiz.name,
      description: quiz.description,
      categoryId: quiz.categoryId,
      categoryDisplay: this.categories.get(quiz.categoryId),
    });

    this.quizForm.setControl('questions', this.fb.array(quiz.questions.map((q: QuestionModal) => this.initQuestionWithData(q))));
  }

  initQuestionWithData(question: QuestionModal): FormGroup {
    return this.fb.group({
      question: [question.question, Validators.required],
      options: this.fb.array(
        question.options.map(option => this.initQuestionOptionWithData(option)
        )
      ),
      answer: [question.answer, Validators.required]
    });
  }
  initQuestionOptionWithData(option: any): FormGroup {
    return this.fb.group({
      points: [option.points, Validators.required],
      option: [option.option, Validators.required]
    });
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();
    return Array.from(this.categories.values()).filter(category => category.toLowerCase().includes(filterValue));
  }

  updateLastValid(event: any, category: string) {
    if (event.isUserInput) {
      // @ts-ignore
      const categoryId = Array.from(this.categories.entries()).find(([key, value]) => value === category)[0];
      this.quizForm.controls['categoryId'].setValue(categoryId);
      this.lastValidCategory = categoryId;
    }
  }

  isCategoryExists(categoryId: string){
    return this.categories.has(categoryId);
  }

  checkCategory() {
    if (!this.isOpened && !this.isCategoryExists(this.quizForm.controls['categoryId'].value)) {
      this.quizForm.controls['categoryId'].setValue(this.lastValidCategory);
      this.quizForm.controls['categoryDisplay'].setValue(this.categories.get(this.lastValidCategory));
    }
  }

  getOptionsArray(control: AbstractControl<any>): FormArray{
     return control.get('options') as FormArray;
  }

  initQuestion(): FormGroup {
    return this.fb.group({
      question: ['', Validators.required],
      options: this.fb.array([
        this.initOption(),
        this.initOption(),
        this.initOption(),
        this.initOption()
      ], Validators.required),
      answer: [0, Validators.required]
    });
  }

  onOpen() {
    this.isOpened = true;
  }

  onClose() {
    this.isOpened = false;
  }

  initOption(): FormGroup {
    return this.fb.group({
      points: [0, Validators.required],
      option: ['', Validators.required]
    });
  }

  addQuestion(): void {
    const questionArray = this.quizForm.get('questions') as FormArray;
    if (questionArray.length < 20) {
      questionArray.push(this.initQuestion());
    }
  }

  removeQuestion(index: number): void {
    const questionArray = this.quizForm.get('questions') as FormArray;
    questionArray.removeAt(index);
  }

  addOption(questionIndex: number): void {
    const optionArray = ((this.quizForm.get('questions') as FormArray).at(questionIndex).get('options') as FormArray);
    if (optionArray.length < 8) {
      optionArray.push(this.initOption());
    }
  }

  removeOption(questionIndex: number, optionIndex: number): void {
    const optionArray = ((this.quizForm.get('questions') as FormArray).at(questionIndex).get('options') as FormArray);
    optionArray.removeAt(optionIndex);
  }


  mapQuestionsArrayToQuestionModalArray(questionsArray: FormArray): QuestionModal[] {
    const questionModalArray: QuestionModal[] = [];

    questionsArray.controls.forEach((questionControl) => {
      const questionModal: { question: any; options: any; answer: any } = {
        question: questionControl.get('question')?.value,
        options: questionControl.get('options')?.value,
        answer: questionControl.get('answer')?.value
      };

      questionModalArray.push(<QuestionModal>questionModal);
    });

    return questionModalArray;
  }

  mapFormToQuizModal(): QuizModal {
    return {
      name: this.quizForm.get('name')?.value,
      description: this.quizForm.get('description')?.value,
      questions: this.mapQuestionsArrayToQuestionModalArray(this.quizForm.get('questions') as FormArray),
      categoryId: this.quizForm.get('categoryId')?.value,
      authorId: ''
    };
  }

  submitQuiz(): void {
    if (this.quizForm.valid) {
      this.isLoading = true;
      const quizData: QuizModal =  this.mapFormToQuizModal();

      if(!this.editQuizId) {
        this.quizService.createQuiz(quizData).then(res => {
            console.log(res)
            this.isLoading = false;
            this.quizId = res;
          }
        )
      } else {
        this.quizService.updateQuiz(this.editQuizId, quizData).then(res => {
            console.log(res)
            this.isLoading = false;
            this.quizId = this.editQuizId;
          }
        )
      }
    }
  }
  get isAdmin() {
    return this.authService.isAdmin;
  }
  get isPaid() {
    return this.authService.isPaid;
  }
  get questions() {
    return this.quizForm.get('questions') as FormArray;
  }

}
