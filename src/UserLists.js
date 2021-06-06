import { useState, useEffect } from 'react';
import { firestore } from './firebase';

import MediaPost from './MediaPost';
import envData from './envData';

function UserLists(props) {
    const [favourites, setFavourites] = useState([]);
    const [later, setLater] = useState([]);
    const [completed, setCompleted] = useState([]);

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
        })

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

    return (
        <div>
            <div style={{ marginBottom: '48px' }}>
                {/* Favourites List */}
                <div className="section-label">Favourites</div>
                <div className="section-posts list">
                    {
                        favourites.map((post) => {
                            if (post) {
                                return (<div key={post}> <MediaPost postType={envData.MEDIA_POST_TYPES.LIST} id={post} usersProfile={props.usersProfile} listType={"favouriteList"} updateList={updateList} /> </div>)
                            }
                            return (<></>)
                        })
                    }
                </div>
            </div>

            <div style={{ marginBottom: '48px' }}>
                <div className="section-label"> Watch Later</div>
                <div className="section-posts list">
                    {
                        later.map((post) => {
                            if (post) {
                                return (<div key={post}> <MediaPost postType={envData.MEDIA_POST_TYPES.LIST} id={post} usersProfile={props.usersProfile} listType={"laterList"} updateList={updateList} />  </div>)
                            }
                            return (<></>)
                        })
                    }
                </div>
            </div>

            <div style={{ marginBottom: '48px' }}>
                <div className="section-label">Completed</div>
                <div className="section-posts list">
                    {
                        completed.map((post) => {
                            if (post) {
                                return (<div key={post}> <MediaPost postType={envData.MEDIA_POST_TYPES.LIST} id={post} usersProfile={props.usersProfile} listType={"completedList"} updateList={updateList} /> </div>)
                            }
                            return (<></>)
                        })
                    }
                </div>
            </div>
        </div>
    )
}

export default UserLists;
