import React from 'react';
import { firestore } from './firebase';
import firebase from 'firebase/app';
import Avatar from '@material-ui/core/Avatar';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import { Link } from 'react-router-dom';
import { withStyles } from '@material-ui/core/styles';
//wanted this as an alt image might still use later
//import PersonIcon from '@material-ui/icons/Person';

const useStyles = () => ({
    link: {
        'text-decoration': 'none',
    },
    listText: {
        'color': '#9da0b9',
        'padding-left': '1em',
    },
});


class FollowListItem extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isLoaded: false,
            userInfo: [],
            profilePic: '',
        };
    }

    handleClose = () => {
        this.props.onClose();
    };

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

    componentDidMount() {
        this.getUserInfo(this.props.followId);
    }

    render() {
        const { isLoaded } = this.state;
        const { classes } = this.props;

        if (isLoaded) {
            return (
                <Link className={classes.link} to={`/profile/${this.props.followId}`}>
                    <ListItem key={this.state.userInfo['userName']}>
                        <Avatar src={this.state.profilePic} alt={this.props.followId} />
                        <ListItemText className={classes.listText} primary={this.state.userInfo['userName']} />
                    </ListItem>
                </Link>

            )
        } else {
            return (
                <h3>Loading</h3>
            )
        }
    }
}

export default withStyles(useStyles)(FollowListItem);
