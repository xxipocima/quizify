import {ResultModal} from "./result";

export class UserModal {
  constructor(
    public username: string,
    public email: string,
    public uid: string,
    public image: string,
    public quizzes: string[],
    public customImage?: string,
    public takedQuizId?: string,
    public results?: ResultModal[],
    public attempts?: number,
    public isAdmin?: boolean,
    public isPaid?: boolean
  ) { }
}
