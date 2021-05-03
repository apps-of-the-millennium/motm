//import React, {useState, useEffect } from 'react';
import React from 'react';
import './Home.css';
import MediaPost from './MediaPost';
import { firestore } from "./firebase";
import CustomSelect from './CustomSelect';
import envData from './envData';

class Home extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      trendingPosts: envData.DUMMY_POSTS,
      popularPosts: envData.DUMMY_POSTS,
      topPosts: envData.DUMMY_POSTS,
      searchPosts: [],
      search: '',
      searchTags: []
    }

    this.options = [
      { value: 'action', label: 'Action' },
      { value: 'comedy', label: 'Comedy' },
      { value: 'horror', label: 'Horror' }
    ]
  }

  componentDidMount() {
    this.retrievePosts();
    //this.copyCollection();
    //this.editCollection();
  }

  render() {
    let searchVal = this.state.search;
    let searchTags = this.state.searchTags;
    return (
      <div className="homeBg">
        <div className="searchOptionsContainer">
          <form
            onSubmit={this.handleSubmit}
            className="searchForm">
            <label htmlfor="search" style={{ fontWeight: '700', color: `#cfd2f5`, display: 'inline-block' }}>Search</label><br></br>
            <input className='searchInput'
              onChange={this.handleSearchNameChange}
              value={this.state.search}
              // placeholder="Search..."
              type="search"
              id="search" />
          </form>
          <div className="searchTagForm">
            <CustomSelect handleChange={this.handleSearchTagChange} options={this.options} />
          </div>

        </div>


        {(searchVal === '' && searchTags.length === 0) ? (
          <div>
            <h3 style={{ textAlign: "center", color: `#cfd2f5`, marginTop: "5rem", marginBottom: "3rem" }}>TRENDING</h3>
            <div className="postContainer">
              {
                this.state.trendingPosts.map((post) => {
                  let postInfo = post.postInfo;
                  return (<div key={post.docId}> <MediaPost postType={envData.MEDIA_POST_TYPES.FUNCTIONAL} category={postInfo.category} id={post.docId} title={postInfo.title} info={postInfo.info} summary={postInfo.summary} imageUrl={postInfo.imageUrl} /> </div>)
                })
              }
            </div>


            <h3 style={{ textAlign: "center", color: `#cfd2f5`, marginTop: "5rem", marginBottom: "3rem" }}>POPULAR</h3>
            <div className="postContainer">
              {
                this.state.trendingPosts.map((post) => { //TODO: change to popularposts
                  let postInfo = post.postInfo;
                  return (<div key={post.docId}> <MediaPost postType={envData.MEDIA_POST_TYPES.FUNCTIONAL} category={postInfo.category} id={post.docId} title={postInfo.title} info={postInfo.info} summary={postInfo.summary} imageUrl={postInfo.imageUrl} /> </div>)
                })
              }
            </div>


            <h3 style={{ textAlign: "center", color: `#cfd2f5`, marginTop: "5rem", marginBottom: "3rem" }}>TOP 10</h3>
            <ol className="topContainer">
              {
                this.state.trendingPosts.map((post) => { //TODO: change to topPosts
                  let postInfo = post.postInfo;
                  return (<li key={post.docId}> <MediaPost postType={envData.MEDIA_POST_TYPES.SIMPLE} category={postInfo.category} id={post.docId} title={postInfo.title} info={postInfo.info} summary={postInfo.summary} imageUrl={postInfo.imageUrl} /> </li>)
                })
              }
            </ol>



          </div>) : (
            <>
              <h3 style={{ textAlign: "center", color: `#cfd2f5`, marginTop: "5rem", marginBottom: "3rem" }}>SEARCH RESULTS</h3>
              <div className="postContainer" >
                {
                  this.state.searchPosts.map((post) => {
                    let postInfo = post.postInfo;
                    return (
                      <div key={post.docId}> <MediaPost postType={envData.MEDIA_POST_TYPES.FUNCTIONAL} category={postInfo.category} id={post.docId} title={postInfo.title} info={postInfo.info} summary={postInfo.summary} imageUrl={postInfo.imageUrl} /> </div>
                    )
                  })

                }

                {/* Leaving here temporary: needs to be n-1 of max columns of filler children */}
                <div className="filling-empty-space-childs "></div>
                <div className="filling-empty-space-childs"></div>
                <div className="filling-empty-space-childs"></div>
                <div className="filling-empty-space-childs"></div>
                <div className="filling-empty-space-childs"></div>
              </div>

            </>
          )}


      </div>
    )
  }

  handleSearchNameChange = (e) => {

    this.setState({ search: e.target.value });
    this.retrieveSearchPosts(e.target.value, this.state.searchTags);
  }

  handleSearchTagChange = (searchTags) => {
    this.setState({ searchTags }, () => { this.retrieveSearchPosts(this.state.search, this.state.searchTags) });
    console.log(`Option selected:`, this.state.searchTags);
  }



  handleSubmit = (e) => {
    e.preventDefault(); //prevent default functionality of some button types on empty press, i.e new links, submitting empty form entries
    //this.searchForPost() //TODO
    console.log("Do nothing for now");
  }

  //'posts' -> doc(category) -> collection(bookPosts)
  retrieveSearchPosts = (nameToSearch, tagsToSearch) => {
    this.setState({ searchPosts: [] }, () => {
      let searchValue = nameToSearch.toString().toLowerCase().trim();
      //TODO .doc(category), category should be saved somewhere based on user category type selection and not fixed 'books', same with 'bookPosts'

      //construct the ref
      //console.log(tagsToSearch);
      let ref = firestore.collection('posts').doc('books').collection('bookPosts');

      if (nameToSearch)
        ref = ref.where("titleSubStrings", "array-contains", searchValue)

      if (tagsToSearch) {
        tagsToSearch.forEach((tag) => {
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

  retrievePosts = () => {
    firestore.collection('posts').doc('books').collection('bookPosts').get().then((querySnapshot) => {
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





