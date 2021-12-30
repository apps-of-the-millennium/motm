
import './StarsWidget.css';
// import { firestore } from './firebase';
// import firebase from 'firebase/app';


// import { useEffect, useState } from 'react';
import { useEffect } from 'react';


// const text120 = 'One piece is a great adventure series with a lovable cast of all characters! It is an excellent show to watch lmao lol!';
// const text120a = 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industrys standard!';
// const text120b = "One piece is a great adventure series with a lovable cast of all characters!";


function StarsWidget(props) {
    //have the list of actors through props.stars, need to retrieve pic of each actor and make a map: actor_name : image
    //const [starActors, setStarActors] = useState([]); //have a list of actors (stars), need to retrieve + populate the list, for each actor, retrieve image
    //const [actorName, setLikes] = useState('N/A');

    // const [loading, setLoading] = useState(false); //currently not in use, was going to used for default component look

    

    useEffect(() => {
        //placed all these in here to remove dependency warnings...dont place in here if u use these values elsewhere
        //let likesCounterDocRef = firestore.collection('posts').doc('books').collection('bookPosts').doc(props.allReviewInfo.reviewInfo.mid).collection('reviews').doc(props.review_id).collection('counters').doc('likesCounter')
        
        // const getProfilePicture = (url) => {
            //for each star in props.stars, get the image and update map star_name : star_image
        //     //check if it is a url or path to firebase storage
        //     if (url.charAt(0) === '/') {
        //         const ref = firebase.storage().ref(url);
        //         ref.getDownloadURL()
        //             .then((url) => {
        //                 setUserPic(url);
        //             })
        //             .catch((e) =>
        //                 console.log('Error retrieving profilePic => ', e)
        //             );
        //     } else {
        //         setUserPic(url);
        //     }
        // }

        const getStarActors = () => {
            // firestore.collection('users').doc(props.allReviewInfo.uid).get().then((doc) => {
            //     if (doc.exists) {
            //         // setUserInfo(doc.data());
            //         getProfilePicture(doc.data().profilePic);
            //     }
            // });

            //need the current movie media post id to retrieve a list of stars
            //most likely given already through props.stars
            // firestore.collection('movies').collection('moviePosts').doc(props.postInfo.uid).get().then((doc) => {
            //     if (doc.exists) {
            //         setStarActors(doc.data().stars) //change to correct attribute

            //         // for (actor in starActors) {
            //         //     //generateUrl
            //         //     getActorPicture(url)
            //         //     //do something
            //         // }

            //     }
            // });
        }

        

        // setLoading(true);
        getStarActors();
        // getProfilePicture(userInfo.profilePic)
        // setLoading(false);
    }, [props]); //[] prevents infinite loops when state is object or array, it will only run on mount and dismount; edit: added props to dependency array, all seems fine

    

    return (
        /*<Link to={`/profile/${props.allReviewInfo.uid}`} style={{ textDecoration: "none" }}>*/
   
        <div className="starsGrid">
            {props.stars.map((star) => {
                return (
                    <div className="starContent">
                        <img className='starImage' src={''} alt=""></img>
                        <div className='starName'> {star} </div>
                    </div>
                )
            })}
        </div>
    

        /*</Link>*/
    )
}


export default StarsWidget;





