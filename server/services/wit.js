var https = require('https');
var Future = require('futures').future;

var AUTHORIZATION = 'Bearer KA5DLWOLPPGEHURAE7PBZPSPU5MK2L2N';

function Wit(options){

}

Wit.prototype.constructor = Wit;


Wit.prototype.requestWit = function(user_text) {
    var future = Future.create();
    var options = {
        host: 'api.wit.ai',
        path: '/message?v=20141001&q=' + encodeURIComponent(user_text),
        // the Authorization header allows you to access your Wit.AI account
        // make sure to replace it with your own
        headers: {'Authorization': AUTHORIZATION}
    };

    https.request(options, function(res) {
        var response = '';

        res.on('data', function (chunk) {
            response += chunk;
        });

        res.on('end', function () {
            future.fulfill(undefined, JSON.parse(response));
        });
    }).on('error', function(e) {
        future.fulfill(e, undefined);
    }).end();

    return future;
}

Wit.prototype.processWitResults = function(result){
	console.log(result);

}

function _filterNames(results){

}

module.exports = Wit;