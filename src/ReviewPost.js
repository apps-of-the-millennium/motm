
import './ReviewPost.css';
import { firestore } from './firebase';
import firebase from 'firebase/app';

import { Link } from 'react-router-dom';

import { IoMdThumbsUp } from 'react-icons/io';

import { useEffect, useState } from 'react';


// const text120 = 'One piece is a great adventure series with a lovable cast of all characters! It is an excellent show to watch lmao lol!';
// const text120a = 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industrys standard!';
// const text120b = "One piece is a great adventure series with a lovable cast of all characters!";


function ReviewPost(props) {
    // const [userInfo, setUserInfo] = useState(undefined);
    const [userPic, setUserPic] = useState('');
    const [likes, setLikes] = useState(0);

    // const [loading, setLoading] = useState(false); //currently not in use, was going to used for default component look

    

    useEffect(() => {
        //placed all these in here to remove dependency warnings...dont place in here if u use these values elsewhere
        let likesCounterDocRef = firestore.collection('posts').doc('books').collection('bookPosts').doc(props.allReviewInfo.reviewInfo.mid).collection('reviews').doc(props.review_id).collection('counters').doc('likesCounter')
        
        const getProfilePicture = (url) => {
            //check if it is a url or path to firebase storage
            if (url.charAt(0) === '/') {
                const ref = firebase.storage().ref(url);
                ref.getDownloadURL()
                    .then((url) => {
                        setUserPic(url);
                    })
                    .catch((e) =>
                        console.log('Error retrieving profilePic => ', e)
                    );
            } else {
                setUserPic(url);
            }
        }

        const getUserInfo = () => {
            firestore.collection('users').doc(props.allReviewInfo.uid).get().then((doc) => {
                if (doc.exists) {
                    // setUserInfo(doc.data());
                    getProfilePicture(doc.data().profilePic);
                }
            });
        }

        const getCount = (docRef) => {
            docRef.collection('shards').get().then((querySnapshot) => {
                let count = 0;
                querySnapshot.forEach((doc) => {
                    // doc.data() is never undefined for query doc snapshots
                    count += doc.get('count');
                    // console.log(doc.get('count'))
                });
                setLikes(count);
            });;
    
            // const documents = querySnapshot.docs;
            // for (const doc of documents) {
            //   count += doc.get('count');
            // }
            // return count;
        }

        // setLoading(true);
        getUserInfo();
        // getProfilePicture(userInfo.profilePic)
        getCount(likesCounterDocRef);
        // setLoading(false);
    }, [props]); //[] prevents infinite loops when state is object or array, it will only run on mount and dismount; edit: added props to dependency array, all seems fine

    

    return (
        <div className="reviewPostContainer">

            {/*use this.props.location.state.allReviewInfo in another compo to retrieve the values passed in state from Link*/}

            <Link to={`/profile/${props.allReviewInfo.uid}`} style={{ textDecoration: "none" }}>
                {/* <div className="reviewUserImg">Image</div> */}
                {/* doesnt work for uploaded profile pics that are saved in cloud storage */}
                <img className='reviewUserImg' src={(userPic) ? userPic : '/'} alt="No img"></img>
            </Link>

            <Link to={{ pathname: `/review/${props.review_id}`, state: { allReviewInfo: props.allReviewInfo } }} style={{ textDecoration: "none" }}>
                <div className="reviewContent">
                    <div className="reviewPostSummary" >{props.allReviewInfo.reviewInfo.summary}</div>
                    <div className="reviewLikes"><IoMdThumbsUp /> {likes} </div>
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





