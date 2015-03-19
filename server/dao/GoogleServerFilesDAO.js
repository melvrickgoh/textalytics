var pgDAO = require('./index');
var dao = new pgDAO({pgURL:process.env.HEROKU_POSTGRESQL_RED_URL});

var TABLENAME = 'googleserverfiles',
	ID = 'id',
	FILE_NAME = "title",
	TYPE = "type"
	PURPOSE = "purpose",
	DOWNLOAD_URL = "downloadurl"
	FILE_ID = "googleid",
	RAW_TEXT = "rawtext";

function GoogleServerFilesDAO(options){
	if (options){
		dao = new pgDAO({pgURL:options.pgURL});
	}
}

GoogleServerFilesDAO.prototype.updateFile = function(file,callback){
	var updateFileDetails = {
		name:TABLENAME,
		values:[{
			name: RAW_TEXT,
			type:'string',
			value: file.ocrText
		}],
		conditions:[FILE_ID + ' = \'' + file.id + '\'']
	}
	dao.update(updateFileDetails,function(isSuccess,result){
		if (result.rowCount >= 1){
			callback(true,result);//selected length >= 1
		}else{
			callback(false,result);//selected length is 0 or less
		}
	});
}

GoogleServerFilesDAO.prototype.insertNewFile = function(file,callback){
	this.insertNewFiles([file],callback);
}

GoogleServerFilesDAO.prototype.insertNewFiles = function(files,callback){
	var fileExtracts = this.extractFilesDetails(files);
	var newFileDetails = {
		name:TABLENAME,
		attributes:[{name:FILE_NAME,type:'string'},{name:FILE_ID,type:'string'},{name:PURPOSE,type:'string'},
		{name:TYPE,type:'string'},{name:DOWNLOAD_URL,type:'string'},{name:RAW_TEXT,type:'string'}],
		values:fileExtracts
	};
	dao.insert(newFileDetails,function(isSuccess,result){
		callback(isSuccess,result);
	});
}

GoogleServerFilesDAO.prototype.extractFilesDetails = function(files){
	var extract = [];
	for (var i in files){
		var file = files[i];
		extract.push({
			"title":file.title,
			"purpose":file.purpose,
			"googleid":file.id,
			"type":file.type,
			"downloadurl":file.downloadUrl,
			"rawtext":file.ocrText
		});
	}
	return extract;
}

GoogleServerFilesDAO.prototype.getAllFiles = function(callback){
	var selectFilesDetails = {
		name:TABLENAME,
		distinct:false,
		attributes:[ID,FILE_ID,FILE_NAME,TYPE,PURPOSE,DOWNLOAD_URL,RAW_TEXT]
	};
	_select(selectFilesDetails,callback);
}

GoogleServerFilesDAO.prototype.getFilesByPurpose = function(purpose,callback){
	var selectFileDetails = {
		name:TABLENAME,
		distinct:false,
		attributes:[ID,FILE_ID,FILE_NAME,TYPE,PURPOSE,DOWNLOAD_URL,RAW_TEXT],
		conditions:[PURPOSE + ' = \''+ purpose +'\'']
	};
	_select(selectFileDetails,callback);
}

GoogleServerFilesDAO.prototype.getFilesByType = function(type,callback){
	var selectFileDetails = {
		name:TABLENAME,
		distinct:false,
		attributes:[ID,FILE_ID,FILE_NAME,TYPE,PURPOSE,DOWNLOAD_URL,RAW_TEXT],
		conditions:[TYPE + ' = \''+ type +'\'']
	};
	_select(selectFileDetails,callback);
}

GoogleServerFilesDAO.prototype.getFile = function(filename,callback){
	var selectFileDetails = {
		name:TABLENAME,
		distinct:false,
		attributes:[ID,FILE_ID,FILE_NAME,TYPE,PURPOSE,DOWNLOAD_URL,RAW_TEXT],
		conditions:[FILE_NAME + ' = \''+ filename +'\'']
	};
	_select(selectFileDetails,callback);
}

GoogleServerFilesDAO.prototype.checkFileExists = function(filename,callback){
	var selectFileDetails = {
		name:TABLENAME,
		distinct:false,
		attributes:[ID,FILE_ID,FILE_NAME,TYPE,PURPOSE,DOWNLOAD_URL,RAW_TEXT],
		conditions:[FILE_NAME + ' = \''+ filename +'\'']
	};
	_select(selectFileDetails,callback);
}

function _select(details,callback){
	dao.select(details,function(isSuccess,result){
		if (result.length >= 1){
			callback(true,result);//selected length >= 1
		}else{
			callback(false,result);//selected length is 0 or less
		}
	});
}

module.exports = GoogleServerFilesDAO;