import React, {useState, useEffect } from 'react';
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

function Home() {
  
  return (
    <div className="home">
      <HomeScreen />
    </div>
  );
}

  

function HomeScreen() {

  // const classes = useStyles();
  // const [modalStyle] = React.useState(getModalStyle);

  const [posts, setPosts] = useState([]);

  //useEffect runs piece of code based on specific condition
  useEffect(() => {

    firestore.collection('posts').onSnapshot(snapshot => {
      //every time a new post is added 
      setPosts(snapshot.docs.map(doc => ({
        docId: doc.id,
        post: doc.data()
      })));
    })
  }, []); //if [], only runs once when app component loads
        //if [posts], runs whenever posts changes

  return (
    <body className="appBg">
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
          posts.map(({docId, post}) => (
            <MediaPost category={post.category} id={docId} title={post.title} info={post.info} summary={post.summary} imageUrl={post.imageUrl} />
          ))
        }
      </div>
    </body>
  )
}

export default Home;
