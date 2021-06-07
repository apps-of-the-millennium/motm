import React from 'react';
import './ReviewPage.css';
import { firestore } from './firebase';
import firebase from 'firebase/app';
import { AuthContext } from "./context";

import { Link } from 'react-router-dom';

import { IoMdThumbsDown, IoMdThumbsUp } from 'react-icons/io';

// const testText = 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industrys standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.';

/*EXTRA TODOS:
    completed info
    user-select is super jank, cant deselect outside of summary box
    refreshing does not trigger component will unmount () !!!
    a failsafe if the user tries to see the reviewpage and the page does not have props, i.e we need to retrieve the info
    the distrubtion counter for likes doesnt fix the slow update issue: 
    ^ THIS ISSUE IS MOST LIKELY DUE TO THE SAME SHARD BEING UPDATED, I INCREASED SHARD COUNT TO 10, WILL MONITOR IF ISSUE PERISTS
    NOW WE CANT SHOW TOP LIKED REVIEWS WITH FUCKING DISTRIUTION COUNTERS!
*/
class ReviewPage extends React.Component {
    static contextType = AuthContext;
    static previousContext;

    constructor(props) {
        super(props);
        this.state = {
            liked: false,
            disliked: false
        };

        //this.props.allReviewInfo
        //design note: reviewId is kind of useless (can't use it as fall back when props do not exist, to try: loading the review page straight from url)

        //for changing color of score label based on score
        this.HIGH_SCORE = 4;
        this.MID_SCORE = 3;

        this.NUM_SHARDS = 10; //number of shards for distribution counter

        this.current_user = null;

        //for the current User...perhaps we can make it global one day
        this.reviewsLiked = [];
        this.reviewsDisliked = [];

        this.likeCounterDocRef = firestore.collection('posts').doc('books').collection('bookPosts').doc(this.props.location.state.allReviewInfo.reviewInfo.mid).collection('reviews').doc(this.props.id).collection('counters').doc('likesCounter')
        this.dislikeCounterDocRef = firestore.collection('posts').doc('books').collection('bookPosts').doc(this.props.location.state.allReviewInfo.reviewInfo.mid).collection('reviews').doc(this.props.id).collection('counters').doc('dislikesCounter')
    }

    async componentDidMount() {
        this.previousContext = this.context;

        if(this.context.userId) {
            this.current_user = this.context.userId; //user.uid;
            await this.getBothUserReviewCollections();
            //this.updateLikeAndDislikeState();

            //=======SessionStorage stuff...noticeably faster than above method but I realized that we HAVE to call getBothUserReviewCollections regardless, so I am removing it for now===
            if (typeof (Storage) !== "undefined") {
                let sessionLiked = sessionStorage.getItem(this.props.id + '.liked') || -1;
                let sessionDisliked = sessionStorage.getItem(this.props.id + '.disliked') || -1;

                if (sessionLiked !== -1 && sessionDisliked !== -1) {
                    console.log('using Session Storage');
                    const convertLikedToBool = (sessionLiked === 'true');
                    const convertDislikedToBool = (sessionDisliked === 'true');
                    this.setState({ liked: convertLikedToBool, disliked: convertDislikedToBool }, () => { console.log('liked/disliked:', this.state.liked, this.state.disliked) });
                } else {
                    console.log('using Firestore');
                    // await this.getBothUserReviewCollections();
                    this.updateLikeAndDislikeState();
                    
                }
            } else {
                console.log('using Firestore');
                // await this.getBothUserReviewCollections();
                this.updateLikeAndDislikeState();
            }
        }
    }

    //Possibily a huge issue with saving to local or session storage onClick, it doesnt work on the first click unless the setItem is directly invoked and NOT nested in a function
    componentDidUpdate() {
        if (typeof (Storage) !== "undefined") {
            sessionStorage.setItem(this.props.id + '.liked', (this.state.liked).toString());
            sessionStorage.setItem(this.props.id + '.disliked', (this.state.disliked).toString());
        }
    }

    async componentWillUnmount() {
        this.updateReviewLikedInfo();
    }

