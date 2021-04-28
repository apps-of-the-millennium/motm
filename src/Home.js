//import React, {useState, useEffect } from 'react';
import React from 'react';
import './Home.css';
import MediaPost from './MediaPost';
import { firestore } from "./firebase";
import { color, black } from 'ansi-styles';
import { rgb } from 'chalk';

import searchIcon from './images/search.svg'; // with import
import { fontSize } from '@material-ui/system';

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
      search: ''
    }
  }

  componentDidMount() {
    this.retrievePosts();
  }

  render() {
    return (

      <div className="homeBg">
        {/*main page*/}

        {/* picture of media and favorite btn*/}

        {/* title */}

        {/* basic info depends on category temp will be actors*/}

        {/* summary */}

        {/* rate and rating general */}

        {/* add to list add to ... */}

        {/* reviews or go to page*/}

        {/* extra report etc */}
        <form
          onSubmit={this.handleSubmit}
          className="searchForm">
          <label for="search" style={{ fontWeight: '700', color: `#cfd2f5`, display: 'inline-block', marginBottom: '1rem' }}>Search</label><br></br>
          <input
            style={{
              color: `rgb(207, 210, 245)`,
              height: "2rem",
              backgroundColor: `#2c417a`,
              backgroundImage: `url(${searchIcon})`,
              backgroundPosition: '-90% 5px',
              backgroundRepeat: 'no-repeat',
              backgroundSize: '70% 70%',
              paddingLeft: '40px',
              fontSize: 'medium',
              fontWeight: '500'
            }}
            onChange={this.handleChange}
            value={this.state.search}
            // placeholder="Search..."
            type="text"
            id="search" />
        </form>

        <h3 style={{ textAlign: "center", color: `#cfd2f5`, marginTop: "5rem", marginBottom: "1rem" }}>TRENDING</h3>
        {/* perhaps rename to TrendingContainer, PopularContainer so we can fit header.. */}
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
            this.state.trendingPosts.map((post) => { //TODO: change to popularposts
              let postInfo = post.postInfo;
              return (<li key={post.docId}> <MediaPost postType={envData.MEDIA_POST_TYPES.SIMPLE} category={postInfo.category} id={post.docId} title={postInfo.title} info={postInfo.info} summary={postInfo.summary} imageUrl={postInfo.imageUrl} /> </li>)
            })
          }
        </ol>
      </div>
    )
  }

  handleChange = (e) => {
    this.setState({ search: e.target.value });
  }

  handleSubmit = (e) => {
    e.preventDefault(); //prevent default functionality of some button types on empty press, i.e new links, submitting empty form entries
    //this.searchForPost() //TODO
    console.log("Do nothing for now");
  }


  retrievePosts = () => {
    firestore.collection('posts').get().then((querySnapshot) => {
      const tempDocument = querySnapshot.docs.map(doc => {
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

} //Class Home ===============

export default Home;
