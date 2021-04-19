import React, {useState, useEffect } from 'react';
import './Home.css';
import firebase from 'firebase/app';
import { auth, firestore } from './firebase';

function Login() {

    const signInWithGoogle = () => {
      const provider = new firebase.auth.GoogleAuthProvider();
      auth.signInWithPopup(provider);
    }
    
    return (
      <div className="loginContainer">
        <button className="appSignIn" onClick={signInWithGoogle}>Sign In with Google</button>
      </div>
    )
  }

export default Login
