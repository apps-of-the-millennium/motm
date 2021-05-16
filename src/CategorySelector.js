
import React from 'react';
import './CategorySelector.css';
import { firestore } from './firebase';


import { useEffect, useState } from 'react';

import { ImBook } from 'react-icons/im';
import { MdLocalMovies } from 'react-icons/md';
import { RiSlideshow3Fill } from 'react-icons/ri';
import { FaGamepad, FaMusic } from 'react-icons/fa';

function CategorySelector(props) {
    const [userInfo, setUserInfo] = useState(undefined);
    const [likes, setLikes] = useState(0);


    useEffect(() => {
        //placed all these in here to remove dependency warnings...dont place in here if u use these values elsewhere


    }, [props]); //[] prevents infinite loops when state is object or array, it will only run on mount and dismount; edit: added props to dependency array, all seems fine



    return (
        <div className="selector-container">
            <h3 className="selector-label">Please select a category</h3>
            <div className="selector-options">
                <div onClick={() => props.onClickCategory('books')} className="category books">
                    <div className="category-label">Books</div>
                    <ImBook className="category-icon"/>
                </div>
                <div className="category movies">
                    <div className="category-label">Movies</div>
                    <MdLocalMovies className="category-icon"/>
                </div>
                <div className="category shows">
                    <div className="category-label">Shows</div>
                    <RiSlideshow3Fill className="category-icon"/>
                </div>
                <div className="category games">
                    <div className="category-label">Games</div>
                    <FaGamepad className="category-icon"/></div>
                <div className="category music">
                    <div className="category-label">Music</div>
                    <FaMusic className="category-icon"/></div>
            </div>


        </div>
    )
}


export default CategorySelector;





