import {Router} from '@angular/router';
import {Injectable} from '@angular/core';
import {AngularFirestore} from '@angular/fire/compat/firestore';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})

export class TranslationsService {
  constructor(
    private readonly fireStore: AngularFirestore,
    private readonly translateService: TranslateService,
    public router: Router
  ) {}

  async updateTranslations(data: any) : Promise<boolean> {
    let lang: string = this.translateService.currentLang;
    return this.fireStore.collection('translations').doc(lang).update(data).then(() =>{
      return true;
    }).catch(function (error) {
      console.log(error)
      return error;
    })
  }
}
