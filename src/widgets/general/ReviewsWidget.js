
import './ReviewsWidget.css';
import { firestore } from '../../firebase';
import { Link } from 'react-router-dom';
import ReviewPost from '../../ReviewPost';
import { useEffect, useState } from 'react';


function ReviewsWidget(props) {
    const [reviews, setReviews] = useState([]);

    useEffect(() => {
        //placed all these in here to remove dependency warnings...dont place in here if u use these values elsewhere
        const retrieveReviews = () => {
            firestore.collection('posts').doc(props.category).collection(props.categoryPostString).doc(props.id).collection('reviews').orderBy("likes", "desc").limit(4).get().then((querySnapshot) => {
                querySnapshot.forEach((doc) => {
                    // doc.data() is never undefined for query doc snapshots
                    console.log(doc.id, " => ", doc.data());
                    const newReviewPost = {
                        review_id: doc.id,
                        allReviewInfo: doc.data()
                    }
    
                    setReviews(oldReviews => [...oldReviews, newReviewPost]) 
                });
            })
                .catch((error) => {
                    console.log("Error getting documents: ", error);
                });
        }
    
        retrieveReviews();
    }, []); //[] prevents infinite loops when state is object or array, it will only run on mount and dismount; edit: added props to dependency array, all seems fine

    return (
        <div className="reviewsContainer">
            <div className="extraInfoTitle" style={{ marginBottom: "1rem" }}>Reviews</div>
            {(reviews.length === 0) ? (<div className="extraInfoValue" style={{ fontStyle: 'italic', fontWeight: '600' }}>There are no reviews for {props.mediaInfo['title']} yet...
                <Link className="revLink" style={{ fontStyle: 'italic', fontWeight: '700' }} to={{ pathname: `/review/write/${props.id}`, state: { mediaInfo: props.mediaInfo } }} >be the first </Link></div>)
                : (
                    <div className="reviewsGrid">
                        {reviews.map((post) => {
                            return <ReviewPost key={post.review_id} review_id={post.review_id} allReviewInfo={post.allReviewInfo} />
                        })}
                    </div>
                )}
        </div>
    )
}


export default ReviewsWidget;





