import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {CategoryService} from "../../shared/category.service";
import {Observable} from "rxjs";
import {map} from "rxjs/operators";
import {ActivatedRoute, Router} from "@angular/router";
import {AuthService} from "../../shared/auth/auth.service";
import {TranslateService} from "@ngx-translate/core";
import {TranslationsService} from "../../shared/translations.service";
import {ArticleModal} from "../../shared/modal/article";
import {ArticleService} from "../../shared/article.service";

@Component({
  selector: 'app-article-creator',
  templateUrl: './article-creator.component.html',
  styleUrls: ['./article-creator.component.sass']
})
export class ArticleCreatorComponent implements OnInit {

  // @ts-ignore
  articleForm: FormGroup;
  categories: Map<string, string> = new Map();
  isOpened: boolean = false;
  isLoading:boolean = true;
  isSubmitted:boolean = false;
  isEditArticleNotFound:boolean =false;

  articleId: string | undefined;

  editArticleId: string | undefined;

  constructor(
    private route: ActivatedRoute,
    public router: Router,
    private fb: FormBuilder,
    private authService: AuthService,
    private categoryService: CategoryService,
    private articleService: ArticleService,
    private translationsService: TranslationsService,
    private translateService: TranslateService,
  ) {
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.editArticleId = params['id'];
        this.isLoading = true;

        this.initForm();

        if (this.editArticleId) {
          this.articleService.getArticleData(this.editArticleId).subscribe((article) => {
            if(article) {
              this.fillFormWithArticleData(article);
            } else {
              this.isEditArticleNotFound = true;
            }
            this.isLoading = false;
          });
        } else {
          this.isLoading = false;
        }
    });
  }

  initForm(): void {
    this.articleForm = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      image: ['']
    });
  }

  fillFormWithArticleData(article: ArticleModal): void {
    this.articleForm.patchValue({
      title: this.translateService.instant(article.title),
      description: this.translateService.instant(article.description),
      image: this.translateService.instant(article.image),
    });
  }

  mapFormToArticleModal(): ArticleModal {
    return {
      id: "",
      userId: "",
      title: this.articleForm.get('title')?.value,
      description: this.articleForm.get('description')?.value,
      image: this.articleForm.get('image')?.value
    };
  }

  mapVariablesToArticleModal(id: any): ArticleModal {
    return {
      id: id,
      userId: "",
      title: id + '.title',
      description: id + '.description',
      image: "",
    };
  }

  submitArticle(): void {
    if (this.articleForm.valid) {
      this.isLoading = true;
      const articleData: ArticleModal =  this.mapFormToArticleModal();
      const langData: any = {};

      if(!this.editArticleId) {
        this.articleService.createArticle(articleData).then(responceAdd => {
          const articleVariablesData: ArticleModal = this.mapVariablesToArticleModal(responceAdd);
          if (responceAdd != null) {
            this.articleService.updateArticle(responceAdd, articleVariablesData).then(responceUpdate => {
                this.isLoading = false;
              }
            );
            // @ts-ignore
            langData[responceAdd] = quizData
            this.translationsService.updateTranslations(langData);
          }
          this.articleId = responceAdd;
          }
        )
      } else {
        const quizVariablesData: ArticleModal = this.mapVariablesToArticleModal(this.editArticleId);
        // @ts-ignore
        langData[this.editArticleId] = quizData
        this.translationsService.updateTranslations(langData);
        this.articleService.updateArticle(this.editArticleId, quizVariablesData).then(res => {
            this.isLoading = false;
            this.articleId = this.editArticleId;
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

}
