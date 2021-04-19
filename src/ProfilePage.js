import React, { useContext, useState, useEffect } from 'react';
import './ProfilePage.css';
import { Link } from 'react-router-dom';
import { AuthContext } from "./context";
import { firestore, firebaseApp } from './firebase';

// const [favourites, setFavourites] = useState([]);

// useEffect(() => {
//     firestore.collection('users').doc(user).onSnapshot(snapshot => {
//       //every time favourites is changed
//       setFavourites(snapshot.docs.map(doc => ({
//         docId: doc.id,
//         post: doc.data()
//       })));
//     })
// }, []);

// const changeUserName = async (userId, name) => {
//     //check later for bad input
//     firestore.collection('users').doc(userId).set({
//         userName: name
//     })
// }

class ProfilePage extends React.Component { //({ user, match }) => {
    constructor(props) {
        super(props);
        this.state = {
            userInfo: [],
            isLoaded: false,
            profilePic: '',
            favourites: {},
            // userInfo: {
            //     'bio':'my bio',
            //     'favourites': [],
            //     'userName' : 'My USERNAME',
            //     'profilePic' : '',
            // },
        };
    }

    async getPicture(url) {
        const ref = firebaseApp.storage().ref(url);
        ref.getDownloadURL()
            .then((url) => {
                this.setState({profilePic: url});
            })
            .catch((e) =>
                console.log('Error retrieving profilePic => ', e)
            );
    }

    async getFavourite(favourite, url) {
        const ref = firebaseApp.storage().ref(url);
        ref.getDownloadURL()
           .then((url) => {
                this.setState( prevState => ({
                    ...prevState,
                    favourites: {
                        ...prevState.favourites,
                        [favourite] : url
                    }
                }))
            })
            .catch((e) =>
                console.log('Error retrieving favourite => ', e)
            );
    }

    componentDidMount() {
        firestore.collection('users').doc(this.props.user).get().then((doc) => {
            if(doc.exists) {
                this.setState({ userInfo: doc.data(), isLoaded: true });
                this.getPicture(doc.data()['profilePic']);
                doc.data()['favourites'].forEach( favourite =>
                    this.getFavourite(favourite, "/mediaPosts/"+favourite+".jpg")
                );
            }
        })
    }

    render() {
        const { userInfo, isLoaded } = this.state;
        if (isLoaded) {
            return (
                <>
                <div className="profile">
                    {/* Picture of Profile */}            
                    <img className="profilePic" src={this.state.profilePic} alt="profilePic" />
                    <h1 className="userName">{this.state.userInfo['userName']}</h1>
                    {/* Bio/Info */}
                    <p className="bio">{this.state.userInfo['bio']}</p>
                    {/* Top 5 Favourites */}
                    <div className="favourites">
                        {
                            this.state.userInfo['favourites']
                            .map((favourite) =>
                                <Link to={`/mediapost/${favourite}`}>
                                    <img className="favourite" src={this.state.favourites[favourite]} alt={favourite} />
                                </Link>
                            )
                        }
                    </div>
                </div>
            </>
            )
        } else {
            return (
                <h1>LOADING...</h1>
            )
        }
    }
};

export default ProfilePage;