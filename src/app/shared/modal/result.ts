/*import {QuestionModal} from "./question";
import {CategoryModal} from "./category";

export class QuizModal {
  constructor(
    public questions: QuestionModal[],
    public category: CategoryModal,
    public authorId: string
  ){}

}*/


import {QuestionModal} from "./question";
import {CategoryModal} from "./category";

export interface ResultModal {

  questionData: QuestionModal[];
  answers: number[];
  points: number[];
  answersTime: any[];
  seconds: number;
  qnProgress: number;
  correctAnsCount: number;
  score: number;
  userId: string;
  resultID?: string;
  categoryName?: string;
}
