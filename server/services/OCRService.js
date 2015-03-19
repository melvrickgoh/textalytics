const fs = require('fs'),
exec = require('child_process').exec,
path = require('path'),
textract = require('textract');

function OCRService () {}

OCRService.prototype.constructor = OCRService;

OCRService.prototype.readOCRFile = function(parentDir,fileuploaded,callback){
	fs.readFile(parentDir + '/downloads/' + fileuploaded, 'utf8', function (err, data) {
	  if (err) { throw err; };
	  callback(true,data);
	});
}

OCRService.prototype.readOCRHTML = function(parentDir,fileuploaded,callback){
	textract(parentDir + '/downloads/' + fileuploaded, function( err, text ) {
		
		if (err) { console.log(err); };

		var image_regex = '.*(png|jpg|gif)',
		patt = new RegExp(image_regex);

		var google_login_regex = '.*Google Docs - create and edit documents online, for free.*',
	  google_login_patt = new RegExp(google_login_regex);

		console.log('Text from file');

		if (patt.test(text)){
			regex_results = patt.exec(text);
			image_resultant_text = text.replace(regex_results[0], ' ').trim();

			var find = "'";
			var re = new RegExp(find);

			image_resultant_text = image_resultant_text.replace(new RegExp("'"), '');
			image_resultant_text = image_resultant_text.replace(new RegExp("\'"), '');
			image_resultant_text = image_resultant_text.replace(new RegExp("\\\'"), '');
			image_resultant_text = image_resultant_text.replace(new RegExp("|"), '');
			image_resultant_text = image_resultant_text.replace(new RegExp("\""), '');
			image_resultant_text = image_resultant_text.replace(new RegExp(";"), '');

			callback(true,image_resultant_text)
		} else if (google_login_patt.test(text)){
			callback(false,{
				error_code: 1,
				error_message: "Global read credentials not set"
			});
		} else {
			callback(false,{
				error_code: 2,
				error_message: "No image found"
			});
		}
	});
}

module.exports = OCRService;