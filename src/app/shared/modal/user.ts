
export class UserModal {
  constructor(
    public username: string,
    public email: string,
    public uid: string,
    public image: string,
    public quizzes: string[],
    public results?: string[],
    public articles?: string[],
    public isAdmin?: boolean,
    public isPaid?: boolean,
    public attempts?: number,
    public takedQuizId?: string,
    public customImage?: string,
  ) { }
}
