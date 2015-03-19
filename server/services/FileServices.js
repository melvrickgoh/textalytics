const fs = require('fs'),
File = require('../entity/file'),
ServerFilesDAO = require('../dao/GoogleServerFilesDAO'),
ServerFoldersDAO = require('../dao/GoogleServerFoldersDAO');

var GoogleFilesDAO = new ServerFilesDAO();

function FileServices(options){}

FileServices.prototype.constructor = FileServices;

FileServices.prototype.saveOCRRawText = function(file, savingCallback){
	GoogleFilesDAO.insertNewFile(file,savingCallback);
}

FileServices.prototype.removeOCRFile = function(filePath,callback){
	fs.unlink(filePath, function (err) {
	  if (err) { callback(false,err); }
	  callback(true,'File deleted successfully: ' + filePath);
	});
}

module.exports = FileServices;