import {QuestionModal} from "./question";
import {CategoryModal} from "./category";
export interface QuizModal {
     name: string;
     description: string;
     questions: QuestionModal[];
     categoryId: string;
     authorId: string;
     quizID?: string;
     authorName?: string;
     categoryName?: string;
     recommendations: string;
}
