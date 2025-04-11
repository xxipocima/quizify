import {Component, Input} from '@angular/core';
import {CarouselComponent} from "../carousel/carousel.component";
import { IconNamesEnum } from 'ngx-bootstrap-icons';

@Component({
  selector: 'app-carousel-blog',
  templateUrl: './carousel-blog.component.html',
  styleUrls: [ '../carousel/carousel.component.sass', './carousel-blog.component.sass']
})
export class CarouselBlogComponent extends CarouselComponent{

  @Input() override itemWidth = 560;
  @Input() override itemHeight = 530;
  @Input() iconSize = '30px';
  iconNames = IconNamesEnum;

  navigate(categoryId: string){
    this.router.navigate(["articles", categoryId])
  }

}
