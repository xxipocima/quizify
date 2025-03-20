import {Component, OnInit} from '@angular/core';
import {findIconDefinition, IconName} from "@fortawesome/fontawesome-svg-core";
import {CarouselItem} from "../../shared/utils/carousel-item.interface";

import {IconName as BootstrapIconName, IconNamesEnum} from 'ngx-bootstrap-icons';
import {PromoQuizModal} from "../../shared/modal/promoQuiz";
import {first, Subject, switchMap, take} from "rxjs";
import {CategoryModal} from "../../shared/modal/category";
import {ActivatedRoute, Router} from "@angular/router";
import {FormBuilder} from "@angular/forms";
import {CategoryService} from "../../shared/category.service";
import {QuizService} from "../../shared/quiz.service";
import {AuthService} from "../../shared/auth/auth.service";
import {map, takeUntil} from "rxjs/operators";
import {ArticleModal} from "../../shared/modal/article";
import {ArticleService} from "../../shared/article.service";

@Component({
  selector: 'app-articles',
  templateUrl: './articles.component.html',
  styleUrls: ['./articles.component.sass']
})
export class ArticlesComponent implements OnInit{
  public articles: (ArticleModal | undefined | null)[] = [];
  public article: ArticleModal | null = null;
  public articlesIDs: string[] = [];
  public articlesFound: boolean = true;
  public pageSize: number = 10;
  public currentPage: number = 1;
  private currentIndex: number = 0;
  private unsubscribe$ = new Subject<void>();
  constructor(
    private authService: AuthService,
    public router: Router,
    private route: ActivatedRoute,
    private articleService: ArticleService
  ) { }


  isLoading: Boolean = false;
  isSngleArticle: Boolean = false;
  isListArticles: Boolean = false;

  ngOnInit() {
    this.isLoading = true;
    this.route.params.pipe(
      map(params => params['id']),
      switchMap(id => this.articleService.getArticleData(id))
    ).pipe(first()).subscribe(result => {
      if(result){
        this.isSngleArticle = true;
        this.isListArticles = false;
        this.article = result;
      }
    });
    if(!this.isSngleArticle) {
      this.isListArticles = true;
      this.isSngleArticle = false;
      this.getArticles();
    }

    this.isLoading = false;
  }
  getArticles() {
    this.articleService.getArticles().pipe(take(1)).subscribe((articleModals: ArticleModal[]) => {
      for (const article of articleModals) {
        this.articlesIDs.push(article.id);
      }
      if (this.articlesIDs.length === 0) {
        this.articlesFound = false;
      } else {
        this.loadMoreArticles();
      }
    });
  }

  loadMoreArticles(): void {
    const articleSubset = this.articlesIDs.slice(this.currentIndex, this.currentIndex + this.pageSize);
    this.articleService.getArticlesByIDs(articleSubset)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(articles => {
        if(!articles)
          return;
        this.articles = [...this.articles, ...articles];
        this.currentIndex += this.pageSize;
      });
  }
  pageArticlesChange(newPage: number): void {
    this.currentPage = newPage;
    this.loadMoreArticles();
  }
  navigate(articleId: string){
    this.router.navigate(["articles", articleId])
  }
  get isAdmin() {
    return this.authService.isAdmin;
  }
  get isPaid() {
    return this.authService.isPaid;
  }
}
