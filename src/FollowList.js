import React from 'react';
import { firestore } from './firebase';
import firebase from 'firebase/app';
import List from '@material-ui/core/List';
import Dialog from '@material-ui/core/Dialog';
import FollowListItem from './FollowListItem';
import { withStyles } from '@material-ui/core/styles';

//might want to add a scroll max-view after
const useStyles = () => ({
    root: {
      backgroundColor: '#0e1931',
      color: 'white',
    },
});

class FollowList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            userInfo: [],
            profilePic: '',
        };
    }

    handleClose = () => {
        this.props.onClose();
    };

    //can make this a global function
    getProfilePicture(url) {
        //check if it is a url or path to firebase storage
        if (url.charAt(0) === '/') {
            const ref = firebase.storage().ref(url);
            ref.getDownloadURL()
                .then((url) => {
                    this.setState({profilePic: url});
                })
                .catch((e) =>
                    console.log('Error retrieving profilePic => ', e)
                );
        } else {
            this.setState({profilePic: url});
        }
    }
  
    getUserInfo(followId) {
        firestore.collection('users').doc(followId).get().then((doc) => {
            //unsure if doc.exists needs to be checked all the time
            if(doc.exists) {
                this.setState({ userInfo: doc.data() });
                this.getProfilePicture(doc.data()['profilePic']);
                this.setState({ isLoaded: true });  
            }
        })
    }

    render() {
        const { classes } = this.props;

        return (
            <Dialog onClose={this.handleClose} aria-labelledby="simple-dialog-title" open={this.props.open}>
                <List className={classes.root}>
                    {this.props.followList.map((followId) => (
                        <FollowListItem followId={followId} />
                    ))}
                </List>
            </Dialog>
        )
    }
}
export default withStyles(useStyles)(FollowList);