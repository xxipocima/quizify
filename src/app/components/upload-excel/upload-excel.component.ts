import { Component } from '@angular/core';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-upload-excel',
  templateUrl: './upload-excel.component.html',
  styleUrls: ['./upload-excel.component.sass']
})
export class UploadExcelComponent {
  public isLoading: boolean = false;
  public file: File | null = null;

  public submit(): void {
    if (this.file) {
      this.processFile(this.file);
    } else {
      console.error('No file exists');
    }
  }

  public onFileChange(event: any): void {
    this.file = event.target.files[0];
  }

  private processFile(file: File): void {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e: any) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });

        workbook.SheetNames.forEach(sheetName => {
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { raw: false });
          // console.log(`Sheet: ${sheetName}`, jsonData);
          if (sheetName === 'Les20Questions') {
            this.processData(jsonData);
          }
        });

      } catch (error) {
        console.error('File read error:', error);
      }
    };
    reader.onerror = (error) => {
      console.error('File read error:', error);
    };
    reader.readAsArrayBuffer(file);
  }

  private processData(data: any[]) {
    console.log(data, 'questions');
  }
}
