import React, { useState, useEffect } from 'react';
import './ReviewEditPage.css';
import firebase from 'firebase/app';
import { firestore } from './firebase';
import TextareaAutosize from 'react-textarea-autosize';
import ImageUploader from "react-images-upload";
import Filter from 'bad-words';

function EditProfile(props) {
    const [userId, setUserId] = useState('');
    const [photo, setPhoto] = useState('');
    const [fileType, setFileType] = useState('');
    const [bio, setBio] = useState('');
    const [userName, setUserName] = useState('');
    const MAX_BIO = 3000; //can change later
    const MAX_USER = 20;

    const onUpload = photo => {
        try {
            console.log(photo);
            setFileType(photo[0]['name'].split('.')[1])
            setPhoto(photo[0]);
        } catch {
            //in case photo is removed in preview need to get rid of throw error in console
            setFileType('');
            setPhoto('');
        }
    };

    function handleSubmit() {
        if(userId) {
            if(userName) {
                let filter = new Filter();
                firestore.collection('users').doc(userId).set(
                    { userName: filter.clean(userName) },
                    { merge: true }
                ).then(() => {
                    console.log("Bio Updated");
                });
            }
            if(bio) {
                let filter = new Filter();
                firestore.collection('users').doc(userId).set(
                    { bio: filter.clean(bio) },
                    { merge: true }
                ).then(() => {
                    console.log("Bio Updated");
                });
            }
            if(photo) {
                var storageRef = firebase.storage().ref();
                //this auto replaces the image no need to check if it exists
                const uploadTask = storageRef.child('profilePics/'+userId+'.'+fileType).put(photo);
                //can change this later if we want proper logging don't have anything in place if it fails
                uploadTask.on('state_changed', 
                    (snapShot) => {
                        console.log(snapShot)
                    }, (err) => {
                        console.log(err)
                    }
                );
                //could cause failed profile pic if it did not get uploaded properly
                firestore.collection('users').doc(userId).set(
                    { profilePic: '/profilePics/'+userId+'.'+fileType },
                    { merge: true }
                ).then(() => {
                    console.log("Profile Picture Updated");
                });
            }
            props.history.push('/profile/'+userId);
        }
    }

    useEffect(() => {
        //I think we can make this a global thing, refactor later
        //https://dev.to/bmcmahen/using-firebase-with-react-hooks-21ap
        firebase.auth().onAuthStateChanged((user) => {
            if (user) {
                setUserId(user.uid);
            }
        });
    })

    return (
        <div className="pageContainer">
            {(userId !== null ?
                <div className="form">
                    <label className="formLabel" htmlFor="userName">Update Username</label><br/>
                    <TextareaAutosize
                        className="editUserName"
                        id="userName"
                        onChange={(e) => setUserName(e.target.value)} > 
                    </TextareaAutosize><br/>

                    <label className="formLabel" htmlFor="uploadPhoto">Upload Photo</label><br/>
                    <ImageUploader style={{width:'25%', marginBottom:'1rem'}}
                        withIcon={true}
                        onChange={onUpload}
                        withPreview={true}
                        singleImage={true}
                        buttonText={"Choose Image"}
                        imgExtension={[".jpg", ".gif", ".png", ".gif"]}
                        maxFileSize={5242880} //can change
                        fileContainerStyle={{background:'var(--color-background-light'}}
                    />

                    <label className="formLabel" htmlFor="bio">Update Bio</label><br/>
                    <TextareaAutosize
                        className="editBio"
                        id="bio"
                        onChange={(e) => setBio(e.target.value)} > 
                    </TextareaAutosize>

                    {(bio.length <= MAX_BIO && userName.length <= MAX_USER) ?
                        //there might be a workaround if you  can edit message you want to send to make it bigger than MAX_BIO
                        (<div className="saveButton" onClick={() => handleSubmit()}>Save</div>) 
                        : <div className="warningMessage">Bio must have no more than {MAX_BIO} characters and Username must have no more than {MAX_USER}</div> 
                    }

                </div>
            : <div style={{ background: "#070e1b", color: "white" }}>Dude...sign in first</div>
            )}
        </div>
  );
}

export default EditProfile;