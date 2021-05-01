'use strict'


const mediaPostTypeEnum = {
    FUNCTIONAL: 1,
    SIMPLE: 2
}



Object.freeze(mediaPostTypeEnum);

module.exports = {
    MEDIA_POST_TYPES: mediaPostTypeEnum,
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