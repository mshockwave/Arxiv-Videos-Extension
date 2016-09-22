var domObserver = null;

/**
 * key: paper id,
 * value: result obj
 */
var resultCache = {};

var ytapi;

/*
var isObjEmpty = function(obj){
  if(obj === undefined || obj === null) return true;

  if(obj instanceof Array) return !(obj.length > 0);

  var empty = true;
  for(var f in obj){
    if(obj.hasOwnProperty(f)){
      empty = false;
      break;
    }
  }

  return empty;
}
*/

var addNavigateButton = function(nodeId, resultObj){

  // elevation 6dp
  var shadowStyle = 'box-shadow: ' + 
                    '0 6px 10px 0 rgba(0, 0, 0, 0.14),' + 
                    '0 1px 18px 0 rgba(0, 0, 0, 0.12),' +
                    '0 3px 5px -1px rgba(0, 0, 0, 0.4);';
  
  console.log('Add navigate button at #' + nodeId);
  var paperNode = document.getElementById(nodeId);
  var titleNode = paperNode.querySelector('.paperdesc')
                            .querySelector('.ts');
  var naviButton = document.createElement('a');
  naviButton.style = 'color: white;' + 
                      ' background-color: red;' + 
                      ' margin-left: 10px;' + 
                      ' padding: 5px;' +
                      shadowStyle + 
                      ' text-decoration: none;';
  naviButton.href = resultObj.videoUrl;
  naviButton.target = "_blank";
  naviButton.innerText = 'GOTO YOUTUBE VIDEO';
  titleNode.appendChild(naviButton);
};
var queryYoutube = function(nodeId){

  var queryId = (nodeId + "").replace(/(v\d)$/, '');
  if(resultCache.hasOwnProperty(queryId)) return;
  // Use empty object to mark as 'querying'
  resultCache[queryId] = {};

  //console.log('Querying youtube: ' + queryId);
  ytapi.search({
      maxResult: 1,
      q: queryId,
      type: 'video',
      part: 'snippet'
  }).then(function(resp){
    if(resp) return resp.json();
  }).then(function(result){

    //console.log('Video search result:');
    //console.log(resp);

    if(result && result.items.length > 0){
      // Only pick the first search result
      var item = result.items[0];
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

      resultCache[queryId] = resultObj;

      addNavigateButton(nodeId, resultObj);
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
(function(){

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
