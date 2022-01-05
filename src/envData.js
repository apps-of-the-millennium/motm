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
        const ref = firestore.collection('posts').doc('books').collection('bookPosts').doc();
        const docId = ref.id;

        // firestore.collection('posts').doc('books').collection('bookPosts').add({
        ref.set({
          avgRating: 0 ,
          category: "Books",
          author: author,
          title: resp['title'],
          summary: summary,
          releaseDate: publishDate, //resp['created']['value'].split('T')[0], //could prob rename
          titleSubStrings: substrings,
          tags: tags,
          timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        }).then((doc) => {
          console.log(imageId);
          fetch('https://covers.openlibrary.org/b/id/'+imageId+'-M.jpg')
          .then(res => res.blob())
          .then(blob => {
            console.log(blob)
            var storageRef = firebase.storage().ref();
            // this auto replaces the image no need to check if it exists
            storageRef.child('mediaPosts/bookPosts/'+docId).put(blob); //don't think u need the .filetype but keeping for now I guess?
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
  var genres = ['drama', 'young_adult_fiction', 'mystery', 'romance', 'horror', 'dystopian', 'adventure', 'fantasy', 'comedy', 'magic'] //action;
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

async function uploadMovieData(json, i, img_url) {
    var substrings;
    var ageRating = json["movies"][i]['age'];
    var genres = json["movies"][i]['category'].split(", ");
    var director_stars = json["movies"][i]['director_stars'];
    var director = director_stars.split(": ")[1].split(" | ")[0].split(", ")
    var stars = director_stars.split(": ").slice(2)[0].split(", ")
    var img_url = json["movies"][i]['img_url'];
    var running_time = json["movies"][i]['running_time'];
    var summary = json["movies"][i]['summary'];
    var title = json["movies"][i]['title'];
    var releaseDate = json["movies"][i]['release_date'].slice(1, -1);

    var tags = {};
    for(var i=0; i < genres.length; i++) {
      tags[genres[i]] = "true";
    }
 
    console.log(tags);
    
    substrings = getAllSubstringss(title, 2);
  
    const ref = firestore.collection('posts').doc('movies').collection('moviePosts').doc();
    const docId = ref.id;

    // firestore.collection('posts').doc('movies').collection('moviePosts').add({
    ref.set({
      avgRating: 0,
      category: "Movies",
      ageRating: ageRating,
      title: title,
      summary: summary,
      genres: genres,
      director: director,
      stars: stars,
      runningTime: running_time,
      releaseDate: releaseDate,
      titleSubStrings: substrings,
      tags: tags,
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
    }).then((doc) => {
      fetch(img_url)
      .then(res => res.blob())
      .then(blob => {
        console.log(img_url)
        var storageRef = firebase.storage().ref();
        // this auto replaces the image no need to check if it exists
        storageRef.child('mediaPosts/moviePosts/'+docId).put(blob);
      })
    })
}


export async function updateFirebaseMovies() {
  let json = require('./temp/run_results.json')
  // console.log(json)
  
  // await uploadMovieData(json, 1, json["movies"][1]["img_url"])
  for(var i=0; i<json["movies"].length; i++ ) {
    var img_url = json["movies"][i]["img_url"];
    await uploadMovieData(json, i, img_url);
  }
}

export async function updateDatabase() {

}