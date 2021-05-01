import React from 'react';
import './MediaPost.css';
import { firestore, firebaseApp } from './firebase';
import firebase from 'firebase/app';
import envData from './envData';

import Rating from '@material-ui/lab/Rating';
import StarBorderIcon from '@material-ui/icons/StarBorder';
import WatchLaterIcon from '@material-ui/icons/WatchLater';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import CheckCircleOutlineIcon from '@material-ui/icons/CheckCircleOutline';

import { AiFillStar } from 'react-icons/ai';

import { AiFillClockCircle } from 'react-icons/ai';
import { MdStars } from 'react-icons/md';
import { ImCheckmark } from 'react-icons/im';

class MediaPost extends React.Component { //({ user, match }) => {
    constructor(props) {
        super(props);
        this.state = {
            isLoaded: true, //TEMPORARY SETTING TO ALWAYS TRUE
            postType: this.props.postType,

            mediaInfo: {},
            mediaPostPic: '',
            currRating: 0,
            completed: false,
            hover: false,
            popUp: false,
            listType: "",
            // userInfo: {
            //     'bio': 'this is bio,
            //     'favourites': [],
            //     'userName' : 'My USERNAME',
            //     'profilePic' : '',
            // },
        };
    }

    async updateFavourite(id) {
        var userId = firebase.auth().currentUser.uid;
        firestore.collection('users').doc(userId).collection('lists').doc('favouriteList').update({
            favouriteList: firebase.firestore.FieldValue.arrayUnion(id)
        });
        this.setState({ popUp: true, listType: 'Favourites List' })
        setTimeout(function(){
            this.setState({ popUp: false });
        }.bind(this),5000);
    }

    async updateLater(id) {
        var userId = firebase.auth().currentUser.uid;
        firestore.collection('users').doc(userId).collection('lists').doc('laterList').update({
            laterList: firebase.firestore.FieldValue.arrayUnion(id)
        });
        this.setState({ popUp: true, listType: 'Later List' });
        setTimeout(function(){
            this.setState({ popUp: false });
        }.bind(this),5000);
    }

    async updateCompleted(id) {
        var userId = firebase.auth().currentUser.uid;
        firestore.collection('users').doc(userId).collection('lists').doc('completedList').update({
            completedList: firebase.firestore.FieldValue.arrayUnion(id)
        });
        this.setState({ popUp: true, listType: 'Completed List' });
        setTimeout(function(){
            this.setState({ popUp: false });
        }.bind(this),5000);
    }

    //will move this function to full page MediaPost
    async updateRating(newRating, mediaId) {
        var userId = firebase.auth().currentUser.uid;
        firestore.collection('users').doc(userId).collection('ratings').doc('books').update({
            [mediaId]: newRating,
        })
        firestore.collection('posts').doc('books').collection('bookPosts').doc(mediaId).collection('userRatings').doc(userId).set(
            { rating: newRating },
            { merge: true }
        )
        this.setState({ currRating: newRating });
    }

    async getRating(mediaId) {
        var userId = firebase.auth().currentUser.uid;
        var userDoc = firestore.collection('users').doc(userId);
        userDoc.collection('ratings').doc('books').get().then((doc) => {
            if (doc.exists) {
                this.setState({ currRating: doc.data()[mediaId] });
            }
            //no else needed already set to 0
        })
        userDoc.collection('later').doc(mediaId).get().then((doc) => {
            if (doc.exists) {
                this.setState({ laterColor: "blue" });
            }
        })
    }

    async getPicture(url) {
        if (url) {
            const ref = firebaseApp.storage().ref(url);
            ref.getDownloadURL()
                .then((url) => {
                    this.setState({ mediaPostPic: url });
                })
                .catch((e) =>
                    console.log('Error retrieving profilePic => ', e)
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
        firestore.collection('posts').doc('books').collection('bookPosts').doc(this.props.id).get().then((doc) => {
            if (doc.exists) {
                this.setState({ mediaInfo: doc.data(), isLoaded: true });
                this.getPicture('/mediaPosts/' + this.props.id + '.jpg');
                this.getRating(this.props.id);
            }
        })
    }

    render() {
        if (this.state.isLoaded) {
            if (this.state.postType === envData.MEDIA_POST_TYPES.FUNCTIONAL) {
                return (
                    <>
                        {(this.state.popUp) ? <div className="popUp">{this.state.mediaInfo['title']} was added to {this.state.listType}</div> : <></> }
                        <div className="mediaContainer" onMouseEnter={this.onMouseEnterHandler} onMouseLeave={this.onMouseLeaveHandler}>
                            <div className="mediaPost" >
                                {/* picture of media*/}
                                <img className="mediaPostImg" src={this.state.mediaPostPic} alt={this.state.mediaInfo['title']}></img>
                                {/* title */}
                                <h1 className="mediaPostTitle"><strong>{this.state.mediaInfo['title']}</strong></h1>
                            </div>
                            {(this.state.hover) ?
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
                                        {(this.state.mediaInfo['tags']) ? this.state.mediaInfo['tags'].slice(0,3).map((tag) => {
                                            return <div className="tag">{tag}</div>
                                        }) : "No tag"}
                                    </div>
                                </div> : ''}
                            {(this.state.hover) ?
                                <div className="mediaPostButtons">
                                    <button className="invisible" onClick={() => this.updateFavourite(this.props.id)}><AiFillStar className="icon" /></button>
                                    <button className="invisible" onClick={() => this.updateLater(this.props.id)}><AiFillClockCircle className="icon" /></button>
                                    <button className="invisible" onClick={() => this.updateCompleted(this.props.id)}><ImCheckmark className="icon" /></button>
                                </div> : ''}
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
                            <div className="star2"><AiFillStar /></div>
                            <h2 className="ratingValue2">{(this.state.mediaInfo['avgRating']) ? this.state.mediaInfo['avgRating'] : "N/A"}</h2>
                        </div>
                        <h2 className="releaseDate2">{(this.state.mediaInfo['releaseDate']) ? this.state.mediaInfo['releaseDate'] : "N/A"}</h2>
                        <div className="author2">{(this.state.mediaInfo['publisher']) ? this.state.mediaInfo['publisher'] : "N/A"}</div>
                        {/* limiting displayed tags to max 4 */}
                        <div className="tagContainer2">
                            {(this.state.mediaInfo['tags']) ? this.state.mediaInfo['tags'].slice(0,4).map((tag) => {
                                return <div className="tag2">{tag}</div>
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

//Date released, Category type: tv show, movie, actor etc, tags, rating
//Rating will be moved to full page view of mediaPost
//  <div className="ratings">
//      <h2>Average Rating:  {this.state.mediaInfo['avgRating']}</h2>
//      <h4>Add a graph here...</h4>
//      <h1>Rate this Title:</h1>
//      <Rating style={{fontSize: "3em"}} value={this.state.currRating} precision={0.5} emptyIcon={<StarBorderIcon fontSize="inherit" />} onChange={(event, newRating) => this.updateRating(newRating, this.props.id)} />
//  </div>