/*export class QuestionModal {
  constructor(
    public answer: number,
    public options: string[],
    public question: string,
  ){}
}*/


export interface QuestionModal {
  answer: number;
  options: any[];
  question: string;
  points: number;
}
