import React from 'react';
import './Home.css';
import MediaPost from './MediaPost';
import { firestore } from "./firebase";
import CustomSelect from './CustomSelect';
import CategorySelector from './CategorySelector';
import InfiniteScroll from "react-infinite-scroll-component";
import Search from './Search';


import { MEDIA_POST_TYPES } from './envData';

import { FaIcons, FaSearch } from 'react-icons/fa'; //make the filters into separate component?
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
      searchPosts: [],

      searchName: '',
      searchTags: [],

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
        this.onClickCategory(session_savedCategory);
      }
    }
  }

  render() {
    return (
      <div className="homeBg">
        <div className="pageContentContainer">
          <Search />
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
      </div>
      </div>
    )
  }


  //this should be moved into it's own component
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
      firestore.collection('posts').doc(this.state.category).collection(this.categoryPostString).limit(LIMIT).orderBy('timestamp', 'desc') //not sure how it's ordering
      .get().then((querySnapshot) => {
        // const tempDocument = querySnapshot.docs.map(doc => {
        let count = 0;
        querySnapshot.docs.forEach(doc => {
          console.log(doc.id);
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
        });
      });
    });
  }

}

export default CategoryPage;