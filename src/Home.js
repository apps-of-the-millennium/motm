//import React, {useState, useEffect } from 'react';
import React from 'react';
import './Home.css';
import MediaPost from './MediaPost';
import { firestore } from "./firebase";
import CustomSelect from './CustomSelect';
import CategorySelector from './CategorySelector';

import { MEDIA_POST_TYPES, getAllSubstrings } from './envData';

import { FaIcons, FaSearch } from 'react-icons/fa'; //make the filters into separate component?
const LIMIT = 6;

class Home extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      trendingPosts: [],//envData.DUMMY_POSTS,
      popularPosts: [],//envData.DUMMY_POSTS,
      topPosts: [],//envData.DUMMY_POSTS,
      searchPosts: [],

      searchName: '',
      searchTags: [],

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
    let searchVal = this.state.searchName;
    let searchTags = this.state.searchTags;
    return (
      <div className="homeBg">
        <div className="pageContentContainer">
          <div className="filtersContainer">
            <div className="filters">
              <div className="filter-option">
                <div style={{ fontWeight: '500', color: `var(--color-text)`, transition: 'color 1s', marginBottom: '10px' }}>Search</div>
                <div className="filter-value-container">
                  <FaSearch style={{ color: 'var(--color-text)', transition: 'color 1s', position: 'absolute', top: "11px", left: "12px" }} />
                  <input className='searchInput'
                    onChange={this.handleSearchNameChange}
                    value={this.state.searchName}
                    autoComplete="off"
                    // placeholder="Search..."
                    type="search"
                    id="search" />
                </div>

              </div>

              <div className="filter-option">
                <div className="filter-value-container">
                  <CustomSelect handleChange={this.handleSearchTagChange} options={this.options} label="Genres" />
                </div>
              </div>
            </div>
            {this.state.category !== '' &&
              <div className="extra-filters">
                <div className="category-select-button" onClick={this.displayCategorySelector}><FaIcons className="icons-style" />
                </div>
                {this.state.isCategorySelectVisible &&
                  <CategorySelector category={this.state.category} onClickCategory={this.onClickCategory} />
                }
              </div>
            }


          </div>

          {(this.state.category === '') ?
            <CategorySelector category={this.state.category} onClickCategory={this.onClickCategory} /> :
            (searchVal === '' && searchTags.length === 0) ? (
              <div className="home-content">
                {/* Note: the word trending represents a css subclass, i.e use style from content-section and then any extra css under subclass trending */}
                <div className="content-section trending">
                  <div className="section-label">
                    TRENDING
                    <div className="view-more" style={{ fontSize: '12px' }} onClick={() => this.handlePostPagination(this.state.lastTrending, 'trendingPosts')}>view more</div>
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
                    <div className="view-more" style={{ fontSize: '12px' }}>view more</div>
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
                    <div style={{ fontSize: '12px' }}>view more</div>
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

              </div>) : (
                <div className="content-section results">
                  {(this.state.searchPosts.length === 0) ? <h3 className="section-label">There are no results to be shown...</h3> :
                    <>
                      <h3 className="section-label">SEARCH RESULTS</h3>
                      <div className="section-posts regular" >
                        {
                          this.state.searchPosts.map((post) => {
                            let postInfo = post.postInfo;
                            return (
                              <div key={post.docId}> <MediaPost postType={MEDIA_POST_TYPES.FUNCTIONAL} category={postInfo.category} id={post.docId} title={postInfo.title} info={postInfo.info} summary={postInfo.summary} imageUrl={postInfo.imageUrl} /> </div>
                            )
                          })
                        }
                      </div>
                    </>
                  }
                </div>
              )
          }

        </div>
      </div>
    )
  }

  handleSearchNameChange = (e) => {
    this.setState({ searchName: e.target.value }, () => {
      this.retrieveSearchPosts();
    });

  }

  handleSearchTagChange = (searchTags) => {
    this.setState({ searchTags }, () => { this.retrieveSearchPosts() });
    console.log(`Option selected:`, this.state.searchTags);
  }

  onClickCategory = (categoryType) => {
    if (this.state.category !== categoryType) {
      this.setState({ category: categoryType }, () => {
        this.categoryPostString = this.state.category.slice(0, -1) + 'Posts';
        this.retrievePosts();
        this.retrieveSearchPosts(); //in case they tried to type stuff in search before category selection

        if (typeof (Storage) !== "undefined") {
          sessionStorage.setItem('savedCategory', this.state.category);
        }

      });
    }
  }

  displayCategorySelector = () => {
    this.setState({ isCategorySelectVisible: !this.state.isCategorySelectVisible });
  }


  retrieveSearchPosts = () => {
    if (this.state.category !== '') {
      
      this.setState({ searchPosts: [] }, () => {

        //TODO .doc(category), category should be saved somewhere based on user category type selection and not fixed 'books', same with this.categoryPostString

        //construct the ref
        //console.log(this.state.searchTags);
        let ref = firestore.collection('posts').doc(this.state.category).collection(this.categoryPostString);

        if (this.state.searchName !== '') {
          let searchValue = this.state.searchName.toString().toLowerCase().trim();
          ref = ref.where("titleSubStrings", "array-contains", searchValue)
        }

        if (this.state.searchTags) {
          this.state.searchTags.forEach((tag) => {
            ref = ref.where(`tags.${tag.value}`, '==', 'true');
          });
        }

        ref.get()
          .then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
              const newPost = {
                docId: doc.id,
                postInfo: doc.data()
              }

              if (this.state.searchPosts.findIndex(i => i.docId === doc.id) === -1) //only add to search posts if it doesnt exist yet
                this.setState({ searchPosts: [...this.state.searchPosts, newPost] }); //may need to do once at the end to avoid async issues?
            });
          });
      });

    }

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





