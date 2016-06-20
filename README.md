Arxiv Videos Chrome Extension
==============================

Use paper ids found in [Arxiv Sanity](http://www.arxiv-sanity.com/) to search in Youtube

Build and Install
------------------
Since this extension use [Polymer](https://www.polymer-project.org), [bower](https://bower.io/) and [npm](https://www.npmjs.com/). 
It needs some processing before going into production.

**Build:**<br/>
`npm install`<br/>
`bower install`<br/>
`gulp build`

The production code would be put in `dist` folder.

**Install (for Dev)**<br/>
Here is how to [load unpacked extension to Chrome](https://developer.chrome.com/extensions/getstarted#unpacked). 
*Be sure to choose the `dist` folder* instead of the project folder.