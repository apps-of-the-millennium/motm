import React, { useContext } from 'react';
import { auth } from "./firebase";
import firebase from 'firebase/app';
import { AuthContext } from "./context";
import './Header.css';
import { Link } from 'react-router-dom';


function signInWithGoogle() {
  const provider = new firebase.auth.GoogleAuthProvider();
  auth.signInWithPopup(provider);
}

function signOut() {
  firebase.auth().signOut();
}

const Header = () => {
  const { user } = useContext(AuthContext);

  return (
    <header className="appHeader"> 
      {!!user ? (
        <>
        <div className="logo">
        <img className="appHeaderImg" src="/logo.png" alt="bruh"/>
        <h2 className="appHeaderTitle">Media of The Millenium</h2>
        </div>
            <div className="navigation">
              <ul><a href="/#">Home</a></ul>
              <ul><Link to={`/profile/${user.uid}`}>My Profile</Link></ul>
              <ul>
                <h3>Welcome, {user.displayName} <img className="avatar" src={user.photoURL} alt="temp.png"></img>
                  <button className="headerBtns" onClick={() => signOut()}>Sign Out</button>
                </h3>
              </ul>
            </div>
        </>
      ):(
        <button className="headerBtns" onClick={() => signInWithGoogle()}>Sign In</button>
      )}
    </header>
  );
}

export default Header;