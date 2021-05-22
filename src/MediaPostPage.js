import React from 'react';
import './MediaPostPage.css';
import { firestore } from './firebase';
import firebase from 'firebase/app';
// import envData from './envData';
import { Link } from 'react-router-dom';
import randomColor from 'randomcolor';
import ReviewPost from './ReviewPost';
import Rating from '@material-ui/lab/Rating';
import StarBorderIcon from '@material-ui/icons/StarBorder';
import {IoIosCheckmarkCircle} from 'react-icons/io';

import { AiFillHeart } from 'react-icons/ai';
// import { AiFillStar } from 'react-icons/ai';
import { AiFillClockCircle } from 'react-icons/ai';
import { ImCheckmark, ImTrophy } from 'react-icons/im';
import { HiPencilAlt } from 'react-icons/hi';

const text = "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum."

class MediaPostPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isLoaded: false,
            postType: this.props.postType,

            mediaInfo: {},
            mediaPostPic: '',
            currRating: 0,
            // completed: false,
            // hover: false,
            openOptions: false,
            popUp: false,
            listType: "",
            addedComplete: false,
            addedFavourite: false,
            addedLater: false,
            timer: '',
            reviews: []
        };
    }

    async setPopup(listType) {
        clearTimeout(this.state.timer);
        switch(listType) {
            case 'f':
                console.log('IN FAVS')
                this.setState({ popUp: true, listType: 'Favourites List' });
                break;
            case 'l':
                this.setState({ popUp: true, listType: 'Later List' });
                break;
            case 'c':
                this.setState({ popUp: true, listType: 'Completed List' });
                break;
            //default for future for lists
            default:
                this.setState({ popUp: true, listType: 'List' });
                break;
        }
        this.setState({timer: setTimeout(() => this.setState({ popUp: false }), 5000)});
    }

    async updateFavourite(id, needsUpdate) {
        //if we added to Favourites while on the page
        if(needsUpdate) {
            //if there is no user (might be able to take this out since I won't allow non users to change the needsUpdate)
            if(this.state.userId) {
                firestore.collection('users').doc(this.state.userId).collection('lists').doc('favouriteList').set(
                    { favouriteList: firebase.firestore.FieldValue.arrayUnion(id) },
                    { merge: true }
                );
                
            } 
        }
    }

    async updateLater(id, needsUpdate) {
        if(needsUpdate) {
            if(this.state.userId) {
                firestore.collection('users').doc(this.state.userId).collection('lists').doc('laterList').set(
                    { laterList: firebase.firestore.FieldValue.arrayUnion(id) },
                    { merge: true }    
                );
            }
        }
    }

    async updateCompleted(id, needsUpdate) {
        if(needsUpdate) {
            if(this.state.userId) {
                firestore.collection('users').doc(this.state.userId).collection('lists').doc('completedList').set(
                    { completedList: firebase.firestore.FieldValue.arrayUnion(id) },
                    { merge: true }
                );
            }
        }
    }

    async updateAvg(mediaId) {
        firestore.collection('posts').doc('books').collection('bookPosts').doc(mediaId).collection('userRatings').doc('userRatings').get().then((doc) => {
            if (doc.exists) {
                let userRatings = doc.data()['ratings'];
                let iterator = Object.values(userRatings);
                let size = iterator.length;
                let sum = 0;
                for (var i = 0; i < size; i++) {
                    sum += iterator[i];
                }
                console.log("sum: " + sum);
                console.log("size: " + size);
                console.log(Object.values(userRatings));
                firestore.collection('posts').doc('books').collection('bookPosts').doc(mediaId).set(
                    { avgRating: (sum / size) },
                    { merge: true }
                )
            }
        })
    }

    async updateRating(newRating, mediaId) {
        if(this.state.userId) {
            if (!newRating) {
                //if newRating doesn't exist user deleted their rating and delete from that books rating
                firestore.collection('users').doc(this.state.userId).collection('ratings').doc('books').set(
                    { [mediaId]: firebase.firestore.FieldValue.delete() },
                    { merge: true }
                )
                firestore.collection('posts').doc('books').collection('bookPosts').doc(mediaId).collection('userRatings').doc('userRatings').set(
                    { ratings: { [this.state.userId]: firebase.firestore.FieldValue.delete() } },
                    { merge: true }
                ).then(() => {
                    this.updateAvg(mediaId);
                }).catch((error) => {
                    console.log(error);
                })
            } else {
                firestore.collection('users').doc(this.state.userId).collection('ratings').doc('books').set({
                    [mediaId]: newRating,
                })
                firestore.collection('posts').doc('books').collection('bookPosts').doc(mediaId).collection('userRatings').doc('userRatings').set(
                    { ratings: { [this.state.userId]: newRating } },
                    { merge: true }
                ).then(() => {
                    this.updateAvg(mediaId);
                }).catch((error) => {
                    console.log(error);
                })
            }
            this.setState({ currRating: newRating }); 
        }
    }

    async getRating(mediaId) {
        if(this.state.userId) {
            var userDoc = firestore.collection('users').doc(this.state.userId);
            userDoc.collection('ratings').doc('books').get().then((doc) => {
                if (doc.exists) {
                    this.setState({ currRating: doc.data()[mediaId] });
                }
                //no else needed already set to 0
            })
        }
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

    retrieveUserReviews = () => {
        firestore.collection('posts').doc('books').collection('bookPosts').doc(this.props.id).collection('reviews').orderBy("likes", "desc").limit(4).get().then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
                // doc.data() is never undefined for query doc snapshots
                console.log(doc.id, " => ", doc.data());
                const newReviewPost = {
                    review_id: doc.id,
                    allReviewInfo: doc.data()
                }

                this.setState({ reviews: [...this.state.reviews, newReviewPost] })
            });
        })
            .catch((error) => {
                console.log("Error getting documents: ", error);
            });
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

    //update any information for the user when they leave the page (to prevent spam)
    async componentWillUnmount() {
        if(this.props.id) {
            this.updateRating(this.state.currRating, this.props.id);
            this.updateCompleted(this.props.id, this.state.addedComplete);
            this.updateFavourite(this.props.id, this.state.addedFavourite);
            this.updateLater(this.props.id, this.state.addedLater);
        }
        
    }

    componentDidMount() {
        firebase.auth().onAuthStateChanged((user) => {
            if(user) {
                this.setState({ userId: user.uid });
            }
            this.setState({ isLoaded: true });
        })

        firestore.collection('posts').doc('books').collection('bookPosts').doc(this.props.id).get().then((doc) => {
            if (doc.exists) {
                this.setState({ mediaInfo: doc.data(), isLoaded: true });
                this.getPicture('/mediaPosts/' + this.props.id + '.jpg');
                this.getRating(this.props.id);
            }
        });

        this.retrieveUserReviews();
        // console.log(this.state.reviews);

    }

    render() {
        if (this.state.isLoaded) {
            // if (this.state.postType === envData.MEDIA_POST_TYPES.FUNCTIONAL) {
            //     return (
            //         <>
            //             {(this.state.popUp) ? <div className="popUp">{this.state.mediaInfo['title']} was added to {this.state.listType}</div> : <></>}
            //             <div className="mediaContainer" onMouseEnter={this.onMouseEnterHandler} onMouseLeave={this.onMouseLeaveHandler}>
            //                 <div className="mediaPost" >
            //                     {/* picture of media*/}
            //                     <img className="mediaPostImg" src={this.state.mediaPostPic} alt={this.state.mediaInfo['title']} ></img>
            //                     {/* title */}
            //                     <h1 className="mediaPostTitle"><strong>{this.state.mediaInfo['title']}</strong></h1>
            //                 </div>
            //                 {(this.state.hover) ?
            //                     <>
            //                         <div className="mediaPostInfoBox">
            //                             {/* basic info depends on category temp will be actors*/}
            //                             <div className="mediaPostCategory">{(this.state.mediaInfo['category']) ? this.state.mediaInfo['category'] : "N/A"}</div>
            //                             <div className="ratings">
            //                                 <div className="star"><AiFillHeart /></div>
            //                                 <h2 className="ratingValue">{(this.state.mediaInfo['avgRating']) ? this.state.mediaInfo['avgRating'] : "N/A"}</h2>
            //                             </div>
            //                             <h2 className="releaseDate">{(this.state.mediaInfo['releaseDate']) ? this.state.mediaInfo['releaseDate'] : "N/A"}</h2>
            //                             <div className="author">{(this.state.mediaInfo['publisher']) ? this.state.mediaInfo['publisher'] : "N/A"}</div>
            //                             {/* limiting displayed tags to max 3, if it still overflows, it will be hidden */}
            //                             <div className="tagContainer">
            //                                 {(this.state.mediaInfo['tags']) ? Object.keys(this.state.mediaInfo['tags']).slice(0, 3).map((keyName, i) => {
            //                                     return <div className="tag">{keyName}</div>
            //                                 }) : "No tag"}
            //                             </div>
            //                         </div>

            //                         <div className="mediaPostButtons">
            //                             <button className="invisible" onClick={() => this.setState({ addedFavourite: true })}><AiFillHeart className="icon" /></button>
            //                             <button className="invisible" onClick={() => this.setState({ addedLater: true })}><AiFillClockCircle className="icon" /></button>
            //                             <button className="invisible" onClick={() => this.setState({ addedComplete: true })}><ImCheckmark className="icon" /></button>
            //                         </div>
            //                     </> : ''}
            //             </div>
            //         </>
            //     )


                //=====================================================================================Actual MPP==============  
            // } else {
                // console.log("MEDIA PP ID:", this.props.id);
                // console.log(randomColor());
                return (

                    <div className="container">
                        {(this.state.popUp) && <div className="popUp">
                            {this.state.mediaInfo['title']} was added to {this.state.listType}
                            <IoIosCheckmarkCircle style={{ fontSize: '16px', position: 'absolute', right: '15px', top: '11px' }} />
                        </div>}
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
                                    <button onClick={this.onClick} className="dropbtn2">Add to ...<i className="arrow down"></i></button>
                                    <div className="trophyButton"><ImTrophy className="icon" /></div>
                                    {(this.state.openOptions) ?
                                        <div className="dropdown-content2">
                                            <button className="listOptions" onClick={() => this.setPopup('f')}><AiFillHeart className="icon" /> Favourites </button>
                                            <button className="listOptions" onClick={() => this.setPopup('l')}><AiFillClockCircle className="icon" /> Watch Later </button>
                                            <button className="listOptions" onClick={() => this.setPopup('c')}><ImCheckmark className="icon" /> Completed </button>
                                        </div>
                                        : ''}
                                </div>
                                {/* description */}
                                <div className="mediaPageDescription">{text}</div>
                                <div className="mediaPageDescription">{text}</div>
                            </div>
                        </div>

                        {/* Other features */}

                        <div className="contentContainer">

                            <div className="sidebar">
                                {/* info going down left side */}
                                <div className="rateContainer">
                                    <div style={{ paddingLeft: '1rem' }} className="extraInfoTitle">Your Rating</div>
                                    <button className="rateButton">
                                        <Rating style={{ fontSize: "2em" }} value={this.state.currRating} precision={0.1} emptyIcon={<StarBorderIcon style={{ color: '686868' }} fontSize="inherit" />}
                                            onChange={(event, newRating) => this.setState({currRating: newRating})} />
                                    </button>
                                    <span className="yourRatingValue">{this.state.currRating}</span>
                                </div>
                                <div className="extraInfoContainer">
                                    <div className="extraInfoTitle">Average Rating</div>
                                    <div className="extraInfoValue">{(this.state.mediaInfo['avgRating']) ? this.state.mediaInfo['avgRating'] : "N/A"}</div>

                                    <div className="extraInfoTitle">Category</div>
                                    <div className="extraInfoValue">{(this.state.mediaInfo['category']) ? this.state.mediaInfo['category'] : "N/A"}</div>

                                    <div className="extraInfoTitle">Release date</div>
                                    <div className="extraInfoValue">{(this.state.mediaInfo['releaseDate']) ? this.state.mediaInfo['releaseDate'] : "N/A"}</div>

                                    <div className="extraInfoTitle">Publisher</div>
                                    <div className="extraInfoValue">{(this.state.mediaInfo['publisher']) ? this.state.mediaInfo['publisher'] : "N/A"}</div>

                                    {/* even more info ...example # of times favorited, watch listed, completed ... */}
                                </div>

                                <div className="allTagsContainer">
                                    <div className="extraInfoTitle" style={{ paddingBottom: "1rem" }}>Tags</div>
                                    {(this.state.mediaInfo['tags']) ? Object.keys(this.state.mediaInfo['tags']).map((keyName, i) => {
                                        let color = randomColor({
                                            luminosity: 'light',
                                            // hue: 'blue'
                                        });
                                        return <div className="tag" style={{ background: color }}>{keyName}</div>
                                    }) : <div className="extraInfoValue">No tags available :(</div>}

                                </div>

                                {/* <Link className="revLink" to={`/myreviews/write/${this.props.id}`} > */}
                                <Link className="revLink" to={{ pathname: `/review/write/${this.props.id}`, state: { mediaInfo: this.state.mediaInfo } }} >
                                    <button className="reviewButton">Write Review<HiPencilAlt className="icon" /></button>
                                </Link>
                            </div>

                            <div className="overviewContentContainer">
                                <div className="reviewsContainer">
                                    <div className="extraInfoTitle" style={{ marginBottom: "1rem" }}>Reviews</div>
                                    {(this.state.reviews.length === 0) ? (<div className="extraInfoValue" style={{ fontStyle: 'italic', fontWeight: '600' }}>There are no reviews for {this.state.mediaInfo['title']} yet...
                                        <Link className="revLink" style={{ fontStyle: 'italic', fontWeight: '700' }} to={{ pathname: `/review/write/${this.props.id}`, state: { mediaInfo: this.state.mediaInfo } }} >be the first </Link></div>)
                                        : (
                                            <div className="reviewsGrid">
                                                {this.state.reviews.map((post) => {
                                                    return <ReviewPost key={post.review_id} review_id={post.review_id} allReviewInfo={post.allReviewInfo} />
                                                })}

                                                {/* <ReviewPost />
                                                <ReviewPost />
                                                <ReviewPost />
                                                <ReviewPost /> */}
                                            </div>
                                        )}

                                </div>
                            </div>
                        </div>

                    </div>
                )
            // }

        } else {
            return (
                <h1>LOADING...</h1>
            )
        }
    }
};

export default MediaPostPage;