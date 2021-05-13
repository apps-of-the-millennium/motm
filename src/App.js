import Home from './Home';
import { Component } from 'react';
import { AuthProvider } from "./context";
import ProfilePage from './ProfilePage';
import { BrowserRouter, Route, Switch } from "react-router-dom";
import MediaPostPage from './MediaPostPage';
import Header from './Header';
import Footer from './Footer';
import ErrorPage from './ErrorPage';
import { firestore } from "./firebase";

class App extends Component {

  state = {
    users: firestore.collection('users')
  }
  render() {
    return (
      <>
        <AuthProvider>
          <BrowserRouter>
            <Header />
            <Switch>
              <Route path="/" component={Home} exact />
              <Route
                path="/profile/:id"
                render={props => (
                  <ProfilePage
                    user={props.match.params.id} {...props} />
                )}
              />
              <Route
                path="/mediapost/:id"
                render={props => (
                  <MediaPostPage
                    id={props.match.params.id} {...props} />
                )}
              />
              <Route path="/" render={() => <ErrorPage /> } />
            </Switch>
            <Footer />
          </BrowserRouter>
        </AuthProvider>
      </>
    );
  }
}

export default App;
