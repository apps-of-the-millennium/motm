import React from 'react';
import './MediaPost.css';
import { firestore } from './firebase';
import firebase from 'firebase/app';
import { MEDIA_POST_TYPES } from './envData';
import { Link } from 'react-router-dom';
import randomColor from 'randomcolor';

import { AiFillStar, AiFillHeart, AiFillClockCircle } from 'react-icons/ai';
import { ImCheckmark } from 'react-icons/im';
import { IoIosCheckmarkCircle } from 'react-icons/io';
import { RiPencilFill } from 'react-icons/ri';
import { FaTrashAlt } from 'react-icons/fa';

import addNotificationToUserActivity from './firestoreHelperFunctions';
import { AuthContext } from "./context";


class MediaPost extends React.Component { //({ user, match }) => {
    static contextType = AuthContext;

    constructor(props) {
        super(props);
        this.state = {
            isLoaded: false,
            postType: this.props.postType,
            usersProfile: this.props.usersProfile,

            category: this.props.category ? this.props.category.toLowerCase() : 'books', //might be temporary, might be some issue when u switch categories using selector popout

            mediaInfo: {},
            mediaPostPic: '',
            currRating: 0,
            completed: false,
            hover: false,
            popUp: false,
            listType: this.props.listType,
            popUpMessage: '',
            addedFavourite: false,
            addedLater: false,
            addedComplete: false,
            timer: '',
            displayButtons: false
        };

        this.tagColor = randomColor({
            luminosity: 'light',
            // hue: 'blue'
        }); //used to generate a random tag color

        this.categoryPostString = this.state.category ? this.state.category.toLowerCase().slice(0, -1) + 'Posts' : '';
        let arr = this.props.id.split("/");
        this.userListUrl = (this.props.id.includes("/")) ? arr[0] + '/' + arr[2] : '';
    }

    async setPopup(listType, addedList) {
        clearTimeout(this.state.timer);
        //if it was empty just set popUp true as the message is already addded
        if(!listType) {
            this.setState({ popUp: true });
        } else {
            this.setState({ popUp: true, popUpMessage: 'added to ' + listType, [addedList]: true });
        }
        this.setState({ timer: setTimeout(() => this.setState({ popUp: false }), 5000) });
    }

    deleteFromList(id, listType) {
        let updateList = this.props.updateList;
        
        firestore.collection('users').doc(this.context.userId).collection('lists').doc(listType).update({
            [listType]: firebase.firestore.FieldValue.arrayRemove(id)
        }).then(() => {
            updateList(listType); //we need delete to finish first before updating list!
        }).catch((err) => {
            console.error("Failed to delete from list:", err);
        });
    }

    displayButtons = () => {
        //you dont need to be logged in to see the buttons but the clicks wont add to ur list
        this.setState({ displayButtons: !this.state.displayButtons });
    }

    updateList(id, listType, addedList) {
        if (this.context.userId) {
            let finalListName = (listType.charAt(0).toUpperCase() + listType.slice(1)).slice(0, -4) + ` List`;
            //if the addedList has already been added to ex: updateFavourites this is so we don't keep doing firestore call
            if (!this.state[addedList]) {
                //need to add full path so we know category of mediaPost
                let unionVal = (id.includes("/")) ? id : this.state.category+'/'+this.categoryPostString+'/'+id

                firestore.collection('users').doc(this.context.userId).collection('lists').doc(listType).set(
                    { [listType]: firebase.firestore.FieldValue.arrayUnion(unionVal) },
                    { merge: true }
                ).then(() => {
                    this.setPopup(finalListName, addedList);
                    addNotificationToUserActivity(this.context.userId, unionVal.split("/")[2], `Added to ` + finalListName, { title: this.state.mediaInfo['title'], pic: this.state.mediaPostPic });
                });
            } else {
                this.setState({ popUpMessage: 'already added to ' + finalListName });
                this.setPopup('', '');
            }
        }
    }

    getPicture(url) {
        if (url) {
            const ref = firebase.storage().ref(url);
            ref.getDownloadURL()
                .then((url) => {
                    this.setState({ mediaPostPic: url });
                })
                .catch((e) =>
                    console.log('Error retrieving mediaPostPic => ', e)
                );
        }
    }

    componentDidMount() {
        let pic = '/mediaPosts/'
        console.log("props id: " + this.props.id);
        //means we are viewing a userList id already contains path and category
        if(this.props.id.includes("/")) {
            let path = this.props.id.split("/");
            pic += path[1] + '/' + path[2];

            firestore.collection('posts').doc(path[0]).collection(path[1]).doc(path[2]).get().then((doc) => {
                if (doc.exists) {
                    this.setState({ mediaInfo: doc.data() });
                    this.getPicture(pic);
                }
            })
        } else {
            pic += this.categoryPostString + '/' + this.props.id;
            firestore.collection('posts').doc(this.state.category).collection(this.categoryPostString).doc(this.props.id).get().then((doc) => {
                if (doc.exists) {
                    this.setState({ mediaInfo: doc.data() });
                    this.getPicture(pic);
                }
            })
        }
    }

