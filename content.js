chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse){
    var results = document.querySelectorAll('.apaper');
    var respArray = [];
    results.forEach(function(result){
        respArray.push(result.id);
    });
    sendResponse(respArray);
});