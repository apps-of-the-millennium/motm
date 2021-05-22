import React from 'react';
import './MediaPost.css';
import { firestore } from './firebase';
import firebase from 'firebase/app';
import envData from './envData';
import { Link } from 'react-router-dom';

import { AiFillStar, AiFillHeart, AiFillClockCircle, AiFillCloseCircle } from 'react-icons/ai';
import { ImCheckmark } from 'react-icons/im';
import { IoIosCheckmarkCircle } from 'react-icons/io';

class MediaPost extends React.Component { //({ user, match }) => {
    constructor(props) {
        super(props);
        this.state = {
            isLoaded: false,
            postType: this.props.postType,
            usersProfile: this.props.usersProfile,

            mediaInfo: {},
            mediaPostPic: '',
            currRating: 0,
            completed: false,
            hover: false,
            popUp: false,
            listType: this.props.listType,
            popUpMessage: '',
            //not sure if this is the most secure way / best way in case sign out / auth state change
            userId: '',
        };
    }

    deleteFromList(id, listType) {
        firestore.collection('users').doc(this.state.userId).collection('lists').doc(listType).update({
            [listType]: firebase.firestore.FieldValue.arrayRemove(id)
        });
        var updateList = this.props.updateList;
        updateList(listType);
    }

    //refactor below functions, same functions with diff list names
    updateFavourite(id) {
        if(this.state.userId) {
            firestore.collection('users').doc(this.state.userId).collection('lists').doc('favouriteList').set(
                { favouriteList: firebase.firestore.FieldValue.arrayUnion(id) },
                { merge: true }
            );
            this.setState({ popUp: true, popUpMessage: 'Favourites List' });
            setTimeout(function () {
                this.setState({ popUp: false });
            }.bind(this), 5000);
        }
        
    }

    updateLater(id) {
        if(this.state.userId) {
            firestore.collection('users').doc(this.state.userId).collection('lists').doc('laterList').set(
                { laterList: firebase.firestore.FieldValue.arrayUnion(id) },
                { merge: true }
            );
            this.setState({ popUp: true, popUpMessage: 'Later List' });
            setTimeout(function () {
                this.setState({ popUp: false });
            }.bind(this), 5000);
        }
        
    }

    updateCompleted(id) {
        if(this.state.userId) {
            firestore.collection('users').doc(this.state.userId).collection('lists').doc('completedList').set(
                { completedList: firebase.firestore.FieldValue.arrayUnion(id) },
                { merge: true }
            );
            this.setState({ popUp: true, popUpMessage: 'Completed List' });
            setTimeout(function () {
                this.setState({ popUp: false });
            }.bind(this), 5000);
        }
        
    }

    getPicture(url) {
        if (url) {
            const ref = firebase.storage().ref(url);
            ref.getDownloadURL()
                .then((url) => {
                    this.setState({ mediaPostPic: url });
                })
                .catch((e) =>
                    console.log('Error retrieving mediaPostPic => ', e)
                );
        }
    }

    onMouseEnterHandler = () => {
        this.setState({
            hover: true
        });
    }
    onMouseLeaveHandler = () => {
        this.setState({
            hover: false
        });
    }

    componentDidMount() {
        firebase.auth().onAuthStateChanged((user) => {
            if(user) {
                this.setState({ userId: user.uid });
            }
            this.setState({ isLoaded: true });
        });

        firestore.collection('posts').doc('books').collection('bookPosts').doc(this.props.id).get().then((doc) => {
            if (doc.exists) {
                this.setState({ mediaInfo: doc.data() });
                this.getPicture('/mediaPosts/' + this.props.id + '.jpg');
            }
        })
    }