    render() {
        if (this.state.postType === MEDIA_POST_TYPES.FUNCTIONAL) {
            return (
                <>
                    {(this.state.popUp) && <div className="popUp">
                        {this.state.mediaInfo['title']} was {this.state.popUpMessage}
                        <IoIosCheckmarkCircle style={{ fontSize: '16px', position: 'absolute', right: '15px', top: '11px' }} />
                    </div>}
                    <div className="mediaContainer">

                        <div className="mediaPost" onMouseEnter={() => { this.setState({ hover: true }) }} onMouseLeave={() => { this.setState({ hover: false }) }}>
                            {/* Link is wrapped separately to avoid breaking grid display css: trying to avoid yet another nested div */}
                            <Link className="mediaPageLink" to={`/mediapost/${this.state.category}/${this.props.id}`}>
                                {/* picture of media*/}
                                <img className="mediaPostImg" src={this.state.mediaPostPic} alt=""></img>
                            </Link>

                            <Link className="mediaPageLink" to={`/mediapost/${this.state.category}/${this.props.id}`}>
                                {/* title */}
                                {(this.state.hover) ?
                                    <div className="mediaPostTitle" style={{ color: `${this.tagColor}` }}>{this.state.mediaInfo['title']}</div> :
                                    <div className="mediaPostTitle">{this.state.mediaInfo['title']}</div> 
                                }
                            </Link>

                            <div className="mediaPostButtons">
                                <button className="invisible" onClick={() => this.updateList(this.props.id, "favouriteList", "addedFavourite")}><AiFillHeart className="icon" /></button>
                                <button className="invisible" onClick={() => this.updateList(this.props.id, "laterList", "addedLater")}><AiFillClockCircle className="icon" /></button>
                                <button className="invisible" onClick={() => this.updateList(this.props.id, "completedList", "addedCompleted")}><ImCheckmark className="icon" /></button>
                            </div>
                        </div>

                        <div className="mediaPostInfoBox">
                            {/* basic info depends on category temp will be actors*/}
                            <div className="infobox-header">
                                <div className="releaseDate">{(this.state.mediaInfo['releaseDate']) ? this.state.mediaInfo['releaseDate'] : "N/A"}</div>
                                <div className="ratings"><AiFillStar className="star" /> {(this.state.mediaInfo['avgRating']) ? this.state.mediaInfo['avgRating'] : "N/A"}</div>

                            </div>
                            <div className="mediaPostCategory">{(this.state.mediaInfo['category']) ? this.state.mediaInfo['category'] : "N/A"}</div>

                            <div className="author">{(this.state.mediaInfo['author']) ? this.state.mediaInfo['author'] : "N/A"}</div>
                            {/* limiting displayed tags to max 3, if it still overflows, it will be hidden */}
                            <div className="tagContainer">
                                {(this.state.mediaInfo['tags']) ? Object.keys(this.state.mediaInfo['tags']).slice(0, 3).map((keyName, i) => {
                                    return <div className="tag" style={{ background: `${this.tagColor}` }}>{keyName}</div>
                                }) : "No tag"}
                            </div>
                        </div>
                    </div>
                </>
            )
        } else if (this.state.postType === MEDIA_POST_TYPES.LIST) { //user Lists post type
            return (
                <>
                    {(this.state.popUp) && <div className="popUp">
                        {this.state.mediaInfo['title']} was {this.state.popUpMessage}
                        <IoIosCheckmarkCircle style={{ fontSize: '16px', position: 'absolute', right: '15px', top: '11px' }} />
                    </div>}
                    <div className="mediaContainer3">

                        <div className="mediaPost3">
                            {/* Link is wrapped separately to avoid breaking grid display css: trying to avoid yet another nested div */}
                            <Link className="mediaPageLink" to={`/mediapost/${this.userListUrl}`}>
                                {/* picture of media*/}
                                <img className="mediaPostImg3" src={this.state.mediaPostPic} alt=""></img>
                            </Link>

                            {/* <Link className="mediaPageLink" to={`/mediapost/${this.props.id}`}>
                                    
                                </Link> */}
                            <div className="mediaPost-banner">
                                <div className="mediaPostTitle3">{this.state.mediaInfo['title']}</div>
                            </div>

                            <div className="mediaPost-overlay-button" onClick={this.displayButtons}><RiPencilFill className="icon" style={{ background: '#3498DB' }} /></div>
                            {this.state.displayButtons &&
                                //if user profile, we will display remove button else all 3
                                (this.props.usersProfile ?
                                    {
                                        'favouriteList':
                                            <div className="mediaPostButtons3">
                                                <div onClick={() => this.updateList(this.props.id, "laterList", "addedLater")}><AiFillClockCircle className="icon small" /></div>
                                                <div onClick={() => this.updateList(this.props.id, "completedList", "addedCompleted")}><ImCheckmark className="icon small" /></div>
                                                <div onClick={() => this.deleteFromList(this.props.id, this.props.listType)}><FaTrashAlt className="icon small" color="#ff5464" /></div>
                                            </div>,
                                        'laterList':
                                            <div className="mediaPostButtons3">
                                                <div onClick={() => this.updateList(this.props.id, "favouriteList", "addedFavourite")}><AiFillHeart className="icon small" /></div>
                                                <div onClick={() => this.updateList(this.props.id, "completedList", "addedCompleted")}><ImCheckmark className="icon small" /></div>
                                                <div onClick={() => this.deleteFromList(this.props.id, this.props.listType)}><FaTrashAlt className="icon small" color="#ff5464" /></div>
                                            </div>,
                                        'completedList':
                                            <div className="mediaPostButtons3">
                                                <div onClick={() => this.updateList(this.props.id, "favouriteList", "addedFavourite")}><AiFillHeart className="icon small" /></div>
                                                <div onClick={() => this.updateList(this.props.id, "laterList", "addedLater")}><AiFillClockCircle className="icon small" /></div>
                                                <div onClick={() => this.deleteFromList(this.props.id, this.props.listType)}><FaTrashAlt className="icon small" color="#ff5464" /></div>
                                            </div>
                                    }[this.props.listType] || <div>LIST TYPE PROPS DNE ERROR!</div>
                                    :
                                    <div className="mediaPostButtons3">
                                        <div onClick={() => this.updateList(this.props.id, "favouriteList", "addedFavourite")}><AiFillHeart className="icon small" /></div>
                                        <div onClick={() => this.updateList(this.props.id, "laterList", "addedLater")}><AiFillClockCircle className="icon small" /></div>
                                        <div onClick={() => this.updateList(this.props.id, "completedList", "addedCompleted")}><ImCheckmark className="icon small" /></div>
                                    </div>)
                            }
                        </div>
                    </div>
                </>
            )
        } else { //.MEDIA_P_TYPE.SIMPLE i.e top10 post style
            return (
                <div className="mediaContainer2">
                    <div className="mediaContainer2-content">
                        {/* picture of media*/}
                        {/* <img className="mediaPostImg2" src={this.state.mediaPostPic} alt={this.state.mediaInfo['title']}></img> */}
                        <div>
                            <Link className="mediaPageLink" to={`/mediapost/${this.state.category}/${this.props.id}`}>
                                {/* title */}
                                <div className="mediaPostTitle2">{this.state.mediaInfo['title']}</div>
                            </Link>
                            {/* limiting displayed tags to max 4 */}
                            {<div className="tagContainer2">
                                {(this.state.mediaInfo['tags']) ?
                                    Object.keys(this.state.mediaInfo['tags']).slice(0, 4).map((keyName, i) => {
                                        return <div className="tag2" style={{ background: `${this.tagColor}` }}>{keyName}</div>
                                    }) : "No tag"}

                            </div>}
                        </div>

                        <div className="ratingValue2">
                            {(this.state.mediaInfo['avgRating']) ?
                                <div style={{ display: 'flex', alignItems: 'center' }}><AiFillStar className="star2" /> {this.state.mediaInfo['avgRating']}</div> : "N/A"}
                        </div>


                        {<div className="releaseDate2">{(this.state.mediaInfo['releaseDate']) ? this.state.mediaInfo['releaseDate'] : "N/A"}</div>}

                        <div>
                            {<div className="author2">{(this.state.mediaInfo['author']) ? this.state.mediaInfo['author'] : "N/A"}</div>}
                            {<div className="mediaPostCategory2">{(this.state.mediaInfo['category']) ? this.state.mediaInfo['category'] : "N/A"}</div>}
                        </div>
                    </div>
                    <Link style={{ backgroundImage: `url(${this.state.mediaPostPic})`, backgroundRepeat: 'no-repeat', backgroundSize: '100% 100%', userSelect: 'none', borderTopRightRadius: '4px', borderBottomRightRadius: '4px' }} to={`/mediapost/${this.state.category}/${this.props.id}`}> </Link>
                </div>
            )
        }
    }
};

export default MediaPost;