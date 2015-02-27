//instantiate the model
var request = require('request');
const BufferList = require('bl');

function ImageCrawler(){

}

ImageCrawler.prototype.constructor = ImageCrawler;

ImageCrawler.prototype.downloadImage = function(imageUrl,downloadCallback){
	request.get({
		uri:imageUrl,
		encoding:'binary'
	},function (error, response, body) {
	  if(response.statusCode == 200){
	    downloadCallback(true,{
	    	status: response.statusCode,
	    	mimeType: response.headers['content-type'],
	    	data: new Buffer(body.toString(),"binary")
	    });
	  } else {
	    downloadCallback(false,response.statusCode);
	  }
	});
}

module.exports = ImageCrawler;