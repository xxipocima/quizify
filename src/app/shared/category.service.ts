import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import {AngularFirestore} from "@angular/fire/compat/firestore";

import {concatMap, map, toArray} from "rxjs/operators";
import {CategoryModal} from "./modal/category";

import {from, of} from "rxjs";
import {AuthService} from "./auth/auth.service";


@Injectable({
  providedIn: 'root'
})

export class CategoryService {

  categories: CategoryModal[] = [];

  constructor(
    private http: HttpClient,
    private fireStore: AngularFirestore,
    private authService: AuthService,
    public router: Router
  ) {}

  createCategory(data: CategoryModal): Promise<string | void> {
    return this.fireStore.collection('categories').add(data).then(response => {
      console.log(`Category with ID: ${response.id} created successfully.`);
      return response.id;
    }, error => {
      console.error('Error while creating tag: ', error);
    })
  }

  updateCategory(tagId: string, data: CategoryModal): Promise<void> {
    return this.fireStore.collection('categories').doc(tagId).update(data).then(() => {
      console.log(`Tag with ID: ${tagId} updated successfully.`);
    }, error => {
      console.error('Error while updating quiz: ', error);
    });
  }

  getCategory(id: string){
    return this.getCategories().pipe(
      map(categories => categories.find(category => category.id === id))
    );
  }
  getCategories(){
    if (this.categories.length>0) {
      return of(this.categories);
    } else {
      return this.fireStore.collection('categories').get().pipe(
        map(res => {
          this.categories = res.docs.map(doc => doc.data()) as CategoryModal[];
          return this.categories;
        })
      );
    }
  }
  getCategoriesByIDs(ids: string[]){
    if(ids == undefined) null;
    return from(ids).pipe(
      concatMap(categoryID => this.getCategory(categoryID)),
      toArray()
    );
  }
}
