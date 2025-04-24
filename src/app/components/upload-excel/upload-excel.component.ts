import { Component } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { question } from 'ngx-bootstrap-icons';
import { LANGUAGE_LIST } from 'src/app/consts/languag-list.const';
import { QuizModal } from 'src/app/shared/modal/quiz';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-upload-excel',
  templateUrl: './upload-excel.component.html',
  styleUrls: ['./upload-excel.component.sass']
})
export class UploadExcelComponent {
  constructor(
    private readonly fireStore: AngularFirestore
  ) {}
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

  private async processFile(file: File): Promise<void> {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e: any) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });

        workbook.SheetNames.forEach(async sheetName => {
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { raw: false });
          // console.log(`Sheet: ${sheetName}`, jsonData);
          if (sheetName === 'Tableau de Correspondance') {
            // await this.processCategory(jsonData);
            await this.processQuiz(jsonData);
            // await this.newQuiz();
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

  private async processCategory(data: any[]): Promise<void> {
    // Tableau de Correspondance
    const categoriesNameMap = new Map<string, string[]>();
    const categoriesDescMap = new Map<string, string[]>();
    const ids = [
      'p4c43XL7KdxaOvlhjZTq', // quiz D69j70lgEYUBwSFnRETf
      'Wv5c8xpxKVGaqVvR76ve', // quiz tqBADLnOsfS1fh32Ed09
      '4YlyBLPE4iLMJ3fdEu8w', // quiz 9yDISLs4znuWKarh4OWO
      'Tqy63Wnjrrg06WRPSpUa', // quiz oR6CdMEbaHwqhPnhZw3B
      'Vn3xPPgN8VuemL8n0DDz', // quiz 4Xr0FlqjfTAZNhpDcyyH
      'rAqMkcqUNcrKh4b2HBUE', // quiz aOGD8esJ4T8XdTxQhRdF
      'fKYTC1brKR0JnjnOl5cN', // quiz r3DNBFdtlpFrKv6fBuai
      'f6HLA2nhLR2c8zq3Y8ZW', // quiz wyD1CMGNl4qEgxcIKiGk
      'zvMO8CZWWGAVE4Ev6OTs', // quiz KVNnCDnyRpLrSOOldN8d
    ]

    data.forEach(row => {
      // categories
      if (Array.from({length: 9}, (_, i) => `Categorie_${i}`).includes(row.Ref_Langue)) {
        for (const [key, value] of Object.entries(row)) {
          const lang = LANGUAGE_LIST.find(lang => lang.name === key);
          if (lang && value != 0) {
            const arr = categoriesNameMap.has(lang.name) ? categoriesNameMap.get(lang.name) : [];
            arr!.push(value as string);
            categoriesNameMap.set(lang.name, arr!)
          }
        }
      }

      if (Array.from({length: 9}, (_, i) => `Description_Categorie_${i}`).includes(row.Ref_Langue)) {
        for (const [key, value] of Object.entries(row)) {
          const lang = LANGUAGE_LIST.find(lang => lang.name === key);
          if (lang && value != 0) {
            const arr = categoriesDescMap.has(lang.name) ? categoriesDescMap.get(lang.name) : [];
            arr!.push(value as string);
            categoriesDescMap.set(lang.name, arr!)
          }
        }
      }
    })

    LANGUAGE_LIST.forEach(async lang => {
      if (lang.code) {
        const names = categoriesNameMap.get(lang.name)!;
        const desc = categoriesDescMap.get(lang.name)!;

        if (names && desc) {
          for (let i = 0; i <= 8; i++) {
            const category = {
              name: names[i],
              description: desc[i],
            }
            /*
            await this.fireStore.collection('translations').doc(lang.code).set({[ids[i]]: category}, { merge: true }).then(() => {
              return true;
            }).catch((error) => {
              console.log(error)
              return error;
            })
            */
          }
        }
      }
    })
  }

  private async newQuiz(): Promise<void> {
    const quizId = 'KVNnCDnyRpLrSOOldN8d';
    // const categoryId = 'p4c43XL7KdxaOvlhjZTq';
    const quiz: any = {
      name: `${quizId}.name`, // Les20Questions
      description: `${quizId}.description`,
      recommendations: `${quizId}.recommendations`,
      questions: [],
      //categoryId: categoryId,
      //authorId: ``
    }
    const answers = [4, 4, 3, 3, 2, 2, 3, 4, 2, 3, 1, 3, 5, 3, 4, 5, 4, 5, 4, 5];
    quiz.questions = Array.from({length: 20}, (_, i) => ({
      question: `${quizId}.questions.${i}.question`,
      options: Array.from({length: 5}, (_, j) => ({
        points: j + 1,
        option: `${quizId}.questions.${i}.options.${j}.option`
      })),
      answer: answers[i],
    }));

    await this.fireStore.collection('quizzes').doc(quizId).set(quiz, { merge: true }).then(() => {
      return true;
    }).catch((error) => {
      console.log(error)
      return error;
    })
  }

  private async processQuiz(data: any[]): Promise<void> {
    // Tableau de Correspondance
    const quizId = 'KVNnCDnyRpLrSOOldN8d';
    const quiz: any = {
      name: `Les20Questions`,
      description: ``,
      recommendations: ``,
      questions: [],
      // categoryId: categoryId,
      // authorId: ``
    }
    const answers = [4, 4, 3, 3, 2, 2, 3, 4, 2, 3, 1, 3, 5, 3, 4, 5, 4, 5, 4, 5];
    quiz.questions = Array.from({length: 20}, (_, i) => ({
      question: `${quizId}.questions.${i}.question`,
      options: Array.from({length: 5}, (_, j) => ({
        points: j + 1,
        option: `${quizId}.questions.${i}.options.${j}.option`
      })),
      answer: answers[i],
    }));

    const quizMap = new Map<string, QuizModal>();
    const optionsMap = new Map<string, string[]>();
    const questionsMap = new Map<string, string[]>();

    LANGUAGE_LIST.forEach(lang => {
      if (lang.code) {
        quizMap.set(lang.code, quiz);
      }
    })

    data.forEach(row => {
      // options
      if (Array.from({length: 5}, (_, i) => `Réponses_${i + 1}`).includes(row.Ref_Langue)) {
        for (const [key, value] of Object.entries(row)) {
          const lang = LANGUAGE_LIST.find(lang => lang.name === key);
          if (lang) {
            const arr = optionsMap.has(lang.name) ? optionsMap.get(lang.name) : [];
            arr!.push((value as string).trim());
            optionsMap.set(lang.name, arr!)
          }
        }
      }

      // questions
      if (Array.from({length: 20}, (_, i) => `Ref_tdc_${i + 162}`).includes(row.Ref_TableaudeCorrespondance)) {
        for (const [key, value] of Object.entries(row)) {
          const lang = LANGUAGE_LIST.find(lang => lang.name === key);
          if (lang) {
            const arr = questionsMap.has(lang.name) ? questionsMap.get(lang.name) : [];
            arr!.push((value as string).trim());
            questionsMap.set(lang.name, arr!)
          }
        }
      }
    })

    LANGUAGE_LIST.forEach(lang => {
      if (!lang.code) return;
    
      const options = optionsMap.get(lang.name);
      const questions = questionsMap.get(lang.name);
      const quiz = quizMap.get(lang.code);
    
      const hasAllData = options && questions && quiz;
      if (!hasAllData) {
        console.warn(`Skipping ${lang.name}: missing data`);
        quizMap.delete(lang.code);
        return;
      }
    
      const isValidData = options.length === 5 && questions.length === 20;
      if (!isValidData) {
        console.warn(`Skipping ${lang.name}: invalid data format`);
        quizMap.delete(lang.code);
        return;
      }
    
      const updatedQuiz = {
        ...quiz,
        questions: quiz.questions.map((question, index1) => ({
          ...question,
          question: questions[index1] || `Question ${index1 + 1}`,
          options: question.options.map((option, index2) => ({
            ...option,
            option: options[index2] || `Option ${index2 + 1}`
          }))
        }))
      };
    
      quizMap.set(lang.code, updatedQuiz);
    });

    for (let [key, value] of quizMap) {
      // console.log(key, value);

      await this.fireStore.collection('translations').doc(key).set({[quizId]: value}, { merge: true }).then(() => {
        return true;
      }).catch((error) => {
        console.log(error)
        return error;
      })
    }
  }
}
