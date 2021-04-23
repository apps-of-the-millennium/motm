import React from 'react';
import './MediaPost.css';
import { firestore, firebaseApp } from './firebase';
import firebase from 'firebase/app';
import Rating from '@material-ui/lab/Rating';
import StarBorderIcon from '@material-ui/icons/StarBorder';
import WatchLaterIcon from '@material-ui/icons/WatchLater';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import CheckCircleOutlineIcon from '@material-ui/icons/CheckCircleOutline';

const addFavourite = (id) => {
    var userId = firebase.auth().currentUser.uid;
    firestore.collection('users').doc(userId).set({
        favourites: firebase.firestore.FieldValue.arrayUnion(id)
    }, {merge: true})
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
            isLoaded: false,
            mediaInfo: {},
            mediaBg: '',
            currRating: 0,
            laterColor: "black",
            completed: false,
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
        if(this.state.laterColor == "blue") {
            userDoc.collection('later').doc(id).delete();
            this.setState({laterColor: "black"});
        } else {
            userDoc.collection('later').doc(id).set({});
            this.setState({laterColor: "blue"});
        }
    }

    async updateRating(newRating, mediaId) {
        var userId = firebase.auth().currentUser.uid;
        firestore.collection('users').doc(userId).collection('ratings').doc('books').update({
            [mediaId]: newRating,
        })
        firestore.collection('posts').doc(mediaId).collection('userRatings').doc(userId).set(
            {rating: newRating}, 
            {merge: true}
        )
        this.setState({currRating: newRating});
    }

    async getRating(mediaId) {
        var userId = firebase.auth().currentUser.uid;
        var userDoc = firestore.collection('users').doc(userId);
        userDoc.collection('ratings').doc('books').get().then((doc) => {
            if(doc.exists) {
                console.log(doc.data()[mediaId]);
                this.setState({currRating: doc.data()[mediaId]});
            }
            //no else needed already set to 0
        })
        userDoc.collection('later').doc(mediaId).get().then((doc) => {
            if(doc.exists) {
                this.setState({laterColor: "blue"});
            }
        })
    }

    async getPicture(url) {
        const ref = firebaseApp.storage().ref(url);
        ref.getDownloadURL()
            .then((url) => {
                this.setState({mediaBg: url});
            })
            .catch((e) =>
                console.log('Error retrieving profilePic => ', e)
            );
    }

    componentDidMount() {
        firestore.collection('posts').doc(this.props.id).get().then((doc) => {
            if(doc.exists) {
                this.setState({ mediaInfo: doc.data(), isLoaded: true });
                this.getPicture('/mediaBg/'+this.props.id+'.jpg');
                this.getRating(this.props.id);
            }
        })
    }
    
    render() {
        const { userInfo, isLoaded } = this.state;
        const { classes } = this.props;

        if (isLoaded) {
            return (
                <div className="mediaPost">
                    {/* picture of media and favorite btn*/}
                    <img className="mediaPostImg" src={this.state.mediaBg} alt={this.state.mediaInfo['title']}></img>
                    {/* title */}
                    <h1 className="mediaPostTitle"><strong>{this.state.mediaInfo['title']}</strong></h1>
                    {/* basic info depends on category temp will be actors*/}
                    <h3 className="mediaPostInfo">{this.state.mediaInfo['info']}</h3>
                    {/* summary */}
                    <h4 className="mediaPostSummary">{this.state.mediaInfo['summary']}</h4>
                    {/* add to list add to ... */}
                    <div className="allbtns">
                        <div>
                            <button className="favBtn" onClick={() => addFavourite(this.props.id)} style={{...buttonStyle}} />
                            <h5>Favourite</h5>
                        </div>
                        <div>
                            <WatchLaterIcon onClick={() => this.updateLater(this.props.id)} size="large" style={{...buttonStyle, color: this.state.laterColor}} />
                            <h5>Later</h5>
                        </div>
                        <div>
                            {this.state.completed ? (
                                <CheckCircleIcon className="completed" size="large" style={{...buttonStyle, color: "green"}} />
                            ) : (
                                <CheckCircleOutlineIcon className="completed" size="large" style={{...buttonStyle}} />
                            )}
                            <h5>Completed</h5>
                        </div>
                    </div>
                    {/* rate and rating general */}
                    <div className="ratings">
                        <h2>Average Rating:  {this.state.mediaInfo['avgRating']}</h2>
                        <h4>Add a graph here...</h4>
                        <h1>Rate this Title:</h1>
                        <Rating style={{fontSize: "3em"}} value={this.state.currRating} precision={0.5} emptyIcon={<StarBorderIcon fontSize="inherit" />} onChange={(event, newRating) => this.updateRating(newRating, this.props.id)} />
                    </div>
                    {/* reviews or go to page*/}
                    {/* <Reviews/> */}
                    {/* extra report etc */}
                    <div className="extra">
                        {/* <button className="report" onClick={() => report({id})}>Report</button> */}
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

export default MediaPost;
