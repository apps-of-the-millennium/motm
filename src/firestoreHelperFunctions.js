

import { firestore } from './firebase';
import firebase from 'firebase/app';

//may need to adjust if needed for more general use
const addNotificationToUserActivity = (currentUserId, _id, _content, _extraInfo) => { //mostly for type: notification since type message is fixed to input area above activity feed
    firestore.collection('users').doc(currentUserId).collection('activity').add({
      id: _id, //should be media post id in this scenario
      type: "notification",
      content: _content,
      extraInfo: _extraInfo,
      timestamp: firebase.firestore.FieldValue.serverTimestamp()
    }).then(() => {
      console.log('Notification added to id:', currentUserId);
    });
  }
export default addNotificationToUserActivity;