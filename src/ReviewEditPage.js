import React from 'react';
import './ReviewEditPage.css';
import { firestore } from './firebase';
import firebase from 'firebase/app';
import envData from './envData';

class ReviewEditPage extends React.Component {
    constructor (props) {
        super(props);
        this.state = {

        };
    }

    render() {
        return (
            <div className="pageContainer">
                <div>hello</div>
            </div>
        )
    }
}

export default ReviewEditPage;