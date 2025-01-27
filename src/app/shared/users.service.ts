import { Injectable } from '@angular/core';

import 'firebase/auth';
import {AuthService} from "./auth/auth.service";
import {AngularFirestore} from "@angular/fire/compat/firestore";
import firebase from "firebase/compat";
import {UserModal} from "./modal/user";
import {first, from, mergeMap, Observable, of, switchMap, take, tap} from "rxjs";
import {concatMap, map, toArray} from "rxjs/operators";
import {CategoryModal} from "./modal/category";
import {QuizModal} from "./modal/quiz";
import {Router} from "@angular/router";

@Injectable({
  providedIn: 'root'
})
export class UsersService {

  constructor(
    public authService: AuthService,
    public router: Router,
    private fireStore: AngularFirestore
  ) {}

  isUsernameExists(username: string) {
    return this.fireStore.collection('usernames').doc(username).get().pipe(map(res => {
      return res.exists;
    }))
  }

  isUserExists(userID: string){
    return this.fireStore.collection('users').doc(userID).get().pipe(map(res => {
      return res.exists;
    }));
  }

  getUsername(userID: string){
    return this.fireStore.collection('users').doc(userID).get().pipe(map(res => {
      // @ts-ignore
      return (res.exists && res.data()) ? res.data()['username'] : "";
    }));
  }

  getUserID(username: string){
    return this.fireStore.collection('usernames').doc(username).get().pipe(map(res => {
      // @ts-ignore
      return (res.exists && res.data()) ? res.data()['uid'] : "";
    }));
  }

  getUsersIDs(){
    return this.fireStore.collection('usernames').get().pipe(map(res => {
      // @ts-ignore
      // return (res.exists && res.data()) ? res.data()['uid'] : "";
      return res.docs.map(doc => doc.data()['uid']);
    }));
  }

  getUserData(userID: string)
  {
    return this.fireStore.collection('users').doc(userID).get().pipe(map(res => {
      // @ts-ignore
      return (res.exists && res.data()) ? res.data() : null;
    }));
  }
  getUsers(usersIDs: string[]) {
    if(usersIDs === undefined) null;
    return from(usersIDs).pipe(
      concatMap(userID => this.getUserData(userID)),
      toArray()
    );
  }

  generateUsername(email: string): Observable<string> {
    const parts = email.split('@');
    let username = parts[0];

    return this.isUsernameExists(username).pipe(
      mergeMap(userExists => {
        if (!userExists) {
          return from([username]);
        }
        let newUsername: string;
        return from(
          new Observable<string>(observer => {
            let i = Math.floor(Math.random() * 10);
            const generate = () => {
              newUsername = username + i.toString();
              this.isUsernameExists(newUsername).subscribe(result => {
                if (result) {
                  i = Math.floor(Math.random() * 10);
                  generate();
                } else {
                  observer.next(newUsername);
                }
              });
            };
            generate();
          })
        );
      })
    );
  }

  sendUsersData(user: UserModal) {
    console.log("sendUsersData")
    const userDocRef = this.fireStore.collection('users').doc(user.uid);
      let data = {
        "username": user.username,
        "image": user.image,
        "quizzes": user.quizzes,
      }

    userDocRef.get().pipe(first()).subscribe(docSnapshot => {
      if (docSnapshot.exists) {
        if(!user.quizzes || user.quizzes.length==0) {
          this.getUserData(user.uid).pipe(take(1)).subscribe(user => {
              if (user) { // @ts-ignore
                data.quizzes = user.quizzes;
              }
              console.log(data)
              userDocRef.update(data);
            }
          )
        }
        else
          userDocRef.update(data);
      } else {
        userDocRef.set(data, { merge: true });
      }
    });

   if(user.username==undefined)
     return;
    const userDocNamesRef = this.fireStore.collection('usernames').doc(user.username);
    const nameData=  {"uid": user.uid}
    userDocNamesRef.get().pipe(first()).subscribe(docSnapshot => {
      if (docSnapshot.exists) {
        console.log("exists")
        userDocNamesRef.update(nameData);
      } else {
        console.log("set")
        userDocNamesRef.set(nameData, { merge: true });
      }
    });
  }
  updateUser(userId: string | undefined, data: {
    username: any;
    attempts: any;
    isAdmin: any;
    isPaid: any
  }): Promise<void> {
    return this.fireStore.collection('users').doc(userId).update({
      username: data.username,
      attempts: data.attempts,
      isAdmin: data.isAdmin,
      isPaid: data.isPaid,
    }).then(() => {
      console.log(`User with ID: ${userId} updated successfully.`);
    }, error => {
      console.error('Error while updating user: ', error);
    });
  }
  updateUserImage(userId: string, imageUrl: string) {
    return this.fireStore.collection('users').doc(userId).update({
      customImage: imageUrl
    });
  }
  updateUserTakedQuiz(userId: string, resultID: string) {
    return this.fireStore.collection('users').doc(userId).update({
      takedQuizId: resultID
    });
  }
  updateUserAtempts(userId: string, attempts: number) {
    return this.fireStore.collection('users').doc(userId).update({
      attempts: attempts
    });
  }
}
