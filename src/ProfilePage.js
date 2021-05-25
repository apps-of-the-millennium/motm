import React from 'react';
import './ProfilePage.css';
import { firestore } from './firebase';
import firebase from 'firebase/app';
import envData from './envData';
import MediaPost from './MediaPost';
import { RiUserFollowFill, RiUserUnfollowFill } from 'react-icons/ri';
import FollowList from './FollowList';
import PropTypes from 'prop-types';

// const changeUserName = async (userId, name) => {
//     //check later for bad input
//     firestore.collection('users').doc(userId).set({
//         userName: name
//     })
// }

//might not need this not sure if it's good practice though
FollowList.propTypes = {
    onClose: PropTypes.func.isRequired,
    open: PropTypes.bool.isRequired,
};

class ProfilePage extends React.Component { //({ user, match }) => {
    constructor(props) {
        super(props);
        this.handleClose = this.handleClose.bind(this);
        this.updateList = this.updateList.bind(this);
        this.state = {
            userInfo: [],
            isLoaded: false,
            profilePic: '',
            favouriteList: [],
            laterList: [],
            completedList: [],
            usersProfile: true,
            followers: [],
            following: [],
            followingCurr: false,
            userId: '',
            openFollowers: false,
            openFollowing: false
        };
    }

    handleOpenFollow(followType) {
        if(followType === 'followers') {
            this.setState({ openFollowers: true });
        } else {
            this.setState({ openFollowing: true });
        }
    }
    
    closePopup() {
        this.setState({ openFollowers: false, openFollowing: false });
    }

    handleClose() {
        this.setState({ openFollowers: false, openFollowing: false });            
    }

    updateFollowingState(following) {
        this.setState({ followingCurr: following});
        if (typeof (Storage) !== "undefined" && !this.state.usersProfile ) {
            localStorage.setItem(this.props.user + '.followed', following.toString());
        }
    }

    updateFollowing() {
        let currUser = this.state.userId;
        //in case of signed out user
        if(currUser) {
            if (typeof (Storage) !== "undefined") {
                //covers an edge case if they have multiple tabs it clears up everyone they tried to follow or unfollow
                for (var key in localStorage) {
                    let currProfile = key.substring(0, key.length-9);
                    if (key.substring(key.length - 8, key.length) === 'followed') {
                        // if we are following, merge else remove
                        if(localStorage.getItem(key) === 'true') {
                            //update the current users following list
                            let dbRef = firestore.collection('users').doc(currUser).collection('following');
                            dbRef.doc(currProfile).set(
                                { timeStamp: firebase.firestore.FieldValue.serverTimestamp() },
                                { merge: true },
                            ).then(() => {
                                console.log("Following Document written with id: ", currUser);
                            })
                            //update the current profiles followers list
                            dbRef = firestore.collection('users').doc(currProfile).collection('followers');
                            dbRef.doc(currUser).set(
                                { timeStamp: firebase.firestore.FieldValue.serverTimestamp() },
                                { merge: true },
                            ).then(() => {
                                console.log("Following Document written with id: ", currUser);
                            })
                        } else {
                            //delete from users following list
                            let dbRef = firestore.collection('users').doc(currUser).collection('following');
                            dbRef.doc(currProfile).delete()
                            .then(() => {
                                console.log("Following Document deleted with id: ", currProfile);
                            })
                            //delete from the current profiles followers list
                            dbRef = firestore.collection('users').doc(currProfile).collection('followers');
                            dbRef.doc(currUser).delete()
                            .then(() => {
                                console.log("Following Document deleted with id: ", currProfile);
                            })
                        }
                        localStorage.removeItem(key);
                    }
                }
            }
        }
    }

    updateList(listType) {
        var lists = firestore.collection('users').doc(this.props.user).collection('lists');
        lists.doc(listType).get().then( (doc) => {
            if(doc.exists) {
                this.setState({ [listType]: doc.data()[listType] });
            }
        })
    }

    //will refactor as a global picture retrieval as it is needed in several pages
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

