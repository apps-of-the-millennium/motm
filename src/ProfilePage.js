import React from 'react';
import './ProfilePage.css';
import { firestore } from './firebase';
import firebase from 'firebase/app';
import envData from './envData';
import MediaPost from './MediaPost';
import { RiUserFollowFill, RiUserUnfollowFill } from 'react-icons/ri';
import { FaRegEdit } from 'react-icons/fa';
import { BsFillPeopleFill } from 'react-icons/bs';
import FollowList from './FollowList';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

import ActivityFeed from './ActivityFeed';

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
            usersProfile: false,
            followers: [],
            following: [],
            followingCurr: false,
            userId: '',
            openFollowers: false,
            openFollowing: false,

            currentView: 'overview' //profile nav bar component selection
        };

        this.defaultNavComponent = <div style={{ color: 'var(--color-text)', background: 'var(--color-background-light)', padding: '1rem', borderRadius: '4px' }} >Nothing to show here yet (╯°□°)╯︵ ┻━┻</div>;
    }

    handleOpenFollow(followType) {
        if (followType === 'followers') {
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
        this.setState({ followingCurr: following });
        if (typeof (Storage) !== "undefined" && !this.state.usersProfile) {
            localStorage.setItem(this.props.user + '.followed', following.toString());
        }
    }

    updateFollowing() {
        let currUser = this.state.userId;
        //in case of signed out user
        if (currUser) {
            if (typeof (Storage) !== "undefined") {
                //covers an edge case if they have multiple tabs it clears up everyone they tried to follow or unfollow
                for (var key in localStorage) {
                    let currProfile = key.substring(0, key.length - 9);
                    if (key.substring(key.length - 8, key.length) === 'followed') {
                        // if we are following, merge else remove
                        if (localStorage.getItem(key) === 'true') {
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
        lists.doc(listType).get().then((doc) => {
            if (doc.exists) {
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
                    this.setState({ profilePic: url });
                })
                .catch((e) =>
                    console.log('Error retrieving profilePic => ', e)
                );
        } else {
            this.setState({ profilePic: url });
        }
    }

    //triggers the condition for myColor() i.e changes background color of current item
    toggle = (itemAtPosition) => {
        if (this.state.currentView !== itemAtPosition) {
            this.setState({ currentView: itemAtPosition })
        }
    }

    //changes background color if the current category is the same category as the small button
    myColor = (itemAtPosition) => {
        if (this.state.currentView === itemAtPosition) {
            return '#6c9dd8';
        }
        return "";
    }

    onClickProfileView = (selectedView) => {
        this.toggle(selectedView);
        // this.setState({ currentView: selectedView });
    }
    //==================================================================================================================

    componentWillUnmount() {
        this.updateFollowing();
    }

    componentDidMount() {
        //may want to refactor everything into smaller separate functions
        firebase.auth().onAuthStateChanged((user) => {
            if (this.props.user === user.uid) {
                this.setState({ usersProfile: true });
            }
            this.setState({ userId: user.uid, isLoaded: true });
        })

        var lists = firestore.collection('users').doc(this.props.user).collection('lists');
        firestore.collection('users').doc(this.props.user).get().then((doc) => {
            //unsure if doc.exists needs to be checked all the time
            if (doc.exists) {
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
            if (followersArr.includes(this.state.userId)) {
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
        lists.doc('laterList').get().then((doc) => {
            if (doc.exists) {
                this.setState({ laterList: doc.data()['laterList'] });
            }
        })

        lists.doc('completedList').get().then((doc) => {
            if (doc.exists) {
                this.setState({ completedList: doc.data()['completedList'] });
            }
        })

        lists.doc('favouriteList').get().then((doc) => {
            if (doc.exists) {
                this.setState({ favouriteList: doc.data()['favouriteList'] });
            }
        })
    }

    componentDidUpdate(prevProps) {
        //if you switch to another profile
        if (this.props.user !== prevProps.user) {
            this.handleClose();
            this.componentDidMount();
            this.updateFollowing();
            //in case auth did not change but you changed from your page to elsewhere, change usersProfile
            //contemplating changing the url for personal profile so that it can make editing your profile easier
            if (this.props.user === this.state.userId) {
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

                <div className="profile">
                    <div className="profile-header">
                        {/* TODO?: ability to set cover photo or change cover color*/}


                    </div>

                    <div className="profile-nav-container">
                        <div className="profile-nav">
                            <div style={{ color: this.myColor('overview') }} onClick={() => this.onClickProfileView('overview')} className="nav-pp">Overview</div>

                            <div style={{ color: this.myColor('activity') }} onClick={() => this.onClickProfileView('activity')} className="nav-pp">Activity</div>

                            <div style={{ color: this.myColor('lists') }} onClick={() => this.onClickProfileView('lists')} className="nav-pp">Lists</div>

                            <div style={{ color: this.myColor('reviews') }} onClick={() => this.onClickProfileView('reviews')} className="nav-pp">Reviews</div>

                            <div style={{ color: this.myColor('stats') }} onClick={() => this.onClickProfileView('stats')} className="nav-pp">Stats</div>

                        </div>
                    </div>

                    <div className="profile-page-content">
                        <div className="profile-user-sidebar">
                            <div className="user-sidebar-top">
                                <img className="profilePic" src={this.state.profilePic} alt="profilePic" />
                            </div>
                            <div className="user-sidebar-bottom">
                                <div className="userName-banner">
                                    <div className="userName">{this.state.userInfo['userName']}</div>
                                </div>

                                <div className="user-info">
                                    <div className="bio">{this.state.userInfo['bio']}</div>
                                    {this.state.usersProfile ?
                                        <Link className="nav" to={`/profile/${this.state.userId}/editProfile`}><div className="profile-button">Edit Profile<FaRegEdit style={{ marginLeft: "12px" }} /></div></Link> :
                                        (this.state.followingCurr) ?
                                            <div className="profile-button" onClick={() => this.updateFollowingState(false)}>Unfollow</div> :
                                            <div className="profile-button" onClick={() => this.updateFollowingState(true)} >Follow</div>
                                    }



                                    <div className="follows">
                                        <div className="followText">
                                            <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => this.handleOpenFollow('followers')}><BsFillPeopleFill style={{ marginRight: '4px' }} /> Followers</div>
                                            <div style={{ cursor: 'pointer' }} onClick={() => this.handleOpenFollow('followers')}>{this.state.followers.length}</div>
                                        </div>
                                        <div className="followText">
                                            <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => this.handleOpenFollow('following')}><BsFillPeopleFill style={{ marginRight: '4px' }} /> Following</div>
                                            <div style={{ cursor: 'pointer' }} onClick={() => this.handleOpenFollow('following')}>{this.state.following.length}</div>
                                        </div>

                                    </div>

                                </div>

                            </div>
                        </div>

                        <div className="profile-user-content">
                            {
                                //inline switch statement || represents default : https://stackoverflow.com/questions/46592833/how-to-use-switch-statement-inside-a-react-component
                                {
                                    'overview':
                                        this.defaultNavComponent,
                                    'activity':
                                        <ActivityFeed userId={this.props.user} currentUID={this.state.userId} />,
                                    'lists':
                                        //TODO: css needs testing with more than one row of entries
                                        //TODO: will be too big when list size increases, make a new component design for media post
                                        <div>
                                            <div style={{ marginBottom: '48px' }}>
                                                {/* Favourites List */}
                                                <div className="section-label">Favourites</div>
                                                <div className="section-posts list">
                                                    {
                                                        this.state.favouriteList.map((post) => {
                                                            if (post) {
                                                                return (<div key={post}> <MediaPost postType={envData.MEDIA_POST_TYPES.FUNCTIONAL} id={post} usersProfile={this.state.usersProfile} listType={"favouriteList"} updateList={this.updateList} /> </div>)
                                                            }
                                                            return (<></>)
                                                        })
                                                    }
                                                </div>
                                            </div>

                                            <div style={{ marginBottom: '48px' }}>
                                                {/* Watch Later List */}
                                                <div className="section-label"> Watch Later</div>
                                                <div className="section-posts list">
                                                    {
                                                        this.state.laterList.map((post) => {
                                                            if (post) {
                                                                return (<div key={post}> <MediaPost postType={envData.MEDIA_POST_TYPES.FUNCTIONAL} id={post} usersProfile={this.state.usersProfile} listType={"laterList"} updateList={this.updateList} />  </div>)
                                                            }
                                                            return (<></>)
                                                        })
                                                    }
                                                </div>
                                            </div>

                                            <div style={{ marginBottom: '48px' }}>
                                                {/* Completed List */}
                                                <div className="section-label">Completed</div>
                                                <div className="section-posts list">
                                                    {
                                                        this.state.completedList.map((post) => {
                                                            if (post) {
                                                                return (<div key={post}> <MediaPost postType={envData.MEDIA_POST_TYPES.FUNCTIONAL} id={post} usersProfile={this.state.usersProfile} listType={"completedList"} updateList={this.updateList} /> </div>)
                                                            }
                                                            return (<></>)
                                                        })
                                                    }
                                                </div>
                                            </div>

                                        </div>,
                                    'reviews':
                                        this.defaultNavComponent,
                                    'stats':
                                        this.defaultNavComponent,
                                }[this.state.currentView] || this.defaultNavComponent
                            }
                        </div>
                    </div>


                    <FollowList open={this.state.openFollowers} followList={this.state.followers} onClose={this.handleClose} />
                    <FollowList open={this.state.openFollowing} followList={this.state.following} onClose={this.handleClose} />





                    {/* Later List */}
                    {/* <div className="title">Later</div>
                    <div className="list">
                        {
                            this.state.laterList.map((post) => {
                                if(post) {
                                    return (<div key={post}> <MediaPost postType={envData.MEDIA_POST_TYPES.FUNCTIONAL} id={post} usersProfile={this.state.usersProfile} listType={"laterList"} updateList={this.updateList} />  </div>)
                                }
                                return (<></>)
                            })
                        }
                    </div> */}
                    {/* Completed List */}
                    {/* <div className="title">Completed</div>
                    <div className="list">
                        {
                            this.state.completedList.map((post) => {
                                if(post) {
                                    return (<div key={post}> <MediaPost postType={envData.MEDIA_POST_TYPES.FUNCTIONAL} id={post} usersProfile={this.state.usersProfile} listType={"completedList"} updateList={this.updateList} /> </div>)
                                }
                                return (<></>)
                            })
                        }
                    </div> */}

                </div>




            )


        } else {
            return (
                <h1>LOADING...</h1>
            )
        }
    }
};

export default ProfilePage;