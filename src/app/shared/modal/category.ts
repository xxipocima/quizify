import {PromoQuizModal} from "./promoQuiz";

export interface CategoryModal {
    id: string;
    name: string;
    description: string;
    quizzes: string[];
    icon: string;
    promoQuiz?: PromoQuizModal
}
