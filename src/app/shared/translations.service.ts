import {AuthService} from "./auth/auth.service";
import {Router} from "@angular/router";
import {MatSnackBar} from "@angular/material/snack-bar";
import {Injectable} from "@angular/core";
import {concatMap, map, toArray} from "rxjs/operators";
import {from, of} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {AngularFirestore} from "@angular/fire/compat/firestore";
import {ResultModal} from "./modal/result";
import {CategoryModal} from "./modal/category";

@Injectable({
  providedIn: 'root'
})

export class TranslationsService {

  constructor(
    private snackBar: MatSnackBar,
    private http: HttpClient,
    private authService: AuthService,
    private fireStore: AngularFirestore,
    public router: Router
  ) {}

  async updateTranslations(data: any) : Promise<boolean> {
    let lang: string = this.authService.getCurrentLang();
    return this.fireStore.collection('translations').doc(lang).update(data).then(() =>{
      return true;
    }).catch(function (error) {
      console.log(error)
      return error;
    })

  }
}