    render() {
        if (this.state.isLoaded) {
            if (this.state.postType === envData.MEDIA_POST_TYPES.FUNCTIONAL) {
                return (
                    <>
                        {(this.state.popUp) && <div className="popUp">
                            {this.state.mediaInfo['title']} was added to {this.state.popUpMessage}
                            <IoIosCheckmarkCircle style={{ fontSize: '16px', position: 'absolute', right: '15px', top: '11px' }} />
                        </div>}
                        <div className="mediaContainer" onMouseEnter={this.onMouseEnterHandler} onMouseLeave={this.onMouseLeaveHandler}>
                            <Link className="mediaPageLink" to={`/mediapost/${this.props.id}`}>
                                <div className="mediaPost" >
                                    {/* picture of media*/}
                                    <img className="mediaPostImg" src={this.state.mediaPostPic} alt=""></img>
                                    {/* title */}
                                    <h1 className="mediaPostTitle"><strong>{this.state.mediaInfo['title']}</strong></h1>
                                </div>
                            </Link>
                            {(this.state.hover) ?
                                (this.props.usersProfile) ?
                                    <div className="mediaPostDelete">
                                        <button className="invisible" onClick={() => this.deleteFromList(this.props.id, this.props.listType)}><AiFillCloseCircle className="icon" color="#ff5464" /></button>
                                    </div> :

                                    <>

                                        <div className="mediaPostInfoBox">
                                            {/* basic info depends on category temp will be actors*/}
                                            <div className="mediaPostCategory">{(this.state.mediaInfo['category']) ? this.state.mediaInfo['category'] : "N/A"}</div>
                                            <div className="ratings">
                                                <div className="star"><AiFillStar /></div>
                                                <h2 className="ratingValue">{(this.state.mediaInfo['avgRating']) ? this.state.mediaInfo['avgRating'] : "N/A"}</h2>
                                            </div>
                                            <h2 className="releaseDate">{(this.state.mediaInfo['releaseDate']) ? this.state.mediaInfo['releaseDate'] : "N/A"}</h2>
                                            <div className="author">{(this.state.mediaInfo['publisher']) ? this.state.mediaInfo['publisher'] : "N/A"}</div>
                                            {/* limiting displayed tags to max 3, if it still overflows, it will be hidden */}
                                            <div className="tagContainer">
                                                {(this.state.mediaInfo['tags']) ? Object.keys(this.state.mediaInfo['tags']).slice(0, 3).map((keyName, i) => {
                                                    return <div className="tag">{keyName}</div>
                                                }) : "No tag"}
                                            </div>
                                        </div>

                                        <div className="mediaPostButtons">
                                            <button className="invisible" onClick={() => this.updateFavourite(this.props.id)}><AiFillHeart className="icon" /></button>
                                            <button className="invisible" onClick={() => this.updateLater(this.props.id)}><AiFillClockCircle className="icon" /></button>
                                            <button className="invisible" onClick={() => this.updateCompleted(this.props.id)}><ImCheckmark className="icon" /></button>
                                        </div>
                                    </>
                                : ''}
                        </div>
                    </>

                )
            } else { //envData.MEDIA_P_TYPE.SIMPLE i.e top10 post style
                return (
                    <div className="mediaContainer2">
                        {/* picture of media*/}
                        <img className="mediaPostImg2" src={this.state.mediaPostPic} alt={this.state.mediaInfo['title']}></img>
                        {/* title */}
                        <h1 className="mediaPostTitle2"><strong>{this.state.mediaInfo['title']}</strong></h1>
                        {/* basic info depends on category temp will be actors*/}
                        <div className="mediaPostCategory2">{(this.state.mediaInfo['category']) ? this.state.mediaInfo['category'] : "N/A"}</div>
                        <div className="ratings2">
                            <div className="star2"><AiFillHeart /></div>
                            <h2 className="ratingValue2">{(this.state.mediaInfo['avgRating']) ? this.state.mediaInfo['avgRating'] : "N/A"}</h2>
                        </div>
                        <h2 className="releaseDate2">{(this.state.mediaInfo['releaseDate']) ? this.state.mediaInfo['releaseDate'] : "N/A"}</h2>
                        <div className="author2">{(this.state.mediaInfo['publisher']) ? this.state.mediaInfo['publisher'] : "N/A"}</div>
                        {/* limiting displayed tags to max 4 */}
                        <div className="tagContainer2">
                            {(this.state.mediaInfo['tags']) ? Object.keys(this.state.mediaInfo['tags']).slice(0, 4).map((keyName, i) => {
                                return <div className="tag2">{keyName}</div>
                            }) : "No tag"}

                        </div>
                    </div>
                )
            }

        } else {
            return (
                <h1>LOADING...</h1>
            )
        }
    }
};

export default MediaPost;