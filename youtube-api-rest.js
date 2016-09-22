
var YtAPI = function(apiKey){
    this.baseUrl = 'https://www.googleapis.com/youtube/v3';
    this.apiKey = apiKey; 
};

YtAPI.prototype._listActionBase = function(node, params){
    var queryString = '?key=' + this.apiKey;
    Object.keys(params).forEach(function(key){
        queryString += ('&'  + encodeURIComponent(key) + 
                        '=' + 
                        encodeURIComponent(params[key]));
    });

    return fetch(this.baseUrl + '/' + node + queryString, {
        method: 'GET'
    });
};

YtAPI.prototype.search = function(params){
    return this._listActionBase('search', params);
};