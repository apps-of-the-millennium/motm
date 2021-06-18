import { useState, useEffect, useContext } from 'react';
import './ActivityFeed.css';
import { firestore } from './firebase';
import firebase from 'firebase/app';
import ActivityFeedPost from './ActivityFeedPost';
import TextareaAutosize from 'react-textarea-autosize';
import Filter from 'bad-words';
import { AuthContext } from "./context";

function ActivityFeed(props) {
    const LIMIT = 5;
    const { userId } = useContext(AuthContext);
    const [lastDoc, setLastDoc] = useState({});
    const [canLoadMore, setCanLoadMore] = useState(false);

    const [feedPosts, setFeedPosts] = useState([]);
    const [newActivityText, setNewActivityText] = useState('');
    const [isFocused, setIsFocused] = useState(false);

    const [currentUserInfo, setCurrentUserInfo] = useState({});

    function displayActivity(doc_id, _id, _content, _timestamp, _type, _extraInfo) {
        // If timestamp is null, assume we've gotten a brand new message.
        // https://stackoverflow.com/a/47781432/4816918
        let newTimestamp = _timestamp ? _timestamp.toMillis() : Date.now();
        // let displayTime = timestamp ? timestamp.toDate().toDateString() : Date.now();
        const newActivity = {
            id: doc_id, //id of the actual activity document, useful for deleting activity posts
            activity_id: _id, //id of the USER who made the post OR the ID OF THE MEDIA POST useful for linking to the profile or media post page
            type: _type,
            content: _content,
            timestamp: newTimestamp,
            extraInfo: _extraInfo //usually empty for message types since a db call is used to get user info
        };

        //add newActivity post then sort by timestamp descending (i.e most recent post first -> oldest post)
        setFeedPosts((currentFeedPosts) => [...currentFeedPosts, newActivity].sort(function (x, y) {
            return y.timestamp - x.timestamp;
        }));
    }


    useEffect(() => {
        if(userId) {
            firestore.collection('users').doc(userId).get().then((doc) => {
              if(doc.exists) {
                setCurrentUserInfo({ id: doc.id, data: doc.data() });
              }
            })
        } else {
            setCurrentUserInfo({});
        }
    }, [userId]);

    useEffect(() => {

        let query = firestore
            .collection('users').doc(props.userId)
            .collection('activity')
            .orderBy('timestamp', 'desc')
            .limit(LIMIT);

        let count = 0;
        // Start listening to the query. //onSnapshot returns a fnc that you must call to remove the listener
        const convoListenerUnsub = query.onSnapshot((snapshot) => { //onSnapshot takes a cb fnc and calls it whenever any documents are changed to match the query
            snapshot.docChanges().forEach((change) => {
                if (change.type === 'removed') {
                    console.log('msg removed');
                } else if (change.type === 'added') {
                    console.log("added an activity");
                    let activity_doc = change.doc.data();
                    count++;
                    // console.log(count);
                    if (count === LIMIT) { //save the final retrieved document (used for pagination) this if statement should only run ONCE
                        setLastDoc(change.doc);
                        setCanLoadMore(true);
                    }
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

    function handlePostPagination() {
        //known crash in Development: if you add the 6th post and then click load more, you will be shown an uncommited timestamp error
        if (canLoadMore) {
            if (lastDoc && lastDoc.data().timestamp !== null) {
                console.log("userId, last_activity_document:", props.userId, lastDoc);
                firestore
                    .collection('users').doc(props.userId)
                    .collection('activity')
                    .orderBy('timestamp', 'desc')
                    .startAfter(lastDoc)
                    .limit(LIMIT)
                    .get()
                    .then((querySnapshot) => {
                        if (querySnapshot.docs.length < LIMIT) { //if we query for posts and end up with less than LIMIT_VALUE posts, it means we have run out, so disable button functionality
                            setCanLoadMore(false);
                        }

                        //edgecase: will be undefined if querysnapshot.docs.length is 0, but wont break since we disable the button in qs.docs.length < LIMIT
                        let last_doc = querySnapshot.docs[querySnapshot.docs.length - 1];
                        // console.log("last", last_doc);
                        setLastDoc(last_doc);

                        querySnapshot.forEach((doc) => {
                            // console.log(doc.id, ' => ', doc.data());
                            let activity_doc = doc.data();
                            displayActivity(doc.id, activity_doc.id, activity_doc.content, activity_doc.timestamp, activity_doc.type, activity_doc.extraInfo);
                        });
                    });
            } 
            else {
                console.warn('Lastdoc timestamp is null/uncommited, pagination unavailable');
            }
        } 
        else {
            console.warn("NO MORE ACTIVITY");
        }
    }

    return (
        <div className='feed-container'>
            <div style={{
                fontSize: '20px',
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

            {/* {console.log(feedPosts)} */}
            {(feedPosts.length > 0) &&
                <div className='feed-container-content'>
                    {feedPosts.map((post) => {
                        return <ActivityFeedPost key={post.id} postInfo={post} />
                    })}
                </div>}

            <div className="feed-paginate-button" onClick={handlePostPagination}>Load More</div>
            {/* {canLoadMore ?
                <div className="feed-paginate-button" onClick={handlePostPagination}>Load More</div> :
                <div className="feed-paginate-button">No More Activity</div>} */}
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


