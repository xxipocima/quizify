import {Component, OnInit} from '@angular/core';
import {findIconDefinition, IconName} from "@fortawesome/fontawesome-svg-core";
import {CarouselItem} from "../../shared/utils/carousel-item.interface";

import {IconName as BootstrapIconName, IconNamesEnum} from 'ngx-bootstrap-icons';
import {PromoQuizModal} from "../../shared/modal/promoQuiz";
import {Subject, take} from "rxjs";
import {CategoryModal} from "../../shared/modal/category";
import {ActivatedRoute, Router} from "@angular/router";
import {FormBuilder} from "@angular/forms";
import {CategoryService} from "../../shared/category.service";
import {QuizService} from "../../shared/quiz.service";
import {AuthService} from "../../shared/auth/auth.service";
import {takeUntil} from "rxjs/operators";

@Component({
  selector: 'app-services',
  templateUrl: './services.component.html',
  styleUrls: ['./services.component.sass']
})
export class ServicesComponent implements OnInit{
  public categories: (CategoryModal | undefined)[] = [];
  public categoriesIDs: string[] = [];
  public categoriesFound: boolean = true;
  public pageSize: number = 10;
  public currentPage: number = 1;
  private currentIndex: number = 0;
  private unsubscribe$ = new Subject<void>();
  constructor(
    private authService: AuthService,
    public router: Router,
    private route: ActivatedRoute,
    private categoryService: CategoryService
  ) { }


  isLoading: Boolean = false;
  isServices: Boolean = false;
  isFreeTest: Boolean = false;

  ngOnInit() {
    this.isLoading = true;

    this.route.data.subscribe(data => {
      if (data['name'] === 'services'){
        this.isServices = true;
        this.getCategories();
      } else {
        this.isFreeTest = true;
      }
    });

    this.isLoading = false;
  }
  getCategories() {
    this.categoryService.getCategories().pipe(take(1)).subscribe((categoryModals: CategoryModal[]) => {
      for (const category of categoryModals) {
        this.categoriesIDs.push(category.id);
      }
      if (this.categoriesIDs.length === 0) {
        this.categoriesFound = false;
      } else {
        this.loadMoreCategories();
      }
    });
  }

  loadMoreCategories(): void {
    const categorySubset = this.categoriesIDs.slice(this.currentIndex, this.currentIndex + this.pageSize);
    this.categoryService.getCategoriesByIDs(categorySubset)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(categories => {
        if(!categories)
          return;
        this.categories = [...this.categories, ...categories];
        console.log('cat', this.categories)
        this.currentIndex += this.pageSize;
      });
  }
  pageCategoriesChange(newPage: number): void {
    this.currentPage = newPage;
    this.loadMoreCategories();
  }
  navigate(categoryId: string){
    this.router.navigate(["tag", categoryId])
  }
  editCategory(categoryId: string){
    this.router.navigate(["edit-category", categoryId])
  }
  deleteCategory(categoryId: string){
    this.router.navigate(["edit-category", categoryId])
  }
  get isAdmin() {
    return this.authService.isAdmin;
  }
  get isPaid() {
    return this.authService.isPaid;
  }
}