    render() {
        // console.log(this.props.location.state.allReviewInfo);
        let timestamp = this.props.location.state.allReviewInfo.reviewInfo.timestamp;
        let containsSpoiler = this.props.location.state.allReviewInfo.reviewInfo.containsSpoiler;
        let score = this.props.location.state.allReviewInfo.reviewInfo.score;
        let mid = this.props.location.state.allReviewInfo.reviewInfo.mid;
        let title = this.props.location.state.allReviewInfo.reviewInfo.title;

        return (
            <div className="reviewPageContainer">

                <div className="rp-coverContainer">
                    <Link style={{ textDecoration: 'none' }} to={`/mediapost/${mid}`}> <div className="rp-title">{title}</div> </Link>
                </div>

                <div className="rp-contentContainer">
                    <div className="rp-infoContainer">
                        <div className="rp-info-1">
                            <div className='rp-info-label'>A review by </div>
                            <div style={{ marginTop: '12px' }}>
                                <span className='rp-info-username'><Link style={{ color: 'inherit', textDecoration: 'none' }} to={`/profile/${this.props.location.state.allReviewInfo.uid}`}> {this.props.location.state.allReviewInfo.username}</Link></span>
                                <span className='rp-info-date'>{new Date(timestamp.seconds * 1000).toLocaleDateString("en-US")}</span>
                            </div>


                        </div>
                        <div className="rp-info-2">
                            <div className='rp-info-label'>Completed</div>
                            <div className="rp-info-big-label">{this.props.location.state.allReviewInfo.reviewInfo.numberCompleted}<span style={{ fontSize: '12px' }}> of Y</span></div>
                        </div>
                        <div className="rp-info-3">
                            <div className='rp-info-label'>Score</div>
                            <div style={{ background: this.getScoreColor(score) }} className='rp-info-big-label'>{score}<span style={{ fontSize: '12px' }}>/5</span></div>
                        </div>
                    </div>
                    {(containsSpoiler) ? <div style={{ width: '90%', margin: '1rem auto' }} className="warningMessage">Warning: Contains Spoilers</div> : <></>}
                    <div className="rp-textContainer">
                        {/* {this.props.location.state.allReviewInfo.reviewInfo.text} */}
                        <div className='rp-text'>{this.props.location.state.allReviewInfo.reviewInfo.text}</div>
                    </div>
                </div>

                <div className="rp-helpfulContainer">
                    <div className="rp-helpful-title">Was this helpful?</div>
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                        {(this.state.liked) ?
                            <div onClick={this.onClickLiked}><IoMdThumbsUp className='rp-helpful-icon-selected' /></div>
                            : <div onClick={this.onClickLiked}><IoMdThumbsUp className='rp-helpful-icon' /></div>
                        }

                        {(this.state.disliked) ?
                            <div onClick={this.onClickDisliked}><IoMdThumbsDown className='rp-unhelpful-icon-selected' /></div>
                            : <div onClick={this.onClickDisliked}><IoMdThumbsDown className='rp-unhelpful-icon' /></div>
                        }
                    </div>

                </div>


            </div>
        )
    }

    onClickLiked = () => {
        this.setState({ liked: !this.state.liked, disliked: false });
    }

    onClickDisliked = () => {
        this.setState({ disliked: !this.state.disliked, liked: false });
    }

    convertTimestamp = (timestamp) => {
        let date = new Date(timestamp.seconds * 1000 + timestamp.nanoseconds / 100000)
        return date;
    }

    getScoreColor = (score) => {
        if (score >= this.HIGH_SCORE) //high
            return '#41ca95';
        else if (score >= this.MID_SCORE) //mid
            return '#ecea58';
        else //low
            return '#fc5656';
    }

