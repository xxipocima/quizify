import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {TranslateModule, TranslateService} from "@ngx-translate/core";
import {ActivatedRoute, Router} from "@angular/router";
import {startWith, take} from "rxjs";
import {CategoryModal} from "../../shared/modal/category";
import {map} from "rxjs/operators";

@Component({
  selector: 'app-language-switcher',
  standalone: true,
  templateUrl: './language-switcher.component.html',
  styleUrls: ['./language-switcher.component.scss'],
  imports: [CommonModule, TranslateModule],
})
export class LanguageSwitcherComponent {
  languages = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'fr', name: 'France', flag: '🇫🇷' },
  ];

  currentLanguage = 'en';

  constructor(
    private translate: TranslateService,
    private route: ActivatedRoute,
    public router: Router
  ) {
    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage) {
      this.currentLanguage = savedLanguage;
    }
  }

  switchLanguage(languageCode: string): void {
    this.currentLanguage = languageCode;
    this.translate.use(languageCode);
    localStorage.setItem('language', languageCode);

    this.route.data.subscribe(data => {
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
