import { useState, useEffect } from 'react';
import { firestore } from './firebase';

import MediaPost from './MediaPost';
import { MEDIA_POST_TYPES } from './envData';
import './ProfilePage.css';

import { FiArrowRightCircle } from 'react-icons/fi';

function UserLists(props) {
    const [favourites, setFavourites] = useState([]);
    const [later, setLater] = useState([]);
    const [completed, setCompleted] = useState([]);
    const LIMIT = 4;
    const style = { position: 'inherit', background: 'none', 'background-color': 'transparent', border: 'none'};

    useEffect(() => {
        let lists = firestore.collection('users').doc(props.userId).collection('lists');
        //refactor these functions, same functions diff variable
        lists.doc('laterList').get().then((doc) => {
            if (doc.exists) {
                setLater(doc.data()['laterList']);
            }
        })

        lists.doc('completedList').get().then((doc) => {
            if (doc.exists) {
                setCompleted(doc.data()['completedList']);
            }
        })

        lists.doc('favouriteList').get().then((doc) => {
            if (doc.exists) {
                setFavourites(doc.data()['favouriteList']);
            }
        });

        return () => { //clean up on unmount
            setFavourites([]);
            setLater([]);
            setCompleted([]);
        };

    }, [props]);


    function updateList(listType) {
        var lists = firestore.collection('users').doc(props.userId).collection('lists');
        lists.doc(listType).get().then((doc) => {
            if (doc.exists) {
                switch (listType) {
                    case 'favouriteList':
                        setFavourites(doc.data()[listType]);
                        break;
                    case 'laterList':
                        setLater(doc.data()[listType]);
                        break;
                    case 'completedList':
                        setCompleted(doc.data()[listType]);
                        break;
                    default:
                        console.log.error('Failed to update: list type not found');
                }
            }
        })
    }

    //TODO: update to show full lists (this is for scenarios where we may not want to open 200+ MediaPosts if list is huge)
    function viewMore(list) {
        console.log("Not implemented yet "+list);
    }

    return (
        <div>
            <div style={{ marginBottom: '48px' }}>
                {/* Favourites List */}
                <div className="section-label">Favourites</div>
                <div className="section-posts list">
                    {
                        favourites.slice(0,LIMIT).map((post) => {
                            return (<div key={post}> <MediaPost postType={MEDIA_POST_TYPES.LIST} id={post} usersProfile={props.usersProfile} listType={"favouriteList"} updateList={updateList} /> </div>)
                        })
                    }
                    <button className="view-more" onClick={() => viewMore('favouriteList')}>View More<br/><FiArrowRightCircle className="arrow-userList" style={style} /></button>
                </div>
            </div>

            <div style={{ marginBottom: '48px' }}>
                <div className="section-label"> Watch Later</div>
                <div className="section-posts list">
                    {
                        later.slice(0,LIMIT).map((post) => {
                            return (<div key={post}> <MediaPost postType={MEDIA_POST_TYPES.LIST} id={post} usersProfile={props.usersProfile} listType={"laterList"} updateList={updateList} />  </div>)
                        })
                    }
                    <button className="view-more" onClick={() => viewMore('laterList')}>View More<br/><FiArrowRightCircle className="arrow-userList" style={style} /></button>
                </div>
            </div>

            <div style={{ marginBottom: '48px' }}>
                <div className="section-label">Completed</div>
                <div className="section-posts list">
                    {
                        completed.slice(0,LIMIT).map((post) => {
                            return (<div key={post}> <MediaPost postType={MEDIA_POST_TYPES.LIST} id={post} usersProfile={props.usersProfile} listType={"completedList"} updateList={updateList} /> </div>)
                        })
                    }
                    <button className="view-more" onClick={() => viewMore('completedList')}>View More<br/><FiArrowRightCircle className="arrow-userList" style={style} /></button>
                </div>
            </div>
            {/* Add User created lists here maybe first 2 or 3 then view more */}
        </div>
    )
}

export default UserLists;
