var domObserver = null;

/**
 * key: paper id,
 * value: list of result objs
 */
var resultCache = {};

var ytapi;

// elevation 6dp
var extraButtonShadowStyle = 'box-shadow: ' + 
                              '0 6px 10px 0 rgba(0, 0, 0, 0.14),' + 
                              '0 1px 18px 0 rgba(0, 0, 0, 0.12),' +
                              '0 3px 5px -1px rgba(0, 0, 0, 0.4);';
var extraButtonBaseStyle = ' margin-left: 10px;' + 
                            ' padding: 5px;' +
                            extraButtonShadowStyle + 
                            ' text-decoration: none;' + 
                            ' font-weight: 300;';
var getPaperTitleNode = function(nodeId){
  var paperNode = document.getElementById(nodeId);
  return paperNode.querySelector('.paperdesc')
                  .querySelector('.ts');          
};

var addDirectNavigateButton = function(nodeId, resultObj){
  
  //console.log('Add button at #' + nodeId);
  var naviButton = document.createElement('a');
  naviButton.style = extraButtonBaseStyle + 
                      ' background-color: ' + '#E91E63;' +
                      ' color: white;';
  naviButton.href = resultObj.videoUrl;
  naviButton.target = "_blank";
  naviButton.innerText = 'Go To Youtube Video';
  getPaperTitleNode(nodeId).appendChild(naviButton);
};
var addShowPopupButton = function(nodeId, resultList){
  
  var resultListStr = JSON.stringify(resultList);

  var toggleButton = document.createElement('span');
  toggleButton.style = extraButtonBaseStyle + 
                        ' background-color: ' + '#E91E63;' + 
                        ' color: white;' +
                        ' cursor: pointer;';
  toggleButton.innerText = 'Show Related Videos';
  toggleButton.onclick = function(){
    var wrapperScript = 
        "var popupElement = document.querySelector('arxiv-video-popup');" + 
        "if(popupElement){" + 
        " popupElement.results = JSON.parse(\'" + resultListStr + "\');" + 
        " popupElement.hidden = false;" + 
        "}";
    var wrapperScriptElement = document.createElement('script');
    wrapperScriptElement.innerText = wrapperScript;
    getPaperTitleNode(nodeId).appendChild(wrapperScriptElement);  
  };
  getPaperTitleNode(nodeId).appendChild(toggleButton);
};
var queryYoutube = function(nodeId){

  var queryId = (nodeId + "").replace(/(v\d)$/, '');
  if(resultCache.hasOwnProperty(queryId)) return;
  // Use empty list to mark as 'querying'
  resultCache[queryId] = [];

  //console.log('Querying youtube: ' + queryId);
  ytapi.search({
      q: queryId,
      type: 'video',
      part: 'snippet'
  }).then(function(resp){
    if(resp) return resp.json();
  }).then(function(result){

    //console.log('Video search result:');
    //console.log(resp);

    if(result && result.items.length > 0){
      console.log('Got video(s), size: ' + result.items.length);
      result.items.forEach(function(item){
        var resultObj = {};

        if(item.id.videoId){
            resultObj.videoUrl = 'https://www.youtube.com/watch?v=' + item.id.videoId;
        }

        var snippet = item.snippet;
        resultObj.title = snippet.title;

        if(snippet.thumbnails.default){
            var img = snippet.thumbnails.default;
            resultObj.imgUrl = img.url;
            resultObj.imgHeight = img.height;
            resultObj.imgWidth = img.width;
        }

        if(snippet.publishedAt){
            var timestampObj = new Date(snippet.publishedAt);
            resultObj.timestamp = timestampObj.toLocaleDateString();
        }

        if(snippet.description){
            resultObj.description = snippet.description;
        }

        resultCache[queryId].push(resultObj);
      });

      if(result.items.length > 1){
        addShowPopupButton(nodeId, resultCache[queryId]);
      }else {
        addDirectNavigateButton(nodeId, resultCache[queryId][0]);
      }
    }
    
  });
};

var nodeMutationCallback = function(node){
  node.waypointObj = new Waypoint({
    element: node,
    handler: function(){
      //var queryId = (node.id + "").replace(/(v\d)$/, '');
      //console.log("Node " + node.id + ' in screen!');
      queryYoutube(node.id);
    },
    offset: '100%'
  });
};
var setUpDOMObserver = function(){
  if(!Waypoint){
    console.error('Waypoint not found');
  }else{
    // Setup DOM observers
    domObserver = new MutationObserver(function(mutations, observer){
      mutations.forEach(function(mutation){
        if(mutation.addedNodes && mutation.addedNodes.length > 0){
          mutation.addedNodes.forEach(nodeMutationCallback);
        }
      });
    });
  }
};
var preparePopupElement = function(){
  var popupUri = chrome.extension.getURL('popup.html');
  var linkElement = document.createElement('link');
  linkElement.rel = "import";
  linkElement.href = popupUri;
  document.body.appendChild(linkElement);

  var popupElement = document.createElement('arxiv-video-popup');
  document.body.appendChild(popupElement);
};
(function(){

  preparePopupElement();

  ytapi = new YtAPI(yt_api_key);

  setUpDOMObserver();

  var paperTable = document.querySelector('#rtable');
  if(domObserver){
    domObserver.observe(paperTable, {
      childList: true
    });
  }

})();

chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse){
    var results = document.querySelectorAll('.apaper');
    var respArray = [];
    results.forEach(function(result){
        respArray.push(result.id);
    });
    sendResponse(respArray);
});
