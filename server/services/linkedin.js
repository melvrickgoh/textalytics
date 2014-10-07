var API_KEY = '75otna9w35iudo',
OAuth_Token = '620859b4-d7d5-4f60-9c3c-66a06f4b686f',
LinkedIN = require('node-linkedin')('api', 'secret', 'callback'),
linkedin;

function LinkedIn(options){

}

LinkedIn.prototype.constructor = LinkedIn;

LinkedIn.prototype.getLinkedInMaster = function(){
	return LinkedIN;
}

LinkedIn.prototype.initializeUserAuthorization = function(access_token) {
    linkedin = LinkedIN.init(access_token);
    return linkedin;
}

module.exports = LinkedIn;