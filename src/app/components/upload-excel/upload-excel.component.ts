import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-upload-excel',
  templateUrl: './upload-excel.component.html',
  styleUrls: ['./upload-excel.component.sass']
})
export class UploadExcelComponent implements OnInit {
  public isLoading: boolean = false;
  public form: FormGroup = new FormGroup({
    file: new FormControl()
  });

  constructor(
    public router: Router,
  ) {
  }

  ngOnInit(): void {
  }

  public submit(): void {
    console.log(this.form.get('file')?.value, 'file');
  }
}
