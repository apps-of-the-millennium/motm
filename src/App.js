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
import ReviewEditPage from './ReviewEditPage';
import ReviewPage from './ReviewPage';
import BrowsePage from './BrowsePage'
import EditProfile from './EditProfile';

import ScrollToTop from './ScrollToTop';

class App extends Component {

  state = {
    users: firestore.collection('users')
  }
  render() {
    return (
      <>
        <AuthProvider>
          <BrowserRouter>
            <ScrollToTop />
            <Header />
            <Switch>
              <Route path="/" component={Home} exact />
              <Route
                path="/profile/:id/editProfile"
                render={props => (
                  <EditProfile
                    user={props.match.params.id} {...props} />
                )}
              />
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
              <Route
                path="/review/write/:id"
                render={props => (
                  <ReviewEditPage
                    id={props.match.params.id} {...props} />
                )}
              />
              <Route
                path="/review/:id"
                render={props => (
                  <ReviewPage
                    id={props.match.params.id} {...props} />
                )}
              />
              <Route
                path="/browse"
                render={() =>
                  <BrowsePage/> } />
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
