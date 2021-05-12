//import React, {useState, useEffect } from 'react';
import React from 'react';
import './Home.css';
import MediaPost from './MediaPost';
import { firestore } from "./firebase";

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
      posts: DUMMY_POSTS
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
        <div className="appBody">
          {
            this.state.posts.map((post) => {
              let postInfo = post.postInfo;
              return (<div key={post.docId}> <MediaPost category={postInfo.category} id={post.docId} title={postInfo.title} info={postInfo.info} summary={postInfo.summary} imageUrl={postInfo.imageUrl} /> </div>)
            })
          }
        </div>
      </div>
    )
  }

  retrievePosts = () => {
    firestore.collection('posts').get().then((querySnapshot) => {
      const tempDocument = querySnapshot.docs.map(doc => {
        const newPost = {
          docId: doc.id,
          postInfo: doc.data()
        }
        this.setState({ posts: [...this.state.posts, newPost] }); //...arrayName basically used to append a new item to the original array (aka spread syntax)
      });
    });
  }

} //Class Home ===============

export default Home;
