
import './ReviewPost.css';
import { firestore } from './firebase';
import firebase from 'firebase/app';

import { Link } from 'react-router-dom';

import { IoMdThumbsUp } from 'react-icons/io';

import { useEffect, useState } from 'react';


const text120 = 'One piece is a great adventure series with a lovable cast of all characters! It is an excellent show to watch lmao lol!';
const text120a = 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industrys standard!';
const text120b = "One piece is a great adventure series with a lovable cast of all characters!";

function ReviewPost (props) {
    const [userInfo, setUserInfo] = useState(undefined);


    useEffect(() => {
        getUserInfo();
    }, []); //[] prevents infinite loops when state is object or array, it will only run on mount and dismount

    function getUserInfo () {
        firestore.collection('users').doc(props.allReviewInfo.uid).get().then((doc) => {
            if (doc.exists) {
                setUserInfo(doc.data());
                // console.log(doc.data());
            }
        });
    }


    return (
        <div className="reviewPostContainer">

            {/*use this.props.location.state.allReviewInfo in another compo to retrieve the values passed in state from Link*/}

            <Link to={`/profile/${props.allReviewInfo.uid}`} style={{textDecoration:"none"}}>
                {/* <div className="reviewUserImg">Image</div> */}
                <img className='reviewUserImg' src={(userInfo) ? userInfo.profilePic : '/'} alt="temp.png"></img>
            </Link>
            
            <Link to={{pathname: `/review/${props.review_id}`, state: { allReviewInfo: props.allReviewInfo } }} style={{textDecoration:"none"}}> 
                <div className="reviewContent">
                    <div className="reviewPostSummary" >{props.allReviewInfo.reviewInfo.summary}</div>
                    <div className="reviewLikes"><IoMdThumbsUp /> {props.allReviewInfo.likes}</div>
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


export default ReviewPost;





