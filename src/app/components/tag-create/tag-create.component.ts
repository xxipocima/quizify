import {Component, OnDestroy, OnInit} from '@angular/core';
import {first, Subject} from "rxjs";
import {ActivatedRoute, Router} from "@angular/router";
import {takeUntil} from "rxjs/operators";
import {AuthService} from "../../shared/auth/auth.service";
import {CategoryService} from "../../shared/category.service";
import {CategoryModal} from "../../shared/modal/category";

@Component({
  selector: 'app-tag-create',
  templateUrl: './tag-create.component.html',
  styleUrls: ['./tag-create.component.sass']
})
export class TagCreateComponent implements OnInit, OnDestroy {
  constructor(
    private route: ActivatedRoute,
    public router: Router,
    private authService: AuthService,
    private categoryService: CategoryService
  ) { }

  isLoading: Boolean = false;

  categories: CategoryModal[] = [];

  public categoryIDs: string[] = [];
  public categoriesFound: boolean = true;
  public pageSize: number = 10;
  public currentPage: number = 1;
  private currentIndex: number = 0;
  private unsubscribe$ = new Subject<void>();

  ngOnInit() {
    this.isLoading = true;
    this.categoryService.getCategories().pipe(first()).subscribe((categoryModals: CategoryModal[]) => {
      for (const category of categoryModals) {
        this.categoryIDs = [...this.categoryIDs, category.id]
      }
      if (this.categoryIDs.length === 0) {
        console.log('categories',this.categoryIDs);
        this.categoriesFound = false;
      } else {
        this.loadMoreCategories();
      }
      this.isLoading = false;
    });
  }
  loadMoreCategories(): void {
    const categorySubset = this.categoryIDs.slice(this.currentIndex, this.currentIndex + this.pageSize);
    this.categoryService.getCategoriesByIDs(categorySubset).pipe(takeUntil(this.unsubscribe$))
      .subscribe((categories) => {
        console.log('categories',categories);
        for (const category of categories) {
          if(!category)
            return;
          this.categories = [...this.categories, category];
        }
      });

    this.currentIndex += this.pageSize;
  }
  editCategory(categoryId: string): void {
    this.router.navigate(["tag-create", categoryId]);
  }
  pageCategoriesChange(newPage: number): void {
    this.currentPage = newPage;
    this.loadMoreCategories();
  }
  get isAdmin() {
    return this.authService.isAdmin;
  }
  navigate(categoryId: string){
    this.router.navigate(["tag", categoryId])
  }
  get isPaid() {
    return this.authService.isPaid;
  }
  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
