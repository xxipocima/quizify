import {AuthService} from "./auth/auth.service";
import {Router} from "@angular/router";
import {MatSnackBar} from "@angular/material/snack-bar";
import {Injectable} from "@angular/core";
import {concatMap, map, toArray} from "rxjs/operators";
import {from, of} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {AngularFirestore} from "@angular/fire/compat/firestore";
import {ArticleModal} from "./modal/article";
import {CategoryModal} from "./modal/category";

@Injectable({
  providedIn: 'root'
})

export class ArticleService {
  articlesData: ArticleModal[] = [];
  constructor(
    private snackBar: MatSnackBar,
    private http: HttpClient,
    private authService: AuthService,
    private fireStore: AngularFirestore,
    public router: Router
  ) {}
  async addArticleToCollection(collectionId: string, articleId: string, collection: string): Promise<void> {
    const userRef = this.fireStore.collection(collection).doc(collectionId).ref;

    try {
      const doc = await userRef.get();

      if (!doc.exists) {
        console.log('No such document!');
      } else {
        // @ts-ignore
        const articles = doc.data()?.articles ?? [];
        articles.push(articleId);

        return userRef.update({ articles });
      }
    } catch (error) {
      console.log('Error getting document:', error);
    }
  }

  async createArticle(data: ArticleModal) : Promise<string> {

    if(this.authService.user)
      data = {...data, userId: this.authService.user.uid}
    else
      data = {...data, userId: this.authService.userData.uid}

    return this.fireStore.collection('articles').add(data).then(res =>{
      if(res.id)
      {
        //add Article to users collection
        this.addArticleToCollection(data.userId, res.id, "users");
        return res.id
      }
      return '';
    }, error =>{
      return '';
    })

  }
  updateArticle(articleId: string, data: ArticleModal): Promise<void> {
    if(this.authService.user)
      data = {...data, userId: this.authService.user.uid}
    else
      data = {...data, userId: this.authService.userData.uid}
    return this.fireStore.collection('articles').doc(articleId).update(data).then(() => {
      console.log(`Article with ID: ${articleId} updated successfully.`);
    }, error => {
      console.error('Error while updating Article: ', error);
    });
  }
  getArticleData(articleID: string) {
    return this.fireStore.collection('articles').doc(articleID).get().pipe(map(res => {
      if (res.exists && res.data()) {
        const articleData = res.data() as ArticleModal;
        articleData.id = articleID;
        return articleData;
      } else {
        return null;
      }
    }));
  }
  getArticles() {
    if (this.articlesData.length>0) {
      return of(this.articlesData);
    } else {
      return this.fireStore.collection('articles').get().pipe(
        map(res => {
          this.articlesData = res.docs.map(doc => doc.data()) as ArticleModal[];
          return this.articlesData;
        })
      );
    }
  }
  getArticlesByIDs(articleIDs: string[]) {
    if(articleIDs === undefined || !articleIDs) null;
    return from(articleIDs).pipe(
      concatMap(articleID => this.getArticleData(articleID)),
      toArray()
    );
  }
}
