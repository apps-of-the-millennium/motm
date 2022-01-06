//import React, {useState, useEffect } from 'react';
import React from 'react';
import './Home.css';
import MediaPost from './MediaPost';
import { firestore } from "./firebase";
import Search from './Search';

import { MEDIA_POST_TYPES } from './envData';

class BrowsePage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            browsePosts: [], //these are just temp posts when search is empty, might change later

            searching: false,
            //orderFilterName: 'rating'
            //orderFilterDirection: 'asc'

            category: '',
            isCategorySelectVisible: false
        }

        this.options = [ //probably move , 
            //to use without a group heading remove label: and options: just keep the options objects
            {
                label: "Genres",
                options: [
                    { value: 'action', label: 'Action' },
                    { value: 'comedy', label: 'Comedy' },
                    { value: 'horror', label: 'Horror' }
                ]
            }
        ]

        this.categoryPostString = '';
    }

    componentDidMount() {
        if (typeof (Storage) !== "undefined") {
            let session_savedCategory = sessionStorage.getItem('savedCategory');
            if (session_savedCategory) {
                this.onClickCategory(session_savedCategory);
            }
        }
    }

    render() {
        return (
            <div className="homeBg">
                <Search category={this.state.category} handleSearching={this.handleSearching} onClickCategory={this.onClickCategory} />
                { (!this.state.searching) && (this.state.category !== '') ? (
                    <div className="home-content">
                        <div className="content-section"></div>
                            <div className="section-posts regular">
                                { this.state.browsePosts.map((post) => {
                                    let postInfo = post.postInfo;
                                    //return (<div key={post.docId}> <MediaPost postType={MEDIA_POST_TYPES.FUNCTIONAL} category={postInfo.category} id={post.docId} title={postInfo.title} info={postInfo.info} summary={postInfo.summary} imageUrl={postInfo.imageUrl} /> </div>)
                                    return (<div key={post.docId}> <MediaPost postType={MEDIA_POST_TYPES.FUNCTIONAL} category={postInfo.category} id={post.docId}  /> </div>)
                                })}
                            </div>
                    </div>
                ) : (
                    <div></div>
                ) }
            </div>
        )
    }

    handleSearching = (nameSearch, tagLength) => {
        // bool to check if there are words or tags or nothing
        let searchBool = Boolean(nameSearch) || Boolean(tagLength)
        this.setState({ searching: searchBool });
    }

    onClickCategory = (categoryType) => {
        if (this.state.category !== categoryType) {
            this.setState({ category: categoryType }, () => {
                this.categoryPostString = this.state.category.slice(0, -1) + 'Posts';
                this.retrieveBrowsePosts();
                // this.retrieveSearchPosts(); //in case they tried to type stuff in search before category selection

                if (typeof (Storage) !== "undefined") {
                    sessionStorage.setItem('savedCategory', this.state.category);
                }
            });
        }
    }

    displayCategorySelector = () => {
        this.setState({ isCategorySelectVisible: !this.state.isCategorySelectVisible });
    }

    //this is just for when you are browsing but you have not typed in search or added a filter just meant to retrieve
    //for now 15 top posts as a placeholder

    retrieveBrowsePosts = () => {
        //must reset the list to [] before making a db call, since this call is triggered whenever the user selects a new category through selector
        this.setState({ browsePosts: [] }, () => {
            firestore.collection('posts').doc(this.state.category).collection(this.categoryPostString).limit(15).get().then((querySnapshot) => {

                querySnapshot.docs.forEach(doc => {
                    console.log(doc.id);
                    const newPost = {
                        docId: doc.id,
                        postInfo: doc.data()
                    }
                    this.setState({ browsePosts: [...this.state.browsePosts, newPost] }); //...arrayName basically used to append a new item to the original array (aka spread syntax)
                });
            });
        });

    }


} //Class Home ===============

export default BrowsePage;





