import {Router} from '@angular/router';
import {Injectable} from '@angular/core';
import {AngularFirestore} from '@angular/fire/compat/firestore';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from './auth/auth.service';

@Injectable({
  providedIn: 'root'
})

export class TranslationsService {
  constructor(
    private readonly fireStore: AngularFirestore,
    private readonly translateService: TranslateService,
    private readonly authService: AuthService,
    public router: Router
  ) {}

  async updateTranslations(data: any) : Promise<boolean> {
    let lang: string = this.authService.getCurrentLang();
    return this.fireStore.collection('translations').doc(lang).set(data, { merge: true }).then(() => {
      return true;
    }).catch((error) => {
      console.log(error)
      return error;
    })
  }
}
