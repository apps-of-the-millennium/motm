//import React, {useState, useEffect } from 'react';
import React from 'react';
import './Home.css';
import MediaPost from './MediaPost';
import { firestore } from "./firebase";


import envData from './envData';
//console.log(env.TEST);

// import { makeStyles } from '@material-ui/core/styles';

// function getModalStyle() {
//   const top = 50;
//   const left = 50;

//   return {
//     top: `${top}%`,
//     left: `${left}%`,
//     transform: `translate(-${top}%, -${left}%)`,
//   };
// }

// const useStyles = makeStyles((theme) => ({
//   paper: {
//     position: 'absolute',
//     width: 400,
//     backgroundColor: theme.palette.background.paper,
//     border: '2px solid #000',
//     boxShadow: theme.shadows[5],
//     padding: theme.spacing(2,4,3),
//   },
// }));

const DUMMY_POSTS = [
  {
    docId: '1',
    postInfo: {
      category: '',
      title: '',
      info: '',
      summary: '',
      imageUrl: ''
    }
  },
  {
    docId: '2',
    postInfo: {
      category: '',
      title: '',
      info: '',
      summary: '',
      imageUrl: ''
    }
  },
  {
    docId: '3',
    postInfo: {
      category: '',
      title: '',
      info: '',
      summary: '',
      imageUrl: ''
    }
  },
  {
    docId: '4',
    postInfo: {
      category: '',
      title: '',
      info: '',
      summary: '',
      imageUrl: ''

    }
  }

]

class Home extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      trendingPosts: DUMMY_POSTS,
      popularPosts: DUMMY_POSTS,
      topPosts: DUMMY_POSTS,
      searchPosts: [],
      search: ''
    }
  }

  componentDidMount() {
    this.retrievePosts();
    //this.copyCollection();
    //this.editCollection();
  }

  render() {
    let searchVal = this.state.search;
    return (
      <div className="homeBg">
        <form
          onSubmit={this.handleSubmit}
          className="searchForm">
          <label for="search" style={{ fontWeight: '700', color: `#cfd2f5`, display: 'inline-block', marginBottom: '1rem' }}>Search</label><br></br>
          <input className='searchInput'
            onChange={this.handleChange}
            value={this.state.search}
            // placeholder="Search..."
            type="search"
            id="search" />
        </form>


        {searchVal === '' ? (
          <div>
            <h3 style={{ textAlign: "center", color: `#cfd2f5`, marginTop: "5rem", marginBottom: "1rem" }}>TRENDING</h3>
            <div className="postContainer">
              {
                this.state.trendingPosts.map((post) => {
                  let postInfo = post.postInfo;
                  return (<div key={post.docId}> <MediaPost postType={envData.MEDIA_POST_TYPES.FUNCTIONAL} category={postInfo.category} id={post.docId} title={postInfo.title} info={postInfo.info} summary={postInfo.summary} imageUrl={postInfo.imageUrl} /> </div>)
                })
              }
            </div>


            <h3 style={{ textAlign: "center", color: `#cfd2f5`, marginTop: "5rem", marginBottom: "1rem" }}>POPULAR</h3>
            <div className="postContainer">
              {
                this.state.trendingPosts.map((post) => { //TODO: change to popularposts
                  let postInfo = post.postInfo;
                  return (<div key={post.docId}> <MediaPost postType={envData.MEDIA_POST_TYPES.FUNCTIONAL} category={postInfo.category} id={post.docId} title={postInfo.title} info={postInfo.info} summary={postInfo.summary} imageUrl={postInfo.imageUrl} /> </div>)
                })
              }
            </div>


            <h3 style={{ textAlign: "center", color: `#cfd2f5`, marginTop: "5rem", marginBottom: "1rem" }}>TOP 10</h3>
            <ol className="topContainer">
              {
                this.state.trendingPosts.map((post) => { //TODO: change to topPosts
                  let postInfo = post.postInfo;
                  return (<li key={post.docId}> <MediaPost postType={envData.MEDIA_POST_TYPES.SIMPLE} category={postInfo.category} id={post.docId} title={postInfo.title} info={postInfo.info} summary={postInfo.summary} imageUrl={postInfo.imageUrl} /> </li>)
                })
              }
            </ol>
          </div>) : (
            <div className="postContainer" style={{marginTop: '5rem', marginBottom: '1rem'}}>
              {
                this.state.searchPosts.map((post) => {
                  let postInfo = post.postInfo;
                  return (<div key={post.docId}> <MediaPost postType={envData.MEDIA_POST_TYPES.FUNCTIONAL} category={postInfo.category} id={post.docId} title={postInfo.title} info={postInfo.info} summary={postInfo.summary} imageUrl={postInfo.imageUrl} /> </div>)
                })
              }
            </div>
          )}


      </div>
    )
  }

  handleChange = (e) => {
    this.setState({ search: e.target.value });

    if (e.target.value == '') {
      this.setState({ searchPosts: [] }); //empty the array of search results if user searches for nothing
    } else {
      
      this.retrieveSearchPosts(e.target.value)
    }
  }

  handleSubmit = (e) => {
    e.preventDefault(); //prevent default functionality of some button types on empty press, i.e new links, submitting empty form entries
    //this.searchForPost() //TODO
    console.log("Do nothing for now");
  }

  //'posts' -> doc(category) -> collection(bookPosts)
  retrieveSearchPosts = (valueToSearch) => {
    this.setState({ searchPosts: [] }, () => {
      let searchValue = valueToSearch.toString().toLowerCase().trim();
      //TODO .doc(category), category should be saved somewhere based on user category type selection and not fixed 'books', same with 'bookPosts'
      firestore.collection('posts').doc('books').collection('bookPosts').where("titleSubStrings", "array-contains", searchValue)
        .get()
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
      const tempDocument = querySnapshot.docs.map(doc => {
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
