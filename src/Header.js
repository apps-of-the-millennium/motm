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

      <>
        <div className="logoContainer">
          <img className="appHeaderImg" src="/logo.png" alt="bruh" />
          <div className="appHeaderTitle">Media Of The Millenium</div>
        </div>

        {!!user ? (
          <>
            <div className="navigationContainer">
              <a className="nav" href="/#">Home</a>
              <Link className="nav" to={`/profile/${user.uid}`}>Profile</Link>
              <a href="/#" className='nav'>Filler</a>
              <a href="/#" className='nav'>Filler</a>
              <a href="/#" className='nav'>Filler</a>
              <a href="/#" className='nav'>Filler</a>
            </div>

            <div className="userContainer">
              <h3 className="welcomeMessage">Welcome, {user.displayName} </h3>
              <div className="dropBtn">
                <img className='avatar' src={user.photoURL} alt="temp.png"></img>
                <div class="dropdown-content">
                  <Link className="profileOption" to={`/profile/${user.uid}`}>Profile</Link>
                  <a href="/#" className="profileOption">Settings</a>
                  <a href="/#" className="profileOption" onClick={() => signOut()}>Log Out</a> {/*sends u to homepage upon sign out */}
                </div>
              </div>
            </div>
          </>
        ) : (
            <>
              <div className="navigationContainer">
                <a className="nav" href="/#">Home</a>
                <a href="/#" className='nav'>Filler</a>
                <a href="/#" className='nav'>Filler</a>
              </div>

              <div className="userContainer">
                <button className="signInButton" onClick={() => signInWithGoogle()}>Log In</button>
              </div>
            </>
          )}
      </>

    </header>
  );
}

export default Header;

