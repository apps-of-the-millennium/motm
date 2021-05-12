import React from 'react';
import './ReviewPage.css';
import { firestore } from './firebase';
import firebase from 'firebase/app';


import { Link } from 'react-router-dom';

import { IoMdThumbsDown, IoMdThumbsUp } from 'react-icons/io';

/*EXTRA TODOS:
    completed info
    user-select is super jank, cant deselect outside of summary box
*/
class ReviewPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            liked: false,
            disliked: false
        };

        //this.props.allReviewInfo
        //design note: reviewId is kind of useless (can't use it as fall back when props do not exist, to try: loading the review page straight from url)
    }


    render() {
        console.log(this.props.location.state.allReviewInfo);
        let timestamp = this.props.location.state.allReviewInfo.reviewInfo.timestamp;
        let containsSpoiler = this.props.location.state.allReviewInfo.reviewInfo.containsSpoiler;
        let score = this.props.location.state.allReviewInfo.reviewInfo.score;

        return (
            <div className="reviewPageContainer">

                <div className="rp-coverContainer">
                    <div className="rp-title">{this.props.location.state.allReviewInfo.reviewInfo.title}</div>
                </div>

                <div className="rp-contentContainer">
                    <div className="rp-infoContainer">
                        <div className="rp-info-1">
                            <div className='rp-info-label'>Review by </div>
                            <div style={{marginTop:'12px'}}>
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
                            <div style={{background:this.getScoreColor(score)}} className='rp-info-big-label'>{score}<span style={{ fontSize: '12px' }}>/100</span></div>
                        </div>
                    </div>
                    {(containsSpoiler) ? <div style={{ width: '90%', margin: '1rem auto' }} className="warningMessage">Warning: Contains Spoilers</div> : <></>}
                    <div className="rp-summaryContainer">
                        {/* {this.props.location.state.allReviewInfo.reviewInfo.summary} */}
                        <div className='rp-summaryText'>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.</div>
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
        this.setState({ liked: !this.state.liked });
    }

    onClickDisliked = () => {
        this.setState({ disliked: !this.state.disliked });
    }

    convertTimestamp = (timestamp) => {
        let date = new Date(timestamp.seconds * 1000 + timestamp.nanoseconds / 100000)
        return date;
    }

    getScoreColor = (score) => {
        if (score >= 70) //high
            return '#41ca95';
        else if (score >= 50) //mid
            return '#ecea58';
        else //low
            return '#fc5656';
    }
}

export default ReviewPage;