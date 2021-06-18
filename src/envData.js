import firebase from 'firebase/app';
import { firestore } from './firebase';

const mediaPostTypeEnum = {
  FUNCTIONAL: 1,
  SIMPLE: 2,
  LIST: 3
}

//currently not used but may need later for refactoring
const listTypes = {
  favouritesList: 'Favourites List',
  laterList: 'Later List',
  completedList: 'Completed List'
}

const DUMMY_POSTS = [
    {
      docId: '1',
      postInfo: {
        category: '',
        title: '',
        info: '',
        summary: '',
        imageUrl: '',
        tags: {"action": true}
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
  ]
  function getAllSubstringss(str, size) {
    if (str && str.length) {
        let i, j, result = [];
        size = (size || 0);
        for (i = 0; i < str.length; i++) {
            for (j = str.length; j - i >= size; j--) {
                result.push(str.slice(i, j));
            }
        }
        return result;
    } else
        return ''
  }

  async function uploadData(index, resp) {
    var substrings;
    var author;
    var imageId;
    var key = resp['works'][index]['key'];
    if('name' in resp['works'][index]['authors'][0]) {
      author = resp['works'][index]['authors'][0]['name'];
    } else {
      author = 'N/A';
    }
    imageId = resp['works'][index]['cover_id'];
    fetch('https://openlibrary.org'+key+'.json', {method: 'GET', mode: 'cors', headers: {'Content-Type': 'application/json', 'Accept': 'application/json'}}).then((response) => {
      response.json().then((resp) => {
        console.log(resp);
        substrings = getAllSubstringss(resp['title'], 2);
        var publishDate = 'N/A';
        var summary;
        var tags = {};
        for(var i=0; i<resp['subjects'].length; i++) {
          tags[resp['subjects'][i]] = "true";
        }
        if('first_publish_date' in resp) {
          publishDate = resp['first_publish_date'];
        }
        if('description' in resp) {
          if(typeof resp['description'] === 'string') {
            summary = resp['description'].replace(/[^\w\s.]/gi, '');
          } else {
            summary = resp['description']['value'].replace(/[^\w\s.]/gi, '');
          }
        } else {
          summary = 'N/A'
        }
        console.log(author);
        console.log(imageId);
        firestore.collection('posts').doc('books').collection('bookPosts').add({
          avgRating: 0 ,
          category: "Books",
          author: author,
          title: resp['title'],
          summary: summary,
          releaseDate: publishDate, //resp['created']['value'].split('T')[0], //could prob rename
          titleSubStrings: substrings,
          tags: tags,
          timeStamp: firebase.firestore.FieldValue.serverTimestamp(),
        }).then((doc) => {
          console.log(imageId);
          fetch('https://covers.openlibrary.org/b/id/'+imageId+'-M.jpg')
          .then(res => res.blob())
          .then(blob => {
            console.log(blob)
            var storageRef = firebase.storage().ref();
            // this auto replaces the image no need to check if it exists
            storageRef.child('mediaPosts/'+doc.id+'.jpg').put(blob); //don't think u need the .filetype but keeping for now I guess?
          })
        })
      })
    })
  }

Object.freeze(mediaPostTypeEnum);

export {
    mediaPostTypeEnum as MEDIA_POST_TYPES,
    DUMMY_POSTS,
    listTypes as LIST_TYPES,
}

export function getAllSubstrings(str, size) {
  if (str && str.length) {
      let i, j, result = [];
      size = (size || 0);
      for (i = 0; i < str.length; i++) {
          for (j = str.length; j - i >= size; j--) {
              result.push(str.slice(i, j));
          }
      }
      return result;
  } else
      return ''
}
export async function updateFirebase() {
  var genres = ['Action', 'Drama', 'young_adult_fiction']//, 'mystery', 'Romance', 'Horror', 'Dsytopian', 'Adventure', 'Fantasy', 'Comedy', 'magic'];
  //uncomment the commented out ones we already have the first 3
  for(var i=0; i<genres.length; i++) {
    var url = 'https://openlibrary.org/subjects/'+genres[i]+'.json'; //?details=true
    fetch(url, {method: 'GET', mode: 'cors', headers: {'Content-Type': 'application/json', 'Accept': 'application/json'} }).then((response) => {
      response.json().then(async (resp) => {
        console.log(resp);
        for(var i=0; i<resp['works'].length; i++) {
          await uploadData(i, resp);
        }
      })
    })
  }
}