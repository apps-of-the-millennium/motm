import Home from './Home';
import { Component } from 'react';
import { AuthProvider } from "./context";
import ProfilePage from './ProfilePage';
import { BrowserRouter, Route, Switch } from "react-router-dom";
import MediaPostPage from './MediaPostPage';
import Header from './Header';
import Footer from './Footer';
import ErrorPage from './ErrorPage';
import ReviewEditPage from './ReviewEditPage';
import ReviewPage from './ReviewPage';
import BrowsePage from './BrowsePage'
import EditProfile from './EditProfile';

import ScrollToTop from './ScrollToTop';

class App extends Component {
  render() {
    return (
      <div style={{backgroundColor:'var(--color-background)', transition:'background 1s'}}>
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
                path="/mediapost/:category/:id"
                render={props => (
                  <MediaPostPage
                    id={props.match.params.id} category={props.match.params.category} {...props} />
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
      </div>
    );
  }
}

export default App;
