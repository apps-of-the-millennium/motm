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

const addFavourite = (id) => {
    var userId = firebase.auth().currentUser.uid;
    firestore.collection('users').doc(userId).set({
        favourites: firebase.firestore.FieldValue.arrayUnion(id)
    }, { merge: true })
}

const buttonStyle = {
    width: '10vw',
    height: '10vh',
    '&:hover': {
        color: 'lightblue',
    }
};

class MediaPost extends React.Component { //({ user, match }) => {
    constructor(props) {
        super(props);
        this.state = {
            isLoaded: true, //TEMPORARY SETTING TO ALWAYS TRUE
            postType: this.props.postType,

            mediaInfo: {},
            mediaPostPic: '',
            currRating: 0,
            laterColor: "black",
            completed: false,
            hover: false
            // userInfo: {
            //     'bio': 'this is bio,
            //     'favourites': [],
            //     'userName' : 'My USERNAME',
            //     'profilePic' : '',
            // },
        };
    }

    async updateLater(id) {
        var userId = firebase.auth().currentUser.uid;
        var userDoc = firestore.collection('users').doc(userId);
        if (this.state.laterColor === "blue") {
            userDoc.collection('later').doc(id).delete();
            this.setState({ laterColor: "black" });
        } else {
            userDoc.collection('later').doc(id).set({});
            this.setState({ laterColor: "blue" });
        }
    }

    async updateRating(newRating, mediaId) {
        var userId = firebase.auth().currentUser.uid;
        firestore.collection('users').doc(userId).collection('ratings').doc('books').update({
            [mediaId]: newRating,
        })
        firestore.collection('posts').doc(mediaId).collection('userRatings').doc(userId).set(
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
                console.log(doc.data()[mediaId]);
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
            console.log(ref);
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
        console.log('enter');
    }
    onMouseLeaveHandler = () => {
        this.setState({
            hover: false
        });
        console.log('leave');
    }

    componentDidMount() {
        firestore.collection('posts').doc(this.props.id).get().then((doc) => {
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
                                <AiFillStar className="icon" />
                                <AiFillClockCircle className="icon" />
                                <ImCheckmark className="icon" />

                            </div> : ''}
                    </div>
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



//place back in placeholder
//<img className="mediaPostImg" src={this.state.mediaBg} alt={this.state.mediaInfo['title']}></img>
//  {/* title */}
//  <h1 className="mediaPostTitle"><strong>{this.state.mediaInfo['title']}</strong></h1>
//  {/* basic info depends on category temp will be actors*/}
//  <h3 className="mediaPostInfo">{this.state.mediaInfo['info']}</h3>
//  {/* summary */}
//  <h4 className="mediaPostSummary">{this.state.mediaInfo['summary']}</h4>
//  {/* add to list add to ... */}
//  <div className="allbtns">
//      <div>
//          <button className="favBtn" onClick={() => addFavourite(this.props.id)} style={{...buttonStyle}} />
//          <h5>Favourite</h5>
//      </div>
//      <div>
//          <WatchLaterIcon onClick={() => this.updateLater(this.props.id)} size="large" style={{...buttonStyle, color: this.state.laterColor}} />
//          <h5>Later</h5>
//      </div>
//      <div>
//          {this.state.completed ? (
//              <CheckCircleIcon className="completed" size="large" style={{...buttonStyle, color: "green"}} />
//          ) : (
//              <CheckCircleOutlineIcon className="completed" size="large" style={{...buttonStyle}} />
//          )}
//          <h5>Completed</h5>
//      </div>
//  </div>

//  {/* rate and rating general */}
//  <div className="ratings">
//      <h2>Average Rating:  {this.state.mediaInfo['avgRating']}</h2>
//      <h4>Add a graph here...</h4>
//      <h1>Rate this Title:</h1>
//      <Rating style={{fontSize: "3em"}} value={this.state.currRating} precision={0.5} emptyIcon={<StarBorderIcon fontSize="inherit" />} onChange={(event, newRating) => this.updateRating(newRating, this.props.id)} />
//  </div>
//  {/* reviews or go to page*/}
//  {/* <Reviews/> */}
//  {/* extra report etc */}
//  <div className="extra">
//      {/* <button className="report" onClick={() => report({id})}>Report</button> */}
//  </div>