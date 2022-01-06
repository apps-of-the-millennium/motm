//import React, {useState, useEffect } from 'react';
import React from 'react';
import './Home.css';
import MediaPost from './MediaPost';
import { firestore } from "./firebase";
import { Link } from 'react-router-dom';
import Search from './Search';

import { MEDIA_POST_TYPES, getAllSubstrings } from './envData';

const LIMIT = 5;
class Home extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      trendingPosts: [],//envData.DUMMY_POSTS,
      popularPosts: [],//envData.DUMMY_POSTS,
      topPosts: [],//envData.DUMMY_POSTS,
      searching: false,

      category: '',

      isCategorySelectVisible: false,
      canLoadMore: false, //this is probably bad practice but we should always be able to loadmore at the start assuming we have more than 6
      lastTrending: [],
      lastPopular: [],
      lastTop: [],
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

  //Note December 23 2021: Seems like we already use a call to db to display these, but we also do the same db call in MediaPost component, so there might be a duplication of info retrieval
  handlePostPagination(lastDoc, postType) {
    //known crash in Development: if you add the 6th post and then click load more, you will be shown an uncommited timestamp error
    if (this.state.canLoadMore) {
      console.log('can load more');
        if (lastDoc) { //&& lastDoc.data().timestamp !== null) {
            firestore
                .collection('posts').doc(this.state.category).collection(this.categoryPostString)
                .orderBy('timestamp', 'desc') //not sure how it's ordering
                .startAfter(lastDoc)
                .limit(LIMIT)
                .get()
                .then((querySnapshot) => {
                  console.log(querySnapshot.docs);
                    if (querySnapshot.docs.length < LIMIT) { //if we query for posts and end up with less than LIMIT_VALUE posts, it means we have run out, so disable button functionality
                      this.setState({ canLoadMore: false });
                    }
                    //edgecase: will be undefined if querysnapshot.docs.length is 0, but wont break since we disable the button in qs.docs.length < LIMIT
                    let last_doc = querySnapshot.docs[querySnapshot.docs.length - 1];
                    this.setState({ lastTrending : last_doc }) //TODO: change to specific kind need to specify as argument which section we are updating
                    querySnapshot.forEach((doc) => {
                      const mediaPost = {
                        docId: doc.id,
                        postInfo: doc.data()
                      }
                      this.setState({ [postType] : [...this.state[postType], mediaPost] })
                    });
                });
        } else {
            console.warn('Lastdoc timestamp is null/uncommited, pagination unavailable');
        }
    } else {
        console.warn("NO MORE POSTS");
    }
  }

  componentDidMount() {

    if (typeof (Storage) !== "undefined") {
      let session_savedCategory = sessionStorage.getItem('savedCategory');
      if (session_savedCategory) {
        this.onClickCategory(session_savedCategory);
      }
    }
    //this.copyCollection();
    //this.editCollection();
  }

  render() {
    return (
      <div className="homeBg">
        {/* <div className="pageContentContainer"> */}
        <Search category={this.state.category} handleSearching={this.handleSearching} onClickCategory={this.onClickCategory} />
          { (!this.state.searching) && (this.state.category !== '') ? (
            <div className="home-content">
              {/* Note: the word trending represents a css subclass, i.e use style from content-section and then any extra css under subclass trending */}
              <div className="content-section trending">
                <div className="section-label">
                  TRENDING
                  {/* ChANGE TO LINK */}
                  <Link className="view-more" style={{ fontSize: '12px' }} to={`/`+this.state.category+`/trending`}>View More</Link>
                  {/* <div className="view-more" style={{ fontSize: '12px' }} onClick={() => this.handlePostPagination(this.state.lastTrending, 'trendingPosts')}>View more</div> */}
                </div>
                <div className="section-posts regular">
                  {
                    this.state.trendingPosts.map((post) => {
                      let postInfo = post.postInfo;
                      //return (<div key={post.docId}> <MediaPost postType={MEDIA_POST_TYPES.FUNCTIONAL} category={postInfo.category} id={post.docId} title={postInfo.title} info={postInfo.info} summary={postInfo.summary} imageUrl={postInfo.imageUrl} /> </div>)
                      return (<div key={post.docId}> <MediaPost postType={MEDIA_POST_TYPES.FUNCTIONAL} category={postInfo.category} id={post.docId}  /> </div>)
                    })
                  }
                </div>
              </div>

              <div className="content-section popular">
                <div className="section-label">
                  POPULAR
                  {/* ChANGE TO LINK */}
                  <Link className="view-more" style={{ fontSize: '12px' }} to={`/`+this.state.category+`/popular`}>View More</Link>
                  {/* <div className="view-more" style={{ fontSize: '12px' }}>View more</div> */}
                </div>
                <div className="section-posts regular">
                  {
                    this.state.trendingPosts.map((post) => { //TODO: change to popularposts //Note: MediaPost component seems to be retrieving db info for the post using id anyways, i dont think we need all these props
                      let postInfo = post.postInfo;
                      //return (<div key={post.docId}> <MediaPost postType={MEDIA_POST_TYPES.FUNCTIONAL} category={postInfo.category} id={post.docId} title={postInfo.title} info={postInfo.info} summary={postInfo.summary} imageUrl={postInfo.imageUrl} /> </div>)
                      return (<div key={post.docId}> <MediaPost postType={MEDIA_POST_TYPES.FUNCTIONAL} category={postInfo.category} id={post.docId} /> </div>)
                    })
                  }
                </div>
              </div> 

              <div className="content-section top">
                <div className="section-label">
                  TOP 10
                  {/* LIMIT TO 10 */}
                  <div style={{ fontSize: '12px' }}>View more</div>
                </div>
                <div className="section-posts top">
                  {
                    this.state.trendingPosts.map((post, index) => {
                      let postInfo = post.postInfo;
                      //<MediaPost postType={MEDIA_POST_TYPES.SIMPLE} category={postInfo.category} id={post.docId} title={postInfo.title} info={postInfo.info} summary={postInfo.summary} imageUrl={postInfo.imageUrl} />
                      return (
                        <div className="top-post-container" key={post.docId}>
                          <div className="order-value">{index+1}</div>
                          <MediaPost postType={MEDIA_POST_TYPES.SIMPLE} category={postInfo.category} id={post.docId}  />
                        </div>
                      )
                    })
                  }
                </div>
              </div>
            </div> ) : (
              <div></div>
            )
          }
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
        this.retrievePosts();
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

  retrievePosts = () => {
    //todo make separate functions for each post section (i.e trneding popular, top)

    //must reset the list to [] before making a db call, since this call is triggered whenever the user selects a new category through selector
    this.setState({ trendingPosts: [] }, () => {
      //console.log(this.state.category)
      //console.log(this.categoryPostString)
      
      // breaks for movies because not named right in firebase, also tags are not in a map, so not showing correctly, images not working too
      firestore.collection('posts').doc(this.state.category).collection(this.categoryPostString).orderBy('timestamp', 'desc').limit(LIMIT) //not sure how it's ordering
      .get().then((querySnapshot) => {
        // const tempDocument = querySnapshot.docs.map(doc => {
        let count = 0;
        querySnapshot.docs.forEach(doc => {
          // console.log(doc.id);
          const newPost = {
            docId: doc.id,
            postInfo: doc.data()
          }
          count++;
          if (count === LIMIT) { //save the final retrieved document (used for pagination) this if statement should only run ONCE
            this.setState({ lastTrending : doc, lastPopular: doc, lastTop: doc, canLoadMore: true }); // should be the last newPost
            //TODO: when we have them all separated setstate differently
          }
          this.setState({ trendingPosts: [...this.state.trendingPosts, newPost] }); //...arrayName basically used to append a new item to the original array (aka spread syntax)
          //console.log(this.state.trendingPosts)
        });
      });
    });

  }

  // retrievePopular = () => {

  // }

  //===============================================
  //used to copy posts to a new collection
  copyCollection = () => {
    console.log("hello?");
    firestore.collection("posts").get().then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        let allSubStrings = getAllSubstrings(doc.data().title, 2);
        firestore.collection('posts').doc('books').collection(this.categoryPostString).doc(doc.id).set({
          ...doc.data(), ...{ titleSubStrings: allSubStrings }
        });


      });
    }).catch((error) => {
      console.log("Error getting documents: ", error);
    });

  }

  editCollection = () => {
    firestore.collection('posts').doc('books').collection(this.categoryPostString).get().then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        let allSubStrings = getAllSubstrings(doc.data().title.toLowerCase(), 2);
        firestore.collection('posts').doc('books').collection(this.categoryPostString).doc(doc.id).set({
          ...doc.data(), ...{ titleSubStrings: allSubStrings }
        });


      });
    }).catch((error) => {
      console.log("Error getting documents: ", error);
    });
  }



} //Class Home ===============

export default Home;





