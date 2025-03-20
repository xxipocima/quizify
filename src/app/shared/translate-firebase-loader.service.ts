import {Router} from "@angular/router";
import {AngularFirestore} from "@angular/fire/compat/firestore";
import {TranslateLoader} from "@ngx-translate/core";
import {Observable} from "rxjs";
import {map} from "rxjs/operators";

export class TranslateFirebaseLoader implements TranslateLoader  {
  constructor(
    private fireStore: AngularFirestore,
    public router: Router
  ) {}

  getTranslation(lang: string, prefix: string = 'translations'): Observable<any> {
    const translations = this.fireStore.doc(`${prefix}/${lang}`).valueChanges().pipe(map(response => {
      return response;
    }));

    return translations as Observable<any>;
  }
}
