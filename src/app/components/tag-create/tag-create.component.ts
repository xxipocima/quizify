import {Component, OnDestroy, OnInit} from '@angular/core';
import {first, Observable, Subject, switchMap, take} from "rxjs";
import {ActivatedRoute, Router} from "@angular/router";
import {map, takeUntil} from "rxjs/operators";
import {UserModal} from "../../shared/modal/user";
import {ClipboardService} from "../../shared/clipboard.service";
import {UsersService} from "../../shared/users.service";
import {AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {ResultModal} from "../../shared/modal/result";
import {QuizModal} from "../../shared/modal/quiz";
import {QuestionModal} from "../../shared/modal/question";

@Component({
  selector: 'app-user-edit',
  templateUrl: './user-edit.component.html',
  styleUrls: ['./user-edit.component.sass']
})
export class UserEditComponent implements OnInit, OnDestroy {

  // @ts-ignore
  editForm: FormGroup;
  public user: UserModal | undefined = undefined;
  public userId: string | undefined;
  private unsubscribe$ = new Subject<void>();
  public userFound: boolean = true;
  isLoading:boolean = true;
  constructor(
    private route: ActivatedRoute,
    public router: Router,
    private userService: UsersService,
    private clipboardService: ClipboardService,
    private fb: FormBuilder
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.route.params.pipe(
      map(params => params['id']),
      switchMap(username => this.userService.getUserID(username))
    ).pipe(first()).subscribe(userID => {
      this.userId = userID;
      this.userService.getUserData(userID).pipe(first()).subscribe(user => {
        if (!user) {
          this.userFound = false;
          return;
        }
        this.user = user as UserModal;
        this.fillFormWithData(this.user);
        this.isLoading = false;
    })})
  }
  editUser(userName: string): void {
    this.router.navigate(["user", userName]);
  }

  getLimitedText(text: string, limit: number): string {
    if(!text)
      return "";

    if (text.length > limit) {
      return text.substring(0, limit) + '...';
    } else {
      return text;
    }
  }
  initForm(): void {
    this.editForm = this.fb.group({
      name: ["", Validators.required],
      attempts: [""],
      isAdmin: [""],
      isPaid: [""],
    });
  }

  fillFormWithData(user: UserModal): void {
    this.editForm.patchValue({
      name: user.username,
      attempts: user.attempts,
      isAdmin: user.isAdmin,
      isPaid: user.isPaid,
    });
  }
  mapFormToModal(){
    return {
      username: this.editForm.get('name')?.value,
      attempts: this.editForm.get('attempts')?.value,
      isAdmin: this.editForm.get('isAdmin')?.value,
      isPaid: this.editForm.get('isPaid')?.value,
    };
  }
  submit(): void {
    if (this.editForm.valid) {
      this.isLoading = true;
      const data =  this.mapFormToModal();
      console.log('data',data)
      this.userService.updateUser(this.userId, data).then(res => {
          console.log(res)
          this.isLoading = false;
        }
      )
    }
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
