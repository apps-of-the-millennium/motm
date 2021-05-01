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
          <div className="appHeaderTitle">Media of The Millenium</div>
        </div>
            <div className="navigation">
              <a className="nav" href="/#">Home</a>
              <Link className="nav" to={`/profile/${user.uid}`}>My Profile</Link>
              <h3 className="nav">Welcome, {user.displayName} <img className="avatar" src={user.photoURL} alt="temp.png"></img>
                <button className="headerBtns" onClick={() => signOut()}>Sign Out</button>
              </h3>
            </div>
        </>
      ):(
        <button className="headerBtns" onClick={() => signInWithGoogle()}>Sign In</button>
      )}
    </header>
  );
}

export default Header;