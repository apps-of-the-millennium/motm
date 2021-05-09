import React from 'react';
import './ReviewPost.css';
import { firestore } from './firebase';
import firebase from 'firebase/app';

import { Link } from 'react-router-dom';

import { IoMdThumbsUp } from 'react-icons/io';


const text120 = 'One piece is a great adventure series with a lovable cast of all characters! It is an excellent show to watch lmao lol!';
const text120a = 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industrys standard!';
const text120b = "One piece is a great adventure series with a lovable cast of all characters!";

class ReviewPost extends React.Component {
    constructor(props) {
        super(props);
        this.state = {

        };
    }

    render() {
        return (
            <div className="reviewPostContainer">

                {/*use this.props.location.state.allReviewInfo in another compo to retrieve the values passed in state from Link*/}

                <Link to={`/profile/${this.props.allReviewInfo.uid}`} style={{textDecoration:"none"}}>
                    <div className="reviewUserImg">Image</div>
                </Link>
                
                <Link to={{pathname: `/review/${this.props.review_id}`, state: { allReviewInfo: this.props.allReviewInfo } }} style={{textDecoration:"none"}}> 
                    <div className="reviewContent">
                        <div className="reviewPostSummary" >{this.props.allReviewInfo.reviewInfo.summary}</div>
                        <div className="reviewLikes"><IoMdThumbsUp /> {this.props.allReviewInfo.likes}</div>
                    </div>
                </Link>

                {/* <div className="reviewUserImg">Image</div>

                <div className="reviewContent">
                    <div className="reviewPostSummary">{this.props.allReviewInfo.reviewInfo.summary} </div>
                    <div className="reviewLikes"><IoMdThumbsUp /> {this.props.allReviewInfo.likes}</div>
                </div> */}

            </div>
        )
    }
}

export default ReviewPost;


