import React from 'react';
import './ProfilePage.css';
import { Link } from 'react-router-dom';
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
            viewWatchList: false,
            // userInfo: {
            //     'bio':'my bio',
            //     'favourites': [],
            //     'userName' : 'My USERNAME',
            //     'profilePic' : '',
            // },
        };
    }

    async getPicture(url) {
        //check if it is a url or path to firebase storage
        if (url.charAt(0) === '/') {
            const ref = firebaseApp.storage().ref(url);
            ref.getDownloadURL()
                .then((url) => {
                    this.setState({profilePic: url});
                })
                .catch((e) =>
                    console.log('Error retrieving profilePic => ', e)
                );
        } else {
            this.setState({profilePic: url});
        }
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

    async viewWatchList(view) {
        //if view in place do nothing
        if (!view) {
            firestore.collection('users').doc(this.props.user).collection('later').doc('books').get().then((doc) => {
                if(doc.exists) {
                    // console.log(doc.data());
                    let laterList = doc.data()['readList'];
                    console.log(laterList);
                    laterList.map((later) =>
                    <Link to={`/mediapost/${later}`}>
                        <img className="favourite" src={this.getFavourite(later, "/mediaPosts/"+later+".jpg")} alt={later} />
                    </Link>
                    )
                }
                //no else needed already set to 0
            })
                
        }
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
        const { isLoaded } = this.state;
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
                    Favourites
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
                    WatchList
                    <div className="watchList">
                        {
                            // <button className="watchButton" onClick={() => this.viewWatchList(this.state.viewWatchList)} />
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