    componentWillUnmount() {
        this.updateFollowing();
    }

    componentDidMount() {
        //may want to refactor everything into smaller separate functions
        firebase.auth().onAuthStateChanged((user) => {
            if(this.props.user !== user.uid) {
                this.setState({ usersProfile: false });
            }
            this.setState({ userId: user.uid, isLoaded: true });
        })
        
        var lists = firestore.collection('users').doc(this.props.user).collection('lists');
        firestore.collection('users').doc(this.props.user).get().then((doc) => {
            //unsure if doc.exists needs to be checked all the time
            if(doc.exists) {
                this.setState({ userInfo: doc.data() });
                this.getProfilePicture(doc.data()['profilePic']);  
            }
        })

        //may want to add a limit for this for scroll version
        var followers = firestore.collection('users').doc(this.props.user).collection('followers').orderBy('timeStamp');
        let followersArr = [];
        followers.get().then((followers) => {
            followers.forEach((follower) => {
                followersArr.push(follower.id);
            })
            //if current logged in user is following the user set so icon changes
            if(followersArr.includes(this.state.userId)) {
                this.setState({ followingCurr: true });
            }
            this.setState({ followers: followersArr });
        })

        var following = firestore.collection('users').doc(this.props.user).collection('following').orderBy('timeStamp');
        let followingArr = [];
        following.get().then((following) => {
            following.forEach((follow) => {
                followingArr.push(follow.id);
            })
            this.setState({ following: followingArr });
        })

        //refactor these functions, same functions diff variable
        lists.doc('laterList').get().then( (doc) => {
            if(doc.exists) {
                this.setState({ laterList: doc.data()['laterList'] });
            }
        })
            
        lists.doc('completedList').get().then( (doc) => {
            if(doc.exists) {
                this.setState({ completedList: doc.data()['completedList'] });
            }
        })
        
        lists.doc('favouriteList').get().then( (doc) => {
            if(doc.exists) {
                this.setState({ favouriteList: doc.data()['favouriteList'] });
            }
        })
    }

    componentDidUpdate(prevProps) {
        //if you switch to another profile
        if(this.props.user !== prevProps.user) {
            this.handleClose();
            this.componentDidMount();
            this.updateFollowing();
            //in case auth did not change but you changed from your page to elsewhere, change usersProfile
            //contemplating changing the url for personal profile so that it can make editing your profile easier
            if(this.props.user === this.state.userId) {
                this.setState({ usersProfile: true });
            } else {
                this.setState({ usersProfile: false });
            }
        }
    }

    render() {
        const { isLoaded } = this.state;
        if (isLoaded) {
            return (
                <>
                <div className="profile">
                    <FollowList open={this.state.openFollowers} followList={this.state.followers} onClose={this.handleClose} />
                    <FollowList open={this.state.openFollowing} followList={this.state.following} onClose={this.handleClose} />
                    <img className="profilePic" src={this.state.profilePic} alt="profilePic" />
                    <h1 className="userName">{this.state.userInfo['userName']}</h1>
                    <div className="follows">
                        {
                            // if it is your own profile do nothing otherwise show the follow or unfollow button
                            (this.state.usersProfile) ?
                                <> </> : (this.state.followingCurr) ?
                                <button className="followBtn" onClick={ () => this.updateFollowingState(false) }><RiUserUnfollowFill style={{fontSize: '2em'}} /></button> : <button className="followBtn" onClick={ () => this.updateFollowingState(true) } ><RiUserFollowFill style={{fontSize: '2em'}} /></button> 
                        }
                        <div className="followText">
                            <h3><button className="invisible" onClick={ () => this.handleOpenFollow('followers') }>{this.state.followers.length}</button></h3>
                            <h3><button className="invisible" onClick={ () => this.handleOpenFollow('following') }>{this.state.following.length}</button></h3>
                        </div>
                        <div className="followText">
                            <h3>Followers</h3>
                            <h3>Following</h3>
                        </div>
                    </div>
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