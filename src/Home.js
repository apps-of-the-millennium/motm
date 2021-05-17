//import React, {useState, useEffect } from 'react';
import React from 'react';
import './Home.css';
import MediaPost from './MediaPost';
import { firestore } from "./firebase";
import CustomSelect from './CustomSelect';
import CategorySelector from './CategorySelector';

import envData from './envData';

import { FaIcons, FaSearch } from 'react-icons/fa'; //make the filters into separate component?

class Home extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      trendingPosts: envData.DUMMY_POSTS,
      popularPosts: envData.DUMMY_POSTS,
      topPosts: envData.DUMMY_POSTS,
      searchPosts: [],

      searchName: '',
      searchTags: [],

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
                <div style={{ fontWeight: '500', color: `#cfd2f5`, marginBottom: '10px' }}>Search</div>
                <div className="filter-value-container">
                  <FaSearch style={{color:'#cfd2f5', position:'absolute', top:"11px", left:"12px"}} />
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
                    <h3>TRENDING</h3>
                    <div style={{ fontSize: '12px' }}>view more</div>
                  </div>
                  <div className="section-posts">
                    {
                      this.state.trendingPosts.map((post) => {
                        let postInfo = post.postInfo;
                        return (<div key={post.docId}> <MediaPost postType={envData.MEDIA_POST_TYPES.FUNCTIONAL} category={postInfo.category} id={post.docId} title={postInfo.title} info={postInfo.info} summary={postInfo.summary} imageUrl={postInfo.imageUrl} /> </div>)
                      })
                    }
                  </div>
                </div>

                <div className="content-section popular">
                  <div className="section-label">
                    <h3>POPULAR</h3>
                    <div style={{ fontSize: '12px' }}>view more</div>
                  </div>
                  <div className="section-posts">
                    {
                      this.state.trendingPosts.map((post) => { //TODO: change to popularposts
                        let postInfo = post.postInfo;
                        return (<div key={post.docId}> <MediaPost postType={envData.MEDIA_POST_TYPES.FUNCTIONAL} category={postInfo.category} id={post.docId} title={postInfo.title} info={postInfo.info} summary={postInfo.summary} imageUrl={postInfo.imageUrl} /> </div>)
                      })
                    }
                  </div>
                </div>

                <div className="content-section top">
                  <div className="section-label">
                    <h3>TOP 10</h3>
                    <div style={{ fontSize: '12px' }}>view more</div>
                  </div>
                  {/* <ol className="section-posts">
                    {
                      this.state.trendingPosts.map((post) => {
                        let postInfo = post.postInfo;
                        return (<li key={post.docId}> <MediaPost postType={envData.MEDIA_POST_TYPES.SIMPLE} category={postInfo.category} id={post.docId} title={postInfo.title} info={postInfo.info} summary={postInfo.summary} imageUrl={postInfo.imageUrl} /> </li>)
                      })
                    }
                  </ol> */}
                </div>

              </div>) : (
                <div className="content-section results">
                  {(this.state.searchPosts.length === 0) ? <h3 className="section-label">There are no results to be shown...</h3> :
                    <>
                      <h3 className="section-label">SEARCH RESULTS</h3>
                      <div className="section-posts" >
                        {
                          this.state.searchPosts.map((post) => {
                            let postInfo = post.postInfo;
                            return (
                              <div key={post.docId}> <MediaPost postType={envData.MEDIA_POST_TYPES.FUNCTIONAL} category={postInfo.category} id={post.docId} title={postInfo.title} info={postInfo.info} summary={postInfo.summary} imageUrl={postInfo.imageUrl} /> </div>
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
        let searchValue = this.state.searchName.toString().toLowerCase().trim();
        //TODO .doc(category), category should be saved somewhere based on user category type selection and not fixed 'books', same with 'bookPosts'

        //construct the ref
        //console.log(this.state.searchTags);
        let ref = firestore.collection('posts').doc(this.state.category).collection('bookPosts');

        if (this.state.searchName)
          ref = ref.where("titleSubStrings", "array-contains", searchValue)

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
    this.setState({ trendingPosts: envData.DUMMY_POSTS }, () => {
      firestore.collection('posts').doc(this.state.category).collection('bookPosts').get().then((querySnapshot) => {
        // const tempDocument = querySnapshot.docs.map(doc => {
        querySnapshot.docs.forEach(doc => {
          console.log(doc.id);
          const newPost = {
            docId: doc.id,
            postInfo: doc.data()
          }
          this.setState({ trendingPosts: [...this.state.trendingPosts, newPost] }); //...arrayName basically used to append a new item to the original array (aka spread syntax)
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
        let allSubStrings = envData.getAllSubstrings(doc.data().title, 2);
        firestore.collection('posts').doc('books').collection('bookPosts').doc(doc.id).set({
          ...doc.data(), ...{ titleSubStrings: allSubStrings }
        });


      });
    }).catch((error) => {
      console.log("Error getting documents: ", error);
    });

  }

  editCollection = () => {
    firestore.collection('posts').doc('books').collection('bookPosts').get().then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        let allSubStrings = envData.getAllSubstrings(doc.data().title.toLowerCase(), 2);
        firestore.collection('posts').doc('books').collection('bookPosts').doc(doc.id).set({
          ...doc.data(), ...{ titleSubStrings: allSubStrings }
        });


      });
    }).catch((error) => {
      console.log("Error getting documents: ", error);
    });
  }



} //Class Home ===============

export default Home;





