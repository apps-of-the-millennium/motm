import React from 'react';
import './ReviewPost.css';
import { firestore } from './firebase';
import firebase from 'firebase/app';


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
                <div className="reviewUserImg">Image</div>

                <div className="reviewContent">
                    <div className="reviewPostSummary">{text120b}</div>
                    <div className="reviewLikes"><IoMdThumbsUp/> 100</div>
                </div>
            </div>
        )
    }
}

export default ReviewPost;


