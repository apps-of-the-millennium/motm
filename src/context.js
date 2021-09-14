import React, { useEffect, useState } from "react";
import { firestore } from "./firebase";
import firebase from 'firebase/app';

export const AuthContext = React.createContext();

export const AuthProvider = ({ children }) => {
  const [userId, setUserId] = useState(null);
  const [userName, setUserName] = useState(null);
  const [profilePic, setProfilePic] = useState(null);
  const [isPrivate, setisPrivate] = useState(null);
  //I think this is only useful when user checks their own profile
  //just another variable we always pass shouldn't be an issue since we already do the read anyways
  const [bio, setBio] = useState(null);

  useEffect(() => {
    const getProfilePicture = (url) => {
      console.log(url);
      //check if it is a url or path to firebase storage
      if (url.charAt(0) === '/') {
        const ref = firebase.storage().ref(url);
        ref.getDownloadURL()
            .then((url) => {
              setProfilePic(url);
            })
            .catch((e) =>
                console.log('Error retrieving profilePic => ', e)
            );
      } else {
        setProfilePic(url);
      }
    }

    firebase.auth().onAuthStateChanged(function(user) {
      if (user) {
        var useruid = user.uid;
        setUserId(useruid);
        firestore.collection('users').doc(useruid).get().then((doc) => {
          // if user does not exist add them to the collection
          if(!doc.exists) {
            firestore.collection('users').doc(useruid).set({
              userName: user.displayName,
              bio: "",
              //can include temp pic later or retrieve their current
              profilePic: user.photoURL,
              isPrivate: false
            })
          } else {
            setUserName(doc.data()['userName']);
            getProfilePicture(doc.data()['profilePic']);
            setBio(doc.data()['bio']);
            setisPrivate(doc.data()['isPrivate']);
          }
        });
      } else {
        //not sure if this is needed
        setUserName(null);
        setUserId(null);
        setProfilePic(null);
        setBio(null);
        setisPrivate(null);
      }
    })
  }, []);

  return (
    <AuthContext.Provider value={{ userId, userName, profilePic, bio, isPrivate }}>{children}</AuthContext.Provider>
  );
};