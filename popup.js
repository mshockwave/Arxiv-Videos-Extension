
var isGapiLoaded = false;
var idList = [];
var idIndex = 0;

var SEARCHING_MSG_STR = 'Searching Youtube...';
var EMPTY_SEARCH_RESULT_MSG_STR = 'No Result Found';

var app = document.querySelector('#app');

var queryYoutube = function(){
    if(idIndex >= idList.length){

      if(app.resultList && app.resultList.length == 0){
        app.set('phMsg', EMPTY_SEARCH_RESULT_MSG_STR);
        app.set('showPlaceHoldingMsg', true);
      }

      return;
    }

    var keyword = idList[idIndex];
    console.log('Querying youtube: ' + keyword);

    var request = gapi.client.youtube.search.list({
        maxResult: 1,
        q: keyword,
        type: 'video',
        part: 'snippet'
    });
    request.execute(function(resp){

        //console.log(resp);

        if(resp.result){
            var result = resp.result;
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

                if(app.showPlaceHoldingMsg) app.set('showPlaceHoldingMsg', false);
                app.push('resultList', resultObj);
            });
        }

        idIndex++;
        queryYoutube();
    });
};

var loadYoutubeApi = function(){
    // Pre-process id list
    for(var i = 0; i < idList.length; i++){
        idList[i] = idList[i].replace(/(v\d)$/, '');
    }
    var idSet = Immutable.Set.of(idList);
    idList = idSet.toArray()[0];

    gapi.client.setApiKey(yt_api_key);
    gapi.client.load('youtube', 'v3').then(function(){
      app.set('phMsg', SEARCHING_MSG_STR);
      app.set('showPlaceHoldingMsg', true);

      queryYoutube();
    });
};

app.addEventListener('dom-change', function(){

    // App Init
    app.resultList = [];
    app.phMsg = SEARCHING_MSG_STR;
    app.showPlaceHoldingMsg = true;

    chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
        if(tabs.length > 0){
            var tabId = tabs[0].id;
            chrome.tabs.sendMessage(tabId, "ARXIV_PID_QUERY", null, function(results){
                //console.log(msg);
                //console.log(chrome.runtime.lastError);

                idList = results;

                if(isGapiLoaded){
                    loadYoutubeApi();
                }
            });
        }
    });
});

var gapiOnload = function(){
    //console.log('GApi client library loaded!');
    isGapiLoaded = true;
    if(idList.length > 0){
        loadYoutubeApi();
    }
};
