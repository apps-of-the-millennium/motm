import React from 'react';
import './ReviewEditPage.css';
import { firestore } from './firebase';
import firebase from 'firebase/app';
import envData from './envData';

class ReviewEditPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isSpoiler: false, //may not need
            text: '',
            score: 50
        };
    }

    //Design Note: I dont even think form is needed since "input" values are being saved into the component state, could totally refactor the current <form>
    //However, the ability to use inputs is quite nice
    render() {
        return (
            <div className="pageContainer">
                <form className="form" onSubmit={this.handleSubmit}>
                    <label for="completion">How many TO_DETERMINE have you completed for MEDIA_TITLE as of writing this review?</label><br></br>
                    <input id="completion" type="number" onChange={(e) => this.setState({ score: e.target.value })} value={this.state.score} min="0" max="100"></input><br></br>

                    {/* <label for="reviewSummary">Review summary</label><br></br>
                    <textarea className="reviewSummary" id="reviewSummary" onChange={(e) => this.setState({ text: e.target.value })} value={this.state.text}></textarea><br></br> */}

                    <label for="reviewText">Your review</label><br></br>
                    <textarea className="reviewText" id="reviewText" onChange={(e) => this.setState({ text: e.target.value })} value={this.state.text}></textarea><br></br>


                    <label for="score">Score</label><br></br>
                    <input id="score" type="number" onChange={(e) => this.setState({ score: e.target.value })} value={this.state.score} min="0" max="100"></input><br></br>

                    {/* <input id="spoilers" type="checkbox" onChange={(e) => { this.setState({ isSpoiler: !this.state.isSpoiler }, () => console.log(this.state.isSpoiler)); }} value={this.state.isSpoiler}></input> */}
                    <label for="spoilers">Contains spoilers?</label><br></br>
                    <select id="spoilers" value={this.state.isSpoiler} onChange={(e) => { this.setState({ isSpoiler: e.target.value }, () => console.log(this.state.isSpoiler)); }}>
                        <option value="true">Yes</option>
                        <option value="false">No</option>
                    </select><br></br>
                    
                    <button type='submit'>Save</button>
                </form>

            </div>
        )
    }

    handleSubmit = (e) => {
        e.preventDefault();
        console.log("Form submitted")
    }
}

export default ReviewEditPage;