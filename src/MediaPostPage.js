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
import { IoIosCheckmarkCircle } from 'react-icons/io';

import { AiFillHeart } from 'react-icons/ai';
// import { AiFillStar } from 'react-icons/ai';
import { AiFillClockCircle } from 'react-icons/ai';
import { ImCheckmark, ImTrophy } from 'react-icons/im';
import { HiPencilAlt } from 'react-icons/hi';
import { AuthContext } from "./context";

import addNotificationToUserActivity from './firestoreHelperFunctions';
import ShowMoreText from 'react-show-more-text';

// const text = "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum."

class MediaPostPage extends React.Component {
    static contextType = AuthContext;
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

        this.tags = []; //contains objects {tag_name: asdf, tag_color: asdf}
    }

    async setPopup(listType) {
        clearTimeout(this.state.timer);
        switch (listType) {
            case 'f':
                this.setState({ popUp: true, listType: 'Favourites List', addedFavourite: true });
                break;
            case 'l':
                this.setState({ popUp: true, listType: 'Later List', addedLater: true });
                break;
            case 'c':
                this.setState({ popUp: true, listType: 'Completed List', addedComplete: true });
                break;
            //default for future for lists
            default:
                this.setState({ popUp: true, listType: 'List' });
                break;
        }
        this.setState({ timer: setTimeout(() => this.setState({ popUp: false }), 5000) });
    }

    async updateFavourite(id, needsUpdate) {
        //if we added to Favourites while on the page
        if (needsUpdate) {
            //if there is no user (might be able to take this out since I won't allow non users to change the needsUpdate)
            if (this.context.userId) {
                firestore.collection('users').doc(this.context.userId).collection('lists').doc('favouriteList').set(
                    { favouriteList: firebase.firestore.FieldValue.arrayUnion(id) },
                    { merge: true }
                );

                addNotificationToUserActivity(this.context.userId, this.props.id, `Favourited `, { title: this.state.mediaInfo['title'], pic: this.state.mediaPostPic });
            }
        }
    }

    async updateLater(id, needsUpdate) {
        if (needsUpdate) {
            if (this.context.userId) {
                firestore.collection('users').doc(this.context.userId).collection('lists').doc('laterList').set(
                    { laterList: firebase.firestore.FieldValue.arrayUnion(id) },
                    { merge: true }
                );

                addNotificationToUserActivity(this.context.userId, this.props.id, `Plans to watch `, { title: this.state.mediaInfo['title'], pic: this.state.mediaPostPic });
            }
        }
    }

    async updateCompleted(id, needsUpdate) {
        if (needsUpdate) {
            if (this.context.userId) {
                firestore.collection('users').doc(this.context.userId).collection('lists').doc('completedList').set(
                    { completedList: firebase.firestore.FieldValue.arrayUnion(id) },
                    { merge: true }
                );

                addNotificationToUserActivity(this.context.userId, this.props.id, `Completed `, { title: this.state.mediaInfo['title'], pic: this.state.mediaPostPic });
            }
        }
    }

    async updateAvg(mediaId) {
        firestore.collection('posts').doc('books').collection('bookPosts').doc(mediaId).collection('userRatings').get().then((snapshot) => {
            let sum = 0;
            let size = snapshot.docs.length;
            snapshot.docs.forEach((doc) => {
                let userRating = doc.data()['rating'];
                sum += userRating;
            })
            console.log(sum + '/' + size);
            firestore.collection('posts').doc('books').collection('bookPosts').doc(mediaId).set(
                { avgRating: Math.round((sum / size) * 10) / 10 },
                { merge: true }
            )
        })
    }

    async updateRating(newRating, mediaId) {
        if (this.context.userId) {
            if (!newRating) {
                //if newRating doesn't exist user deleted their rating and delete from that books rating
                firestore.collection('users').doc(this.context.userId).collection('ratings').doc('books').update({
                    [mediaId]: firebase.firestore.FieldValue.delete()
                })
                firestore.collection('posts').doc('books').collection('bookPosts').doc(mediaId).collection('userRatings').doc(this.context.userId).delete().then(() => {
                    this.updateAvg(mediaId);
                }).catch((error) => {
                    console.log(error);
                })
            } else {
                firestore.collection('users').doc(this.context.userId).collection('ratings').doc('books').set(
                    { [mediaId]: newRating },
                    { merge: true },
                )
                firestore.collection('posts').doc('books').collection('bookPosts').doc(mediaId).collection('userRatings').doc(this.context.userId).set(
                    { rating: newRating },
                ).then(() => {
                    this.updateAvg(mediaId);
                }).catch((error) => {
                    console.log(error);
                })
            }
        }
    }

    async getRating(mediaId) {
        if (this.context.userId) {
            var userDoc = firestore.collection('users').doc(this.context.userId);
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
        if (this.context.userId) {
            this.setState({ openOptions: !this.state.openOptions });
        }
    }

    generateColoredTags = () => {
        if (this.state.mediaInfo['tags']) {
            Object.keys(this.state.mediaInfo['tags']).forEach((keyName, i) => {
                let color = randomColor({
                    luminosity: 'light',
                    // hue: 'blue'
                });
                this.tags.push({ tag_name: keyName, tag_color: color });
            });
        }
    }

    //update any information for the user when they leave the page (to prevent spam)
    componentWillUnmount() {
        if (this.props.id) {
            this.updateRating(this.state.currRating, this.props.id);
            this.updateCompleted(this.props.id, this.state.addedComplete);
            this.updateFavourite(this.props.id, this.state.addedFavourite);
            this.updateLater(this.props.id, this.state.addedLater);
            for (var key in localStorage) {
                if (key.substring(0, (this.props.id).length) === this.props.id) {
                    localStorage.removeItem(key);
                }
            }
        }
    }

    componentDidUpdate() {
        //save info to local storage
        if (typeof (Storage) !== "undefined") {
            localStorage.setItem(this.props.id + '.completedList', (this.state.addedComplete).toString());
            localStorage.setItem(this.props.id + '.favouriteList', (this.state.addedFavourite).toString());
            localStorage.setItem(this.props.id + '.laterList', (this.state.addedLater).toString());
            localStorage.setItem(this.props.id + '.rating', (this.state.currRating));
        }
    }

    componentDidMount() {
        if (typeof (Storage) !== "undefined") {
            let local_completedStr = localStorage.getItem(this.props.id + '.completedList') || 'false';
            let local_completed = (local_completedStr === 'true'); //string to bool conversion

            let local_favouriteStr = localStorage.getItem(this.props.id + '.favouriteList') || 'false';
            let local_favourite = (local_favouriteStr === 'true');

            let local_laterStr = localStorage.getItem(this.props.id + '.laterList') || 'false';
            let local_later = (local_laterStr === 'true');

            let local_rating = localStorage.getItem(this.props.id + '.rating') || 0;

            this.setState({
                addedComplete: local_completed,
                addedFavourite: local_favourite,
                addedLater: local_later,
                currRating: local_rating,
            })
        }

        firestore.collection('posts').doc('books').collection('bookPosts').doc(this.props.id).get().then((doc) => {
            if (doc.exists) {
                this.setState({ mediaInfo: doc.data(), isLoaded: true });
                this.getPicture('/mediaPosts/' + this.props.id + '.jpg');
                this.getRating(this.props.id);
                this.generateColoredTags();
            }
        });

        this.retrieveUserReviews();
    }

    render() {
        if (this.state.isLoaded) {
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
                            <div className="infoGrid-left">
                                {/* picture of media*/}
                                <img className="mediaPageImg" src={this.state.mediaPostPic} alt={this.state.mediaInfo['title']}></img>
                                {/* buttons */}
                                <div className="mediaPageButtons">
                                    <button onClick={this.onClick} className="dropbtn2">Add to ...<i className="arrow down"></i></button>
                                    <div className="trophyButton"><ImTrophy className="trophy-icon" /></div>
                                    {(this.state.openOptions) ?
                                        <div className="dropdown-content2">
                                            <button className="listOptions" onClick={() => this.setPopup('f')}>Favourites<AiFillHeart className="listOptions-icon" />  </button>
                                            <button className="listOptions" onClick={() => this.setPopup('l')}>Watch Later<AiFillClockCircle className="listOptions-icon" />  </button>
                                            <button className="listOptions" onClick={() => this.setPopup('c')}>Completed<ImCheckmark className="listOptions-icon" />  </button>
                                        </div>
                                        : ''}
                                </div>
                            </div>
                            <div className="infoGrid-right">
                                {/* title */}
                                <div className="mediaPageTitle">{this.state.mediaInfo['title']}</div>

                                {/* description */}
                                {/* <div className="mediaPageDescription">{this.state.mediaInfo['summary']}</div> */}
                                <ShowMoreText
                                    lines={3}
                                    more='Show more'
                                    less='Show less'
                                    className='mediaPageDescription'
                                    anchorClass='showmore-anchor'
                                    onClick={this.executeOnClick}
                                    expanded={false}
                                    width={0}
                                >
                                    {this.state.mediaInfo['summary']}
                                </ShowMoreText>

                                <div className="mediaPage-nav"> Navbar placeholder</div>
                            </div>
                        </div>
                    </div>

                    {/* Other features */}

                    <div className="contentContainer">
                        <div className="sidebar">
                            {/* info going down left side */}
                            <div className="rateContainer">
                                <div style={{ paddingLeft: '1rem' }} className="extraInfoTitle">Your Rating</div>
                                <button className="rateButton">
                                    {(this.context.userId) ?
                                        <Rating name="rating" style={{ fontSize: "2em" }} value={this.state.currRating || 0} precision={0.1} emptyIcon={<StarBorderIcon style={{ color: '686868' }} fontSize="inherit" />}
                                            onChange={(event, newRating) => this.setState({ currRating: newRating })} /> :
                                        <Rating name="rating" style={{ fontSize: "2em" }} emptyIcon={<StarBorderIcon style={{ color: '686868' }} fontSize="inherit" />} disabled />
                                    }
                                </button>
                                <span className="yourRatingValue">{this.state.currRating}</span>
                            </div>
                            <div className="extraInfoContainer info">
                                <div className="extraInfoTitle">Average Rating</div>
                                <div className="extraInfoValue">{(this.state.mediaInfo['avgRating']) ? this.state.mediaInfo['avgRating'] : "N/A"}</div>

                                <div className="extraInfoTitle">Category</div>
                                <div className="extraInfoValue">{(this.state.mediaInfo['category']) ? this.state.mediaInfo['category'] : "N/A"}</div>

                                <div className="extraInfoTitle">Release date</div>
                                <div className="extraInfoValue">{(this.state.mediaInfo['releaseDate']) ? this.state.mediaInfo['releaseDate'] : "N/A"}</div>

                                <div className="extraInfoTitle">Author</div>
                                <div className="extraInfoValue">{(this.state.mediaInfo['author']) ? this.state.mediaInfo['author'] : "N/A"}</div>

                                <div className="extraInfoTitle">Publisher</div>
                                <div className="extraInfoValue">{(this.state.mediaInfo['publisher']) ? this.state.mediaInfo['publisher'] : "N/A"}</div>

                                {/* even more info ...example # of times favorited, watch listed, completed ... */}
                            </div>

                            <div className="extraInfoContainer tags">
                                <div className="extraInfoTitle" style={{ paddingBottom: "1rem" }}>Tags</div>
                                {(this.tags.length !== 0) ? (this.tags).map((tag) => {
                                    return <div className="tag-mpp" style={{ background: tag.tag_color }}>{tag.tag_name}</div>
                                }) : <div className="extraInfoValue">No tags available :(</div>}

                            </div>

                            {/* <Link className="revLink" to={`/myreviews/write/${this.props.id}`} > */}
                            <Link className="revLink" to={{ pathname: `/review/write/${this.props.id}`, state: { mediaInfo: this.state.mediaInfo } }} >
                                <button className="reviewButton">Write Review<HiPencilAlt className="reviewButton-icon" /></button>
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
                                        </div>
                                    )}
                            </div>
                        </div>
                    </div>
                </div>
            )
        } else {
            return (
                <h1>LOADING...</h1>
            )
        }
    }
};

export default MediaPostPage;