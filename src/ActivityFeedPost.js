import { useState, useEffect } from 'react';
import './ActivityFeedPost.css';


import { AiFillLike } from 'react-icons/ai'; //AiFillDelete, AiFillFlag
import { FaComments } from 'react-icons/fa';
import { firestore } from './firebase';
import firebase from 'firebase/app';
import moment from 'moment';
import { Link } from 'react-router-dom';

function ActivityFeedPost(props) {
    const [userInfo, setUserInfo] = useState({});
    const [userPic, setUserPic] = useState('');
    const timestampFromNow = moment(props.postInfo.timestamp).fromNow();

    //will refactor as a global picture retrieval as it is needed in several pages
    function getProfilePicture(url) {
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
            setUserPic({profilePic: url});
        }
    }

    useEffect(() => {
        if (props.postInfo.type === 'message') {
            firestore.collection('users').doc(props.postInfo.activity_id).get().then((doc) => {
                if (doc.exists) {
                    // console.log("Document data:", doc.data());
                    setUserInfo(doc.data())
                    getProfilePicture(doc.data().profilePic)
                    
                } else {
                    // doc.data() will be undefined in this case
                    console.log("No such user document!");
                }
            }).catch((error) => {
                console.log("Error getting document:", error);
            });
        }
        else if (props.postInfo.type === 'notification') {
            console.log('its a notification post');
        }

    }, [props.postInfo])

    let notification_post_pic = props.postInfo.extraInfo.pic || '' // //TODO: DEFAULT_PIC_URL
    return (

        (props.postInfo.type === 'message') ? //message
            <div className="feed-post message">
                <div className="feed-post-buttons">
                    {/* <AiFillDelete className='feed-post-button-icon other' /> */}
                    <FaComments className='feed-post-button-icon' />
                    <AiFillLike className='feed-post-button-icon' />
                </div>
                <div className="feed-post-timestamp">{timestampFromNow}</div>

                <div className="feed-post-header message">
                    <img src={userPic} alt='img' className='feed-post-img message' />
                    <div>{userInfo.userName}</div>
                </div>
                <div className="feed-post-content">
                    {props.postInfo.content}
                </div>
            </div> :

            // type notification post
            <div className="feed-post activity">
                <div className="feed-post-buttons">
                    {/* <AiFillDelete className='feed-post-button-icon other' /> */}
                    <FaComments className='feed-post-button-icon' />
                    <AiFillLike className='feed-post-button-icon' />
                </div>
                <div className="feed-post-timestamp">{timestampFromNow}</div>

                <div className="feed-post-header activity">
                    <Link style={{ backgroundImage: `url(${notification_post_pic})`, backgroundRepeat: 'no-repeat', backgroundSize: '100% 100%', userSelect: 'none', borderLeftRightRadius: '4px', borderBottomLeftRadius: '4px' }} to={`/mediapost/${props.postInfo.activity_id}`}> </Link>
                    <div className='feed-post-header-text'>
                        {props.postInfo.content}
                        <Link style={{ textDecoration: 'none', color: '#3498DB', fontSize: '16px' }} to={`/mediapost/${props.postInfo.activity_id}`}> {props.postInfo.extraInfo.title} </Link>
                    </div>
                </div>


            </div>
    )
}

export default ActivityFeedPost;