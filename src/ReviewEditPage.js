import React from 'react';
import './ReviewEditPage.css';
import TextareaAutosize from 'react-textarea-autosize';
import { firestore } from './firebase';
import firebase from 'firebase/app';


/* KNOWN ISSUES:
textarea cheese issues
BAD WORD FILTER!
Not saving textarea on reload page

Being able to click submit multiple times to add many documents
Prevent users from pressing back button to try and submit again

SOLUTION: an error message saying user already submitted a review for this media title would be fine 
i.e a firestore query for reviews for thie media post for uid == current uid
+ send to the ReviewPage


TODO: Edit feature
idea: already have the findUserReview function, just call it to find the user review, if it exists, populate the states with the info in component did mount
user now has ability to modify values and press save again, but this time, we use .doc(review_id).set(newData) so we dont add a new post
*/

class ReviewEditPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            containsSpoiler: false,
            text: '',
            summary: '',
            score: 2.5,
            numberCompleted: 0,

            duplicateReview: false, //used to determine if this is users 2nd review, if so, do not let them submit

            mediaInfo: this.props.location.state.mediaInfo
        };

        this.category = null;
        this.categoryPosts = null;
        this.reviewAuthor = null;
        this.reviewAuthorName = null;


        this.SUMMARY_MIN = 20;
        this.SUMMARY_LETTER_MIN = 10;
        this.SUMMARY_MAX = 120;

        this.REVIEW_MIN = 240;
        this.REVIEW_LETTER_MIN = 200;
        this.REVIEW_MAX = 4800;

        
    }

    componentDidMount() {
        //temporary fix to bypass user id == null error

        firebase.auth().onAuthStateChanged((user) => {
            if (user) {
                this.reviewAuthor = firebase.auth().currentUser.uid;
                this.reviewAuthorName = firebase.auth().currentUser.displayName;
                //edge case where props arent passed properly because user clicks "be the first" on MPP before reviews are loaded in
                //we will retrieve info from DB (else statment) if that is the case
                if (Object.keys(this.props.location.state.mediaInfo).length) {
                    console.log(this.props.location.state.mediaInfo)
                    this.category = this.state.mediaInfo['category'].toLowerCase();
                    this.categoryPosts = this.category.slice(0, -1) + 'Posts';
                }
                else {
                    console.log('media info prop is empty...retrieving from firestore');
                    this.getMediaPost();
                }
                //this.findUserReviews(); //uncomment to prevent users from writing duplicate reviews
            } else {
                // No user is signed in.
            }
        });
    }

    //Design Note: decided to change <form> to <div> and put onSubmit into onClick for the Save button instead, makes it clearer i guess.
    //However, the ability to use inputs is quite nice
    render() {
        // console.log(this.props.location.state.mediaInfo);
        return (
            <div className="pageContainer">
                <div className="form" >
                    <label className="formLabel" htmlFor="completion">How many TO_DETERMINE have you completed for {this.state.mediaInfo['title']} as of writing this review?</label><br></br>
                    <input className="formInput" id="completion" type="number" onChange={(e) => this.setState({ numberCompleted: e.target.value })} value={this.state.numberCompleted} min="0" max="100"></input><br></br>
                    {/* can determine max based on media post props data */}




                    <label className="formLabel" htmlFor="reviewSummary">Review summary</label><br></br>
                    <TextareaAutosize
                        className="reviewSummary"
                        id="reviewSummary"
                        // maxLength={this.SUMMARY_MAX} design team: the warning message is kinda of useless if i just limit the text box to SUMMARY_MAX characters anyways, also limiting makes it seems like its broken
                        minLength={this.SUMMARY_MIN}
                        onChange={(e) => this.setState({ summary: e.target.value })} value={this.state.summary}> </TextareaAutosize> <br></br>


                    <label className="formLabel" htmlFor="reviewText">Your review</label><br></br>
                    <TextareaAutosize
                        className="reviewText"
                        maxLength={this.REVIEW_MAX}
                        minLength={this.REVIEW_MIN}
                        id="reviewText"
                        onChange={(e) => this.setState({ text: e.target.value })} value={this.state.text}>
                    </TextareaAutosize><br></br>


                    {/* range will change based on if we want to do /5 with stars or just number */}
                    <label className="formLabel" htmlFor="score">Score</label><br></br>
                    <input className="formInput" id="score" type="number" onChange={this.handleScoreChange} value={this.state.score} min="0" max="5" step="0.1"></input><br></br>


                    <label className="formLabel" htmlFor="spoilers">Contains spoilers?</label><br></br>
                    <select className="formInput" id="spoilers" value={this.state.containsSpoiler} onChange={(e) => { this.setState({ containsSpoiler: e.target.value }, () => console.log(this.state.containsSpoiler)); }}>
                        <option value="true">Yes</option>
                        <option value="false">No</option>
                    </select><br></br>

                    {/* <div className="saveButton" onClick={this.handleSubmit}>Save</div> */}


                    {/*submit with error messages COMMENTED OUT FOR TESTING PURPOSE ONLY
                     NOTE: for some reason <button> has different CSS implications than div... so the save and edit button are set to div elements for now*/}
                    {(this.state.duplicateReview) ? (
                        <>
                            <div className="warningMessage">You have already written a review </div>
                            <div className="saveButton" >Edit</div>
                        </>
                    ) :
                        <>
                            {(this.state.text.length >= this.REVIEW_MIN && (this.state.summary.length >= this.SUMMARY_MIN && this.state.summary.length <= this.SUMMARY_MAX)) ?
                                (<div className="saveButton" onClick={this.handleSubmit}>Save</div>) : ''}


                            {(this.state.summary.length < this.SUMMARY_MIN || this.state.summary.length > this.SUMMARY_MAX) ? <div className="warningMessage">Summary must have a minimum of {this.SUMMARY_MIN} and not exceed {this.SUMMARY_MAX} characters ({this.state.summary.length}) </div> :
                                (this.getTextLetterCount(this.state.summary) < this.SUMMARY_LETTER_MIN ? <div className="warningMessage">Summary must have a minimum of {this.SUMMARY_LETTER_MIN} letters ({this.getTextLetterCount(this.state.summary)}) </div>
                                    : '')}

                            {(this.state.text.length < this.REVIEW_MIN) ?
                                <div className="warningMessage">Review must have a minimum of {this.REVIEW_MIN} characters ({this.state.text.length}) </div> :
                                (this.getTextLetterCount(this.state.text) < this.REVIEW_LETTER_MIN ? <div className="warningMessage">Review must have a minimum of {this.REVIEW_LETTER_MIN} letters ({this.getTextLetterCount(this.state.text)}) </div>
                                    : '')}
                        </>
                    }

                </div>

            </div>
        )
    }

    handleScoreChange = (e) => {
        if (e.target.valueAsNumber > 5) {
            this.setState({ score: 5 })
        }
        else if (e.target.valueAsNumber < 0) {
            this.setState({ score: 0 })
        }
        else {

            this.setState({ score: e.target.value })
        }

    }

    handleSubmit = (e) => {
        e.preventDefault();

        // console.log(this.props.id); //given through Router in App.js  dont need thi: this.props.match.params.id
        // console.log(categoryPosts);
        // console.log(reviewAuthor);

        // If timestamp is null, assume we've gotten a brand new message.
        // // https://stackoverflow.com/a/47781432/4816918
        // let newTimestamp = timestamp ? timestamp.toMillis() : Date.now();
        // let displayTime = timestamp ? timestamp.toDate().toDateString() : Date.now();

        //need to validate score value before submission:
        if (isNaN(parseFloat(this.state.score))) {
            alert("please enter a number for score dud");
        }

        else {
            let roundedScore = Number.parseFloat(this.state.score).toPrecision(2); //round to 2 DIGITS (not 2 decimal places!) i.e 2.54321 => 2.5

            const newReview = {
                uid: this.reviewAuthor,
                username: this.reviewAuthorName,
                likes: 0,
                dislikes: 0,

                reviewInfo: {
                    text: this.state.text,
                    summary: this.state.summary,
                    containsSpoiler: this.state.containsSpoiler,
                    score: roundedScore,
                    numberCompleted: this.state.numberCompleted,
                    timestamp: firebase.firestore.FieldValue.serverTimestamp(),

                    title: this.state.mediaInfo['title'],
                    mid: this.props.id
                    //may need this if i dont pass all above info through props including these 2
                }
            };

            let dbRef = firestore.collection('posts').doc(this.category).collection(this.categoryPosts).doc(this.props.id).collection('reviews');
            //because this is the publishing review page, the number of likes is naturally 0 but will be modified by a button on different review components
            dbRef.add(
                newReview
            ).then((docRef) => {
                console.log("Review Document written with ID: ", docRef.id); //this.props.id represents the media post id here, docRef.id is newly added review id

                //add review to the user reviews collection so that they can view it later
                firestore.collection('users').doc(this.reviewAuthor).collection('reviews').doc(docRef.id).set(newReview).then(() => {
                    console.log("Document successfully added to user reviews collection!");

                    //lets us change the url after the review document is added
                    this.props.history.push({
                        pathname: `/review/${docRef.id}`,
                        //search: '?query=abc',
                        state: { allReviewInfo: newReview } //this.props.location.state.allReviewInfo
                    });


                }).catch((error) => {
                    console.error("Error writing document to user: ", error);
                });

                //distribution counter for likes and dislikes
                //for likes/dislikes distribution counter
                const NUM_SHARDS = 10; //number of shards for distribution counter
                let likeCounterDocRef = dbRef.doc(docRef.id).collection('counters').doc('likesCounter')
                let dislikeCounterDocRef = dbRef.doc(docRef.id).collection('counters').doc('dislikesCounter')
                this.createCounter(likeCounterDocRef, NUM_SHARDS);
                this.createCounter(dislikeCounterDocRef, NUM_SHARDS);

            }).catch((error) => {
                console.error("Error adding document to mediapost reviews: ", error);
            });


        }

    }

    getTextLetterCount = (text) => {
        // const whiteSpace = /([\s]+)/g;
        // const len = text.length - (text.match(whiteSpace) || []).length;

        var letterRX = /[a-z]/gi;
        var len = (text.match(letterRX) || []).length;

        //console.log(len);
        return len;
    }

    //searches reviews of the currennt mediapost using users UID, if a review is found, prevent the user from writing another
    findUserReviews = () => {
        const query = firestore
            .collection('posts').doc(this.category)
            .collection(this.categoryPosts).doc(this.props.id)
            .collection('reviews')
            .where('uid', '==', this.reviewAuthor);

        query.get().then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
                this.setState({ duplicateReview: true });
                console.log('found existing user review', doc.id);
            });
        })
            .catch((error) => {
                console.log("Error getting documents: ", error);
            });
    }

    //used for edgecase
    getMediaPost = () => {
        firestore.collection('posts').doc('books').collection('bookPosts').doc(this.props.id).get().then((doc) => {
            if (doc.exists) {
                this.setState({ mediaInfo: doc.data() }, () => {
                    this.category = this.state.mediaInfo['category'].toLowerCase();
                    this.categoryPosts = this.category.slice(0, -1) + 'Posts';
                });


            }
        });
    }

    //likes/dislikes distribution counter
    createCounter = (ref, num_shards) => {
        var batch = firestore.batch();
    
        // Initialize the counter document
        batch.set(ref, { num_shards: num_shards });
    
        // Initialize each shard with count=0
        for (let i = 0; i < num_shards; i++) {
            const shardRef = ref.collection('shards').doc(i.toString());
            batch.set(shardRef, { count: 0 });
        }
    
        // Commit the write batch
        return batch.commit();
    }

}

export default ReviewEditPage;