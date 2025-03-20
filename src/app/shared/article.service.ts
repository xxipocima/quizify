import {AuthService} from "./auth/auth.service";
import {Router} from "@angular/router";
import {MatSnackBar} from "@angular/material/snack-bar";
import {Injectable} from "@angular/core";
import { environment} from "../../environments/environment";
import {CategoryModal} from "./modal/category";
import {concatMap, map, toArray} from "rxjs/operators";
import {from, of} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {AngularFirestore} from "@angular/fire/compat/firestore";
import {ResultModal} from "./modal/result";
import {QuizModal} from "./modal/quiz";

@Injectable({
  providedIn: 'root'
})

export class ResultService {

  resultsData: ResultModal[] = [];
  constructor(
    private snackBar: MatSnackBar,
    private http: HttpClient,
    private authService: AuthService,
    private fireStore: AngularFirestore,
    public router: Router
  ) {}
  async addResultToCollection(collectionId: string, resultId: string, collection: string): Promise<void> {
    const userRef = this.fireStore.collection(collection).doc(collectionId).ref;

    try {
      // Get the current 'quizzes' array from the category document
      const doc = await userRef.get();

      if (!doc.exists) {
        console.log('No such document!');
      } else {
        // If the 'quizzes' array exists, add the new quizId, otherwise create a new array with quizId
        // @ts-ignore
        const results = doc.data()?.results ?? [];
        results.push(resultId);

        return userRef.update({ results });
      }
    } catch (error) {
      console.log('Error getting document:', error);
    }
  }

  async createResult(data: ResultModal) : Promise<string> {

    if(this.authService.user)
      data = {...data, userId: this.authService.user.uid}
    else
      data = {...data, userId: this.authService.userData.uid}

    return this.fireStore.collection('result').add(data).then(res =>{
      if(res.id)
      {
        //add Result to users collection
        this.addResultToCollection(data.userId, res.id, "users");
        return res.id
      }
      return '';
    }, error =>{
      return '';
    })

  }
  updateResult(resultId: string, data: ResultModal): Promise<void> {
    if(this.authService.user)
      data = {...data, userId: this.authService.user.uid}
    else
      data = {...data, userId: this.authService.userData.uid}
    return this.fireStore.collection('result').doc(resultId).update(data).then(() => {
      console.log(`Result with ID: ${resultId} updated successfully.`);
    }, error => {
      console.error('Error while updating Result: ', error);
    });
  }
  getResultData(resultID: string) {
    return this.fireStore.collection('result').doc(resultID).get().pipe(map(res => {
      if (res.exists && res.data()) {
        const resultData = res.data() as ResultModal;
        resultData.resultID = resultID;
        return resultData;
      } else {
        return null;
      }
    }));
  }
  getResults(resultIDs: string[]) {
    if(resultIDs === undefined || !resultIDs) null;
    return from(resultIDs).pipe(
      concatMap(resultID => this.getResultData(resultID)),
      toArray()
    );
  }
}
