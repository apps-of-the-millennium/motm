import React from 'react';
import './MediaPostPage.css';
import { firestore } from './firebase';
import firebase from 'firebase/app';
import envData from './envData';

// Might use later but for full page of MediaPost
// import Rating from '@material-ui/lab/Rating';
// import StarBorderIcon from '@material-ui/icons/StarBorder';

import { AiFillHeart } from 'react-icons/ai';
import { AiFillStar } from 'react-icons/ai';
import { AiFillClockCircle } from 'react-icons/ai';
import { ImCheckmark } from 'react-icons/im';


const text = "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum."

class MediaPostPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isLoaded: true, //TEMPORARY SETTING TO ALWAYS TRUE
            postType: this.props.postType,

            mediaInfo: {},
            mediaPostPic: '',
            currRating: 0,
            // completed: false,
            // hover: false,
            openOptions: false,
            popUp: false,
            listType: "",
        };
    }

    async updateFavourite(id) {
        var userId = firebase.auth().currentUser.uid;
        firestore.collection('users').doc(userId).collection('lists').doc('favouriteList').update({
            favouriteList: firebase.firestore.FieldValue.arrayUnion(id)
        });
        this.setState({ popUp: true, listType: 'Favourites List' })
        setTimeout(function () {
            this.setState({ popUp: false });
        }.bind(this), 5000);
    }

    async updateLater(id) {
        var userId = firebase.auth().currentUser.uid;
        firestore.collection('users').doc(userId).collection('lists').doc('laterList').update({
            laterList: firebase.firestore.FieldValue.arrayUnion(id)
        });
        this.setState({ popUp: true, listType: 'Later List' });
        setTimeout(function () {
            this.setState({ popUp: false });
        }.bind(this), 5000);
    }

    async updateCompleted(id) {
        var userId = firebase.auth().currentUser.uid;
        firestore.collection('users').doc(userId).collection('lists').doc('completedList').update({
            completedList: firebase.firestore.FieldValue.arrayUnion(id)
        });
        this.setState({ popUp: true, listType: 'Completed List' });
        setTimeout(function () {
            this.setState({ popUp: false });
        }.bind(this), 5000);
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

    onClick = () => {
        this.setState({ openOptions: !this.state.openOptions });
    }

    //trying to make it so the dropdown closes when u click outside, cant get to work
    // onClickOutside = () => {
    //     this.setState( { openOptions: false });
    // }

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
                        {(this.state.popUp) ? <div className="popUp">{this.state.mediaInfo['title']} was added to {this.state.listType}</div> : <></>}
                        <div className="mediaContainer" onMouseEnter={this.onMouseEnterHandler} onMouseLeave={this.onMouseLeaveHandler}>
                            <div className="mediaPost" >
                                {/* picture of media*/}
                                <img className="mediaPostImg" src={this.state.mediaPostPic} alt={this.state.mediaInfo['title']} ></img>
                                {/* title */}
                                <h1 className="mediaPostTitle"><strong>{this.state.mediaInfo['title']}</strong></h1>
                            </div>
                            {(this.state.hover) ?
                                <>
                                    <div className="mediaPostInfoBox">
                                        {/* basic info depends on category temp will be actors*/}
                                        <div className="mediaPostCategory">{(this.state.mediaInfo['category']) ? this.state.mediaInfo['category'] : "N/A"}</div>
                                        <div className="ratings">
                                            <div className="star"><AiFillHeart /></div>
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
                                </> : ''}
                        </div>
                    </>
                )
            } else {
                console.log("MEDIA PP ID:", this.props.id);
                return (

                    <>
                        {(this.state.popUp) ? <div className="popUp">{this.state.mediaInfo['title']} was added to {this.state.listType}</div> : <></>}
                        {/* Cover Image */}
                        <div className="coverContainer"></div>

                        {/* Info */}
                        <div className="infoContainer">
                            <div className="infoGrid">
                                {/* picture of media*/}
                                <img className="mediaPageImg" src={this.state.mediaPostPic} alt={this.state.mediaInfo['title']}></img>
                                {/* <div className="mediaPageImg"></div> */}
                                {/* title */}
                                <div className="mediaPageTitle">{this.state.mediaInfo['title']}</div>
                                {/* buttons */}
                                <div className="mediaPageButtons">
                                    <button onClick={this.onClick} className="dropbtn2">Add to ...<i class="arrow down"></i></button>
                                    <button className="rateButton"><AiFillStar className="icon" /></button>
                                    {(this.state.openOptions) ?
                                        <div className="dropdown-content2">
                                            <button className="listOptions" onClick={() => this.updateFavourite(this.props.id)}> Favourites <AiFillHeart className="icon" /></button>
                                            <button className="listOptions" onClick={() => this.updateLater(this.props.id)}> Watch Later <AiFillClockCircle className="icon" /></button>
                                            <button className="listOptions" onClick={() => this.updateCompleted(this.props.id)}>Completed <ImCheckmark className="icon" /></button>
                                        </div>
                                        : ''}
                                </div>
                                {/* description */}
                                <div className="mediaPageDescription">{text}</div>
                                <div className="mediaPageDescription">{text}</div>
                            </div>
                        </div>

                        {/* Other features */}
                        <div className="extraContainer">
                            <div className="extraInfoGrid"></div>
                            <div className="relationsContainer"></div>
                            <div className="recommendationsContainer"></div>





                        </div>

                    </>
                )
            }

        } else {
            return (
                <h1>LOADING...</h1>
            )
        }
    }
};

export default MediaPostPage;

//Date released, Category type: tv show, movie, actor etc, tags, rating
//Rating will be moved to full page view of mediaPost
//  <div className="ratings">
//      <h2>Average Rating:  {this.state.mediaInfo['avgRating']}</h2>
//      <h4>Add a graph here...</h4>
//      <h1>Rate this Title:</h1>
//      <Rating style={{fontSize: "3em"}} value={this.state.currRating} precision={0.5} emptyIcon={<StarBorderIcon fontSize="inherit" />} onChange={(event, newRating) => this.updateRating(newRating, this.props.id)} />
//  </div>


/* <h1 className="mediaPostTitle2"><strong>{this.state.mediaInfo['title']}</strong></h1>

<div className="mediaPostCategory2">{(this.state.mediaInfo['category']) ? this.state.mediaInfo['category'] : "N/A"}</div>
    <div className="ratings2">
        <div className="star2"><AiFillHeart /></div>
        <h2 className="ratingValue2">{(this.state.mediaInfo['avgRating']) ? this.state.mediaInfo['avgRating'] : "N/A"}</h2>
    </div>
    <h2 className="releaseDate2">{(this.state.mediaInfo['releaseDate']) ? this.state.mediaInfo['releaseDate'] : "N/A"}</h2>
    <div className="author2">{(this.state.mediaInfo['publisher']) ? this.state.mediaInfo['publisher'] : "N/A"}</div>

<div className="tagContainer2">
    {(this.state.mediaInfo['tags']) ? Object.keys(this.state.mediaInfo['tags']).slice(0, 4).map((keyName, i) => {
        return <div className="tag2">{keyName}</div>
    }) : "No tag"}

</div> */