    updateReviewLikedInfo = () => {
        //Pull reviewsLiked and disliked
        if (this.state.liked && !this.reviewsLiked.includes(this.props.id)) {
            //add to reviewsLiked and increment review liked counter
            firestore.collection('users').doc(this.current_user).collection('reviewsLiked').doc(this.props.id).set(
                this.props.location.state.allReviewInfo
            ).then(() => {
                console.log("Document successfully written!");
            }).catch((error) => {
                console.error("Error writing document: ", error);
            });

            //figure out how to get other categoires when they arrive
            //leaving this here as what i did before changing it to distribution counters
            //NOTE: this solution will fail if 2 writes are done at the same time (with 1 sec) on the review document, HOWEVER it lets us retrieve reviews based on # of likes
            // firestore.collection('posts').doc('books').collection('bookPosts').doc(this.props.location.state.allReviewInfo.reviewInfo.mid).collection('reviews').doc(this.props.id).update({
            //     likes: firebase.firestore.FieldValue.increment(1)
            // }).then(() => {
            //     console.log("Document successfully updated!");
            // }).catch((error) => {
            //     // The document probably doesn't exist.
            //     console.error("Error updating document: ", error);
            // });

            this.incrementCounter(this.likeCounterDocRef, this.NUM_SHARDS, 1);

            //edgecase where user disliked the review before liking it
            if (this.reviewsDisliked.includes(this.props.id)) {
                firestore.collection('users').doc(this.current_user).collection('reviewsDisliked').doc(this.props.id).delete().then(() => {
                    console.log("Document successfully deleted!");
                }).catch((error) => {
                    console.error("Error removing document: ", error);
                });


                this.incrementCounter(this.dislikeCounterDocRef, this.NUM_SHARDS, -1);
            }

        }

        else if (this.state.disliked && !this.reviewsDisliked.includes(this.props.id)) {
            //add to reviewsdisLiked and increment review disliked counter
            firestore.collection('users').doc(this.current_user).collection('reviewsDisliked').doc(this.props.id).set(
                this.props.location.state.allReviewInfo
            ).then(() => {
                console.log("Document successfully written!");
            }).catch((error) => {
                console.error("Error writing document: ", error);
            });


            this.incrementCounter(this.dislikeCounterDocRef, this.NUM_SHARDS, 1);

            //case where user liked the review before and is disliking: remove the id from reviewsLiked in db and decrement likes
            if (this.reviewsLiked.includes(this.props.id)) {
                firestore.collection('users').doc(this.current_user).collection('reviewsLiked').doc(this.props.id).delete().then(() => {
                    console.log("Document successfully deleted!");
                }).catch((error) => {
                    console.error("Error removing document: ", error);
                });

                this.incrementCounter(this.likeCounterDocRef, this.NUM_SHARDS, -1);
            }

        }

        else if (!this.state.liked && this.reviewsLiked.includes(this.props.id)) {
            firestore.collection('users').doc(this.current_user).collection('reviewsLiked').doc(this.props.id).delete().then(() => {
                console.log("Document successfully deleted!");
            }).catch((error) => {
                console.error("Error removing document: ", error);
            });



            this.incrementCounter(this.likeCounterDocRef, this.NUM_SHARDS, -1);
        }

        else if (!this.state.disliked && this.reviewsDisliked.includes(this.props.id)) {
            firestore.collection('users').doc(this.current_user).collection('reviewsDisliked').doc(this.props.id).delete().then(() => {
                console.log("Document successfully deleted!");
            }).catch((error) => {
                console.error("Error removing document: ", error);
            });



            this.incrementCounter(this.dislikeCounterDocRef, this.NUM_SHARDS, -1);
        }
    }

    getBothUserReviewCollections = async () => {
        await firestore.collection('users').doc(this.current_user).collection('reviewsLiked').get().then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
                this.reviewsLiked.push(doc.id);
                // doc.data() is never undefined for query doc snapshots
                // console.log(doc.id, " => ", doc.data());
            });

            //this was here was this function wasnt async, may revert back to non async if sessionStorage is removed from design
            // if (this.reviewsLiked.includes(this.props.id)) {
            //     this.setState({ liked: true , disliked: false}, () => {
            //         if (typeof (Storage) !== "undefined") {
            //             sessionStorage.setItem(this.props.id + '.liked', 'true');
            //             sessionStorage.setItem(this.props.id + '.disliked', 'false');
            //         }
            //     })
            // }
        });

        await firestore.collection('users').doc(this.current_user).collection('reviewsDisliked').get().then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
                this.reviewsDisliked.push(doc.id);
            });

            // if (this.reviewsDisliked.includes(this.props.id)) {
            //     this.setState({ disliked: true, liked: false }, () => {
            //         if (typeof (Storage) !== "undefined") {
            //             sessionStorage.setItem(this.props.id + '.disliked', 'true');
            //             sessionStorage.setItem(this.props.id + '.liked', 'false');
            //         }
            //     })
            // }
        });

        return true;
    }

    //only used after a call to getBothUserReviewCollections is complete if needed
    //only exists if getBothUserReviewCollections is async
    updateLikeAndDislikeState = () => {
        console.log(this.reviewsLiked);
        if (this.reviewsLiked.includes(this.props.id)) {
            this.setState({ liked: true , disliked: false}, () => {
                if (typeof (Storage) !== "undefined") {
                    sessionStorage.setItem(this.props.id + '.liked', 'true');
                    sessionStorage.setItem(this.props.id + '.disliked', 'false');
                }
            })
        }

        if (this.reviewsDisliked.includes(this.props.id)) {
            this.setState({ disliked: true, liked: false }, () => {
                if (typeof (Storage) !== "undefined") {
                    sessionStorage.setItem(this.props.id + '.disliked', 'true');
                    sessionStorage.setItem(this.props.id + '.liked', 'false');
                }
            })
        }
        console.log(this.reviewsDisliked);
    }

    //================== DISTRIBUTED COUNTER
    incrementCounter = (docRef, numShards, valueToIncrement) => {
        const shardId = Math.floor(Math.random() * numShards);
        const shardRef = docRef.collection('shards').doc(shardId.toString());
        return shardRef.set({ count: firebase.firestore.FieldValue.increment(valueToIncrement) }, { merge: true });
    }







} ///EOF

export default ReviewPage;