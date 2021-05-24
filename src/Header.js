import React, { useContext } from 'react';
import { auth } from "./firebase";
import firebase from 'firebase/app';
import { AuthContext } from "./context";
import './Header.css';
import { Link, useHistory } from 'react-router-dom';
import { RiLoginBoxFill } from 'react-icons/ri';

// function signInWithGoogle() {
//   const provider = new firebase.auth.GoogleAuthProvider();
//   auth.signInWithPopup(provider).then(() => {
//     history.push('/');
//   })
// }

// function signOut() {
//   firebase.auth().signOut();
//   history.push('/');
// }

const Header = () => {
  const { user } = useContext(AuthContext);
  const history = useHistory();

  function signInWithGoogle() {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider).then(() => {
      history.push('/');
    })
  }
  
  function signOut() {
    firebase.auth().signOut().then(() => {
      history.push('/');
    })
  }

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
              <Link className="nav" to={`/`}>Home</Link>
              <Link className="nav" to={`/profile/${user.uid}`}>Profile</Link>
              <a href="/#" className='nav'>Filler</a>
              <a href="/#" className='nav'>Filler</a>
              <a href="/#" className='nav'>Filler</a>
              <Link className="nav" to={`/browse`}>Browse</Link>
            </div>

            <div className="userContainer">
              <h3 className="welcomeMessage">Welcome, {user.displayName} </h3>
              <div className="dropBtn">
                <img className='avatar' src={user.photoURL} alt="temp.png"></img>
                <div className="dropdown-content">
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
                <Link className="nav" to={`/`}>Home</Link>
                <a href="/#" className='nav'>Filler</a>
                <Link className="nav" to={`/browse`}>Browse</Link>
              </div>

              <div className="userContainer">
                <div className="signInButton" onClick={() => signInWithGoogle()}>Log In <RiLoginBoxFill/></div>
              </div>
            </>
          )}
      </>

    </header>
  );
}

export default Header;

