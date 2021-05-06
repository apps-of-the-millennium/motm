const mediaPostTypeEnum = {
  FUNCTIONAL: 1,
  SIMPLE: 2
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

Object.freeze(mediaPostTypeEnum);

module.exports = {
    MEDIA_POST_TYPES: mediaPostTypeEnum,
    DUMMY_POSTS: DUMMY_POSTS,
    LIST_TYPES: listTypes,
    getAllSubstrings: (str, size) => {
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
}