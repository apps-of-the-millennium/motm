import React, { useEffect, useState } from "react";
import { firestore } from "./firebase";
import firebase from 'firebase/app';

export const AuthContext = React.createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    firebase.auth().onAuthStateChanged(function(user) {
      setUser(user);
      if (user) {
        var userId = user.uid;
        firestore.collection('users').doc(userId).get().then((doc) => {
          // if user does not exist add them to the collection
          if(!doc.exists) {
              firestore.collection('users').doc(userId).set({
                  userName: user.displayName,
                  bio: "",
                  //can include temp pic later or retrieve their current
                  profilePic: user.photoURL,
                  //add more defaults later
            })
            //probably don't need these
            firestore.collection('users').doc(userId).collection('ratings').doc('books').set({});
          }
        });
      }
    })
  }, []);

  return (
    <AuthContext.Provider value={{ user }}>{children}</AuthContext.Provider>
  );
};