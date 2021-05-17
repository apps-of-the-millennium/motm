
import React from 'react';
import './CategorySelector.css';
import { firestore } from './firebase';


import { useEffect, useState } from 'react';

import { ImBook } from 'react-icons/im';
import { MdLocalMovies } from 'react-icons/md';
import { RiSlideshow3Fill } from 'react-icons/ri';
import { FaGamepad, FaMusic } from 'react-icons/fa';

function CategorySelector(props) {
    // const [category, setCategory] = useState('');
    const category = props.category;
    const [currentCategory, setCurrentCategory] = useState(category);



    useEffect(() => {
        //placed all these in here to remove dependency warnings...dont place in here if u use these values elsewhere

    }, [props]); //[] prevents infinite loops when state is object or array, it will only run on mount and dismount; edit: added props to dependency array, all seems fine

    //triggers the condition for myColor() i.e changes background color of current category
    function toggle(categoryAtPosition){
        if (currentCategory !== categoryAtPosition) {
          setCurrentCategory(categoryAtPosition);
        } 
    }
    
    //changes background color if the current category is the same category as the small button
    function myColor(categoryAtPosition) {
        if (currentCategory === categoryAtPosition) {
          return '#008cff';
        }
        return "";
    }

    if (category === '') {
        return (
            <div className="selector-container">
                <h3 className="selector-label center">Please select a category</h3>
                <div className="selector-options page">
                    <div onClick={() => props.onClickCategory('books')} className="category books">
                        <div className="category-label">Books</div>
                        <ImBook className="category-icon big" />
                    </div>

                    <div onClick={() => props.onClickCategory('movies')} className="category movies">
                        <div className="category-label">Movies</div>
                        <MdLocalMovies className="category-icon big" />
                    </div>

                    <div onClick={() => props.onClickCategory('shows')} className="category shows">
                        <div className="category-label">Shows</div>
                        <RiSlideshow3Fill className="category-icon big" />
                    </div>

                    <div onClick={() => props.onClickCategory('games')} className="category games">
                        <div className="category-label">Games</div>
                        <FaGamepad className="category-icon big" />
                    </div>

                    <div onClick={() => props.onClickCategory('music')} className="category music">
                        <div className="category-label">Music</div>
                        <FaMusic className="category-icon big" />
                    </div>
                </div>
            </div>
        )
    }
    return (
        <div className="selector-popup-container">
            <h4 className="selector-label left">Current Category</h4>
            <div className="selector-options popup">
                <div style={{background: myColor('books')}} onClick={() => {toggle('books'); props.onClickCategory('books')}} className="category-popup">
                    <ImBook  className="category-icon small" />
                </div>

                <div style={{background: myColor('movies')}} onClick={() => {toggle('movies'); props.onClickCategory('movies')}} className="category-popup">
                    <MdLocalMovies className="category-icon small" />
                </div>

                <div style={{background: myColor('shows')}} onClick={() => {toggle('shows'); props.onClickCategory('shows')}} className="category-popup">
                    <RiSlideshow3Fill className="category-icon small" />
                </div>

                <div style={{background: myColor('games')}} onClick={() => {toggle('games'); props.onClickCategory('games')}} className="category-popup">
                    <FaGamepad className="category-icon small" />
                </div>

                <div style={{background: myColor('music')}} onClick={() => {toggle('music'); props.onClickCategory('music')}} className="category-popup">
                    <FaMusic className="category-icon small" />
                </div>
            </div>
        </div>
    )



}


export default CategorySelector;





