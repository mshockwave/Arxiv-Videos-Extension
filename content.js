var domObserver = null;
var setUpDOMObserver = function(){
  if(!Waypoint){
    console.error('Waypoint not found');
  }else{
    // Setup DOM observers
    domObserver = new MutationObserver(function(mutations, observer){
      mutations.forEach(function(mutation){

        if(mutation.addedNodes && mutation.addedNodes.length > 0){
          mutation.addedNodes.forEach(function(node){
            node.waypointObj = new Waypoint({
              element: node,
              handler: function(){
                console.log("Node " + node.id + ' in screen!');
              },
              offset: '100%'
            });
          });
        }

      });
    });
  }
};

(function(){
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
