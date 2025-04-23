import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {TranslateModule, TranslateService} from '@ngx-translate/core';
import {ActivatedRoute, Router} from '@angular/router';
import { Language, LanguageCode } from 'src/app/models/models';
import { LANGUAGE_LIST } from 'src/app/consts/languag-list.const';

@Component({
  selector: 'app-language-switcher',
  standalone: true,
  templateUrl: './language-switcher.component.html',
  styleUrls: ['./language-switcher.component.scss'],
  imports: [CommonModule, TranslateModule],
})
export class LanguageSwitcherComponent {
  public languages: Language[] = LANGUAGE_LIST;
  public currentLanguage = this.translate.currentLang || 'en';

  constructor(
    private readonly translate: TranslateService,
    private readonly activatedRoute: ActivatedRoute,
    public router: Router
  ) {
    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage) {
      this.currentLanguage = savedLanguage;
    }
  }

  switchLanguage(languageCode: LanguageCode): void {
    this.currentLanguage = languageCode;
    this.translate.use(languageCode);
    localStorage.setItem('language', languageCode);

    this.activatedRoute.data.subscribe(data => {
      console.log(data)
      if (data['reload']){
        window.location.reload();
      }
    });
  }

  getFlag(languageCode: string): string {
    const language = this.languages.find((lang) => lang.code === languageCode);
    return language ? language.flag : '';
  }
}
