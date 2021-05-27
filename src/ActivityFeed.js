import { useState, useEffect } from 'react';
import './ActivityFeed.css';
import { firestore } from './firebase';
import firebase from 'firebase/app';
import ActivityFeedPost from './ActivityFeedPost';
import TextareaAutosize from 'react-textarea-autosize';
import Filter from 'bad-words';


function ActivityFeed(props) {
    const [feedPosts, setFeedPosts] = useState([]);
    const [newActivityText, setNewActivityText] = useState('');
    const [isFocused, setIsFocused] = useState(false);

    // const [currentUID, setCurrentUID] = useState();
    const [currentUserInfo, setCurrentUserInfo] = useState({});

    useEffect(() => {
        // currentUID is suppose to represent the current logged in user, probably remove this if user info becomes global!
        firestore.collection('users').doc(props.currentUID).get().then((doc) => {
            if (doc.exists) {
                setCurrentUserInfo({ id: doc.id, data: doc.data() });
                // this.getProfilePicture(doc.data()['profilePic']);  
            }
        })
    }, [props.currentUID])

    useEffect(() => {
        function displayActivity(doc_id, _id, _content, _timestamp, _type, _extraInfo) {
            // If timestamp is null, assume we've gotten a brand new message.
            // https://stackoverflow.com/a/47781432/4816918
            let newTimestamp = _timestamp ? _timestamp.toMillis() : Date.now();
            // let displayTime = timestamp ? timestamp.toDate().toDateString() : Date.now();
            const newActivity = {
                id: doc_id, //id of the actual activity document, useful for deleting activity posts
                activity_id: _id, //id of the user who made the post OR the id of the media post
                type: _type,
                content: _content,
                timestamp: newTimestamp,
                extraInfo: _extraInfo //usually empty for message types since a db call is used to get user info
            };
            // if (feedPosts.length === 0) { //first message
            //     setFeedPosts([newActivity]);
            // } else { //find the correct position to place activity in 
            //     let activityNodeIndex = 0;
            //     let activityNode = feedPosts[0];
            //     while (activityNode && activityNodeIndex < feedPosts.length) {
            //         if (activityNode.timestamp > newActivity.timestamp) {
            //             break;
            //         }
            //         activityNodeIndex++;
            //         activityNode = feedPosts[activityNodeIndex];
            //     }
            // setFeedPosts(currentPosts => currentPosts.splice(activityNodeIndex, 0, newActivity))

            setFeedPosts((currentFeedPosts) => [...currentFeedPosts, newActivity]);
        }

        let query = firebase.firestore()
            .collection('users').doc(props.userId)
            .collection('activity')
            .orderBy('timestamp', 'desc')
            .limit(6);

        // Start listening to the query. //onSnapshot returns a fnc that you must call to remove the listener
        const convoListenerUnsub = query.onSnapshot((snapshot) => { //onSnapshot takes a cb fnc and calls it whenever any documents are changed to match the query
            snapshot.docChanges().forEach((change) => {
                if (change.type === 'removed') {
                    console.log('msg removed');
                } else if (change.type === 'added') {
                    console.log("added an activity");
                    let activity_doc = change.doc.data();
                    displayActivity(change.doc.id, activity_doc.id, activity_doc.content, activity_doc.timestamp, activity_doc.type, activity_doc.extraInfo); //think doc.id used if we want to delete message
                }
            });
        });

        //this is where u run componentWillUnmount() stuff
        return function cleanUp() {
            convoListenerUnsub(); //remove the listener
            setFeedPosts([]);
            console.log('unsubbed!');
        }

        //disables the warning requiring state feedPosts to be in dependency array, feedPosts is causing infinite rerendering
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.userId]); //props.userId


    function handleOnFocus() {
        setIsFocused(true);
    }

    function handleOnCancel() {
        setIsFocused(false);
    }

    function handleOnSubmit() {
        if (newActivityText !== '') {
            // console.log(currentUserInfo)
            //props.userId is the uid of the profile page you are on (doesnt have to be your own!)
            let filter = new Filter();
            let filteredText = filter.clean(newActivityText);

            firestore.collection('users').doc(props.userId).collection('activity').add({
                id: currentUserInfo.id,
                type: 'message',
                content: filteredText,
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                extraInfo: {}
            });
            setNewActivityText('');
            setIsFocused(false);
        }
    }

    return (
        <div className='feed-container'>
            <div style={{
                fontSize: 'medium',
                fontWeight: '600',
                color: 'var(--color-text)',
                transition: 'color 1s'
            }}> Activity</div>
            <TextareaAutosize
                className="feed-input-textbox"
                // maxLength={this.REVIEW_MAX}
                placeholder='What is on your mind?'
                id="feedInputText"
                onChange={(e) => setNewActivityText(e.target.value)} value={newActivityText}
                onFocus={handleOnFocus}
            >
            </TextareaAutosize>
            {
                isFocused &&
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, max-content)', justifyContent: 'end', columnGap: '12px' }}>
                    <div className='feed-input-button cancel' onClick={handleOnCancel}>Cancel</div>
                    <div className='feed-input-button submit' onClick={handleOnSubmit}>Post</div>
                </div>
            }

            {console.log(feedPosts)}
            <div className='feed-container-content'>
                {feedPosts.sort(function (x, y) {
                    return y.timestamp - x.timestamp;
                }).map((post) => {
                    return (
                        <ActivityFeedPost key={post.id} postInfo={post} />
                    )
                })}
            </div>
        </div >
    )
}

export default ActivityFeed;







// Displays a Message in the UI.
// displayMessage = (msgId, name, text, timestamp, picUrl) => {  //(id, timestamp, name, text, picUrl, imageUrl)

//     // If timestamp is null, assume we've gotten a brand new message.
//     // https://stackoverflow.com/a/47781432/4816918
//     let newTimestamp = timestamp ? timestamp.toMillis() : Date.now();
//     let displayTime = timestamp ? timestamp.toDate().toDateString() : Date.now();
//     const newMessage = {
//         id: msgId,
//         displayName: name,
//         text: text,
//         timestamp: newTimestamp,
//         profile_pic: picUrl
//     };

//     if (this.state.messages.length === 0) { //first message
//         this.setState({ messages: [newMessage] });
//     } else { //find the correct position to place message in 
//         let messageNodeIndex = 0;
//         let messageNode = this.state.messages[0];
//         while (messageNode && messageNodeIndex < this.state.messages.length) {
//             if (messageNode.timestamp > newMessage.timestamp) {
//                 break;
//             }
//             messageNodeIndex++;
//             messageNode = this.state.messages[messageNodeIndex];
//         }

//         this.state.messages.splice(messageNodeIndex, 0, newMessage);
//         //console.log(this.state.messages);
//         this.setState({ messages: this.state.messages }); //re-render after adding new message
//     }
// }

