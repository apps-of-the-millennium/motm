import React from 'react';
import './Home.css';
import MediaPost from './MediaPost';
import { firestore } from "./firebase";
import InfiniteScroll from "react-infinite-scroll-component";
import Search from './Search';


import { MEDIA_POST_TYPES } from './envData';

const LIMIT = 15;

const style = {
  margin: 6,
  padding: 8,
};

class CategoryPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      categoryPosts: [],
      topPosts: [], //maybe later
      searching: false,

      category: '',

      isCategorySelectVisible: false,
      canLoadMore: true, //this is probably bad practice but we should always be able to loadmore at the start assuming we have more than 6
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

  handlePostPagination(lastDoc) {
    //known crash in Development: if you add the 6th post and then click load more, you will be shown an uncommited timestamp error
    if (this.state.canLoadMore) {
      console.log('can load more');
      if (lastDoc) { //&& lastDoc.data().timestamp !== null) {
        //CHANGE THIS TO DEPEND ON SECTION (EX: trending, popular)  
        firestore.collection('posts').doc(this.state.category).collection(this.categoryPostString)
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
                    this.setState({ categoryPosts : [...this.state.categoryPosts, mediaPost] })
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
        this.onClickCategory(session_savedCategory, () => {
          //for the first pull default pagination
          this.handlePostPagination(this.state.lastTrending, 'trendingPosts')
        })
      }
    }
  }

  render() {
    return (
      <div className="homeBg">
        {/* <div className="pageContentContainer"> */}
          <Search category={this.state.category} handleSearching={this.handleSearching} onClickCategory={this.onClickCategory} />
          { (!this.state.searching) && (this.state.category !== '') ? (
            <div className="home-content">
              <InfiniteScroll
                dataLength={this.state.categoryPosts.length}
                next={() => this.handlePostPagination(this.state.lastTrending, 'trendingPosts')} //can change trendingPosts to use props
                style={{ display: 'flex', flexFlow: 'row wrap', overflow: 'visible', justifyContent: 'space-between', margin: '6', padding: '8' }}
                hasMore={this.state.canLoadMore} //assumes has more at start
                loader={<h4 style={{color: 'white'}}>Loading...</h4>}
                endMessage={
                  <p style={{ textAlign: 'center', color: 'white' , flexBasis: '100%' }}>
                    <b>Yay! You have seen it all</b>
                  </p>
                }
              >
              {
                this.state.categoryPosts.map((post) => {
                  let postInfo = post.postInfo;
                  return (<div style={style} key={post.docId}> <MediaPost postType={MEDIA_POST_TYPES.FUNCTIONAL} category={postInfo.category} id={post.docId} title={postInfo.title} info={postInfo.info} summary={postInfo.summary} imageUrl={postInfo.imageUrl} /> </div>)
                })
              }
              </InfiniteScroll>
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
    console.log('stateCategory: '+this.state.category+' categoryType: '+categoryType)
    if (this.state.category !== categoryType) {
      this.setState({ category: categoryType }, () => {
        this.categoryPostString = this.state.category.slice(0, -1) + 'Posts';

        if (typeof (Storage) !== "undefined") {
          sessionStorage.setItem('savedCategory', this.state.category);
        }
        //reset if we are in a new category
        this.setState({ categoryPosts: [], lastTrending: [], canLoadMore: true }, () => {
          //reset and send first page
          this.handlePostPagination(this.state.lastTrending, 'trendingPosts');
        })

      });
    }
  }

  displayCategorySelector = () => {
    this.setState({ isCategorySelectVisible: !this.state.isCategorySelectVisible });
  }

}

export default CategoryPage;