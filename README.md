![Logo](/img/logo-origin.png)

Arxiv Videos Chrome Extension
==============================

Use paper ids found in [Arxiv Sanity](http://www.arxiv-sanity.com/) to search in Youtube

Build and Install
------------------
Since this extension use [Polymer](https://www.polymer-project.org), [bower](https://bower.io/) and [npm](https://www.npmjs.com/). 
It needs some processing before going into production. 

Also, the Google API key(for Youtube search function) is not included in this repository, so put the following snippet into file `keys.js`

```
var yt_api_key=YOUR_API_KEY_STR;
```

**Build:**<br/>
`npm install`<br/>
`bower install`<br/>
`gulp build`

The production code would be put in `dist` folder.

**Install (for Dev)**<br/>
Here is how to [load unpacked extension to Chrome](https://developer.chrome.com/extensions/getstarted#unpacked). 
*Be sure to choose the `dist` folder* instead of the project folder.