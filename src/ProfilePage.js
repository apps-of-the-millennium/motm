import React from 'react';
import './ProfilePage.css';
import { firestore } from './firebase';
import firebase from 'firebase/app';
import envData from './envData';
import MediaPost from './MediaPost';

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
            favouriteList: [],
            laterList: [],
            completedList: [],
            usersProfile: false,
            // userInfo: {
            //     'bio':'my bio',
            //     'favourites': [],
            //     'userName' : 'My USERNAME',
            //     'profilePic' : '',
            // },
        };
    }

    async setList(listType) {
        var lists = firestore.collection('users').doc(this.props.user).collection('lists');
        lists.doc(listType).get().then( (doc) => {
            if(doc.exists) {
                this.setState({ [listType]: doc.data()[listType] })
            }
        })
    }

    updateList = (listType) => {
        this.setList(listType);
    }

    async getProfilePicture(url) {
        //check if it is a url or path to firebase storage
        if (url.charAt(0) === '/') {
            const ref = firebase.storage().ref(url);
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

    componentDidMount() {
        var lists = firestore.collection('users').doc(this.props.user).collection('lists');
        firestore.collection('users').doc(this.props.user).get().then((doc) => {
            if(doc.exists) {
                this.setState({ userInfo: doc.data() });
                this.getProfilePicture(doc.data()['profilePic']);  
            }
            //refactor these functions, same functions diff variable
            lists.doc('laterList').get().then( (doc) => {
                if(doc.exists) {
                    this.setState({ laterList: doc.data()['laterList'] });
                }
            });
            lists.doc('completedList').get().then( (doc) => {
                if(doc.exists) {
                    this.setState({ completedList: doc.data()['completedList'] })
                }
            })
            //check if profile page is currently signed in users page
            //may need refactoring as it doesn't work if you put this function above some others
            if(this.props.user === firebase.auth().currentUser.uid) {
                this.setState({usersProfile: true});
            }
            lists.doc('favouriteList').get().then( (doc) => {
                if(doc.exists) {
                    this.setState({ favouriteList: doc.data()['favouriteList'], isLoaded: true  })
                }
            })
        })
    }

    render() {
        const { isLoaded } = this.state;
        if (isLoaded) {
            return (
                <>
                <div className="profile">
                    <img className="profilePic" src={this.state.profilePic} alt="profilePic" />
                    <h1 className="userName">{this.state.userInfo['userName']}</h1>
                    {/* Bio/Info */}
                    <p className="bio">{this.state.userInfo['bio']}</p>
                    {/* Favourites List */}
                    <h3 className="title">Favourites</h3>
                    <div className="list">
                        {
                            this.state.favouriteList.map((post) => {
                                if(post) {
                                    return (<div key={post}> <MediaPost postType={envData.MEDIA_POST_TYPES.FUNCTIONAL} id={post} usersProfile={this.state.usersProfile} listType={"favouriteList"} updateList={this.updateList} /> </div>)
                                }
                                return (<></>)
                            })
                        }
                    </div>
                    {/* Later List */}
                    <h3 className="title">Later</h3>
                    <div className="list">
                        {
                            this.state.laterList.map((post) => {
                                if(post) {
                                    return (<div key={post}> <MediaPost postType={envData.MEDIA_POST_TYPES.FUNCTIONAL} id={post} usersProfile={this.state.usersProfile} listType={"laterList"} updateList={this.updateList} />  </div>)
                                }
                                return (<></>)
                            })
                        }
                    </div>
                    {/* Completed List */}
                    <h3 className="title">Completed</h3>
                    <div className="list">
                        {
                            this.state.completedList.map((post) => {
                                if(post) {
                                    return (<div key={post}> <MediaPost postType={envData.MEDIA_POST_TYPES.FUNCTIONAL} id={post} usersProfile={this.state.usersProfile} listType={"completedList"} updateList={this.updateList} /> </div>)
                                }
                                return (<></>)
                            })
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