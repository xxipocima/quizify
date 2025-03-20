import { Component } from '@angular/core';
import {library} from '@fortawesome/fontawesome-svg-core';
import * as IconsSolid from '@fortawesome/free-solid-svg-icons';
import * as IconsRegular from '@fortawesome/free-regular-svg-icons';
import {TranslateService} from "@ngx-translate/core";

// @ts-ignore
const iconListSolid = Object.keys(IconsSolid).filter((key) => key !== 'fas' && key !== 'prefix').map((icon) => IconsSolid[icon]);
// @ts-ignore
const iconListRegular  = Object.keys(IconsRegular).filter((key) => key !== 'far' && key !== 'prefix').map((icon) => IconsRegular[icon]);
library.add(...iconListSolid, ...iconListRegular);
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.sass']
})
export class AppComponent {
  constructor(
    private translate: TranslateService
  ) {
  }

  async ngOnInit() {
    const storedLang = localStorage.getItem('language');
    if (storedLang) {
      this.translate.use(storedLang);
    } else {
      const browserLang = this.translate.getBrowserLang();
      const defaultLang = browserLang?.match(/en|es/) ? browserLang : 'en';
      this.translate.use(defaultLang);
      localStorage.setItem('language', defaultLang);
    }

  }
  title = 'Mindcodia';
}
