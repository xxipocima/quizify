import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Observable} from "rxjs";
import {map} from "rxjs/operators";
import {ActivatedRoute, Router} from "@angular/router";
import {AuthService} from "../../shared/auth/auth.service";
import {TranslateService} from "@ngx-translate/core";
import {TranslationsService} from "../../shared/translations.service";
import {CategoryModal} from "../../shared/modal/category";
import {CategoryService} from "../../shared/category.service";

@Component({
  selector: 'app-category-creator',
  templateUrl: './category-creator.component.html',
  styleUrls: ['./category-creator.component.sass']
})
export class CategoryCreatorComponent implements OnInit {

  // @ts-ignore
  categoryForm: FormGroup;
  categories: Map<string, string> = new Map();
  isOpened: boolean = false;
  isLoading:boolean = true;
  isSubmitted:boolean = false;
  isEditCategoryNotFound:boolean =false;

  categoryId: string | undefined;

  editCategoryId: string | undefined;

  constructor(
    private route: ActivatedRoute,
    public router: Router,
    private fb: FormBuilder,
    private authService: AuthService,
    private categoryService: CategoryService,
    private translationsService: TranslationsService,
    private translateService: TranslateService,
  ) {
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.editCategoryId = params['id'];
        this.isLoading = true;

        this.initForm();

        if (this.editCategoryId) {
          this.categoryService.getCategory(this.editCategoryId).subscribe((category) => {
            if(category) {
              this.fillFormWithCategoryData(category);
            } else {
              this.isEditCategoryNotFound = true;
            }
            this.isLoading = false;
          });
        } else {
          this.isLoading = false;
        }
    });
  }

  initForm(): void {
    this.categoryForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      icon: ['']
    });
  }

  fillFormWithCategoryData(category: CategoryModal): void {
    this.categoryForm.patchValue({
      name: this.translateService.instant(category.name),
      description: this.translateService.instant(category.description),
      icon: this.translateService.instant(category.icon),
    });
  }

  mapFormToCategoryModal(): CategoryModal {
    return {
      id: "",
      quizzes: [],
      name: this.categoryForm.get('name')?.value,
      description: this.categoryForm.get('description')?.value,
      icon: this.categoryForm.get('image')?.value ?? null,
    };
  }

  mapVariablesToCategoryModal(id: any): CategoryModal {
    return {
      id: id,
      quizzes: [],
      name: id + '.name',
      description: id + '.description',
      icon: "",
    };
  }

  submitCategory(): void {
    if (this.categoryForm.valid) {
      this.isLoading = true;
      const categoryData: CategoryModal = this.mapFormToCategoryModal();
      const langData: any = {};

      if(!this.editCategoryId) {
        this.categoryService.createCategory(categoryData).then(responceAdd => {
          const categoryVariablesData: CategoryModal = this.mapVariablesToCategoryModal(responceAdd);
          if (responceAdd != null) {
            this.categoryService.updateCategory(responceAdd, categoryVariablesData).then(responseUpdate => {
                this.isLoading = false;
              }
            );
            langData[responceAdd] = categoryData;
            this.translationsService.updateTranslations(langData);
            this.categoryId = responceAdd;
          }
          }
        )
      } else {
        const quizVariablesData: CategoryModal = this.mapVariablesToCategoryModal(this.editCategoryId);
        langData[this.editCategoryId] = quizVariablesData;
        this.translationsService.updateTranslations(langData);
        this.categoryService.updateCategory(this.editCategoryId, quizVariablesData).then(res => {
            this.isLoading = false;
            this.categoryId = this.editCategoryId;
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
