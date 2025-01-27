import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { QuizByTagComponent } from './quiz-by-tag.component';

describe('QuizBYTagComponent', () => {
  let component: QuizByTagComponent;
  let fixture: ComponentFixture<QuizByTagComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ QuizByTagComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QuizByTagComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
