var pgDAO = require('./index');
var dao = new pgDAO({pgURL:process.env.HEROKU_POSTGRESQL_RED_URL});

var TABLENAME = 'googleserverfolders',
	ID = 'id',
	FOLDER_NAME = "name",
	PURPOSE = "purpose",
	FOLDER_ID = "googleid";

function GoogleServerFoldersDAO(options){
	if (options){
		dao = new pgDAO({pgURL:options.pgURL});
	}
}

GoogleServerFoldersDAO.prototype.insertNewFolder = function(folder,callback){
	this.insertNewFolders([folder],callback);
}

GoogleServerFoldersDAO.prototype.insertNewFolders = function(folders,callback){
	var folderExtracts = this.extractFoldersDetails(folders);
	var newFolderDetails = {
		name:TABLENAME,
		attributes:[{name:FOLDER_NAME,type:'string'},{name:FOLDER_ID,type:'string'},{name:PURPOSE,type:'string'}],
		values:folderExtracts
	};
	dao.insert(newFolderDetails,function(isSuccess,result){
		callback(isSuccess,result);
	});
}

GoogleServerFoldersDAO.prototype.extractFoldersDetails = function(folders){
	var extract = [];
	for (var i in folders){
		var folder = folders[i];
		extract.push({
			"name":folder.title,
			"purpose":folder.purpose,
			"googleid":folder.id
		});
	}
	return extract;
}

GoogleServerFoldersDAO.prototype.getAllFolders = function(callback){
	var selectFoldersDetails = {
		name:TABLENAME,
		distinct:false,
		attributes:[ID,FOLDER_ID,FOLDER_NAME,PURPOSE]
	};
	dao.select(selectFoldersDetails,function(isSuccess,result){
		if (result.length >= 1){
			callback(true,result);//selected length >= 1
		}else{
			callback(false,result);//selected length is 0 or less
		}
	});
}

GoogleServerFoldersDAO.prototype.getFolder = function(foldername,callback){
	var selectFolderDetails = {
		name:TABLENAME,
		distinct:false,
		attributes:[ID,FOLDER_ID,FOLDER_NAME,PURPOSE],
		conditions:[FOLDER_NAME + ' = \''+ foldername +'\'']
	};
	dao.select(selectFolderDetails,function(isSuccess,result){
		if (result.length >= 1){
			callback(true,result);//selected length >= 1
		}else{
			callback(false,result);//selected length is 0 or less
		}
	});
}

GoogleServerFoldersDAO.prototype.checkFolderExists = function(foldername,callback){
	var selectFolderDetails = {
		name:TABLENAME,
		distinct:false,
		attributes:[ID,FOLDER_ID,FOLDER_NAME,PURPOSE],
		conditions:[FOLDER_NAME + ' = \''+ foldername +'\'']
	};
	dao.select(selectFolderDetails,function(isSuccess,result){
		if (result.length >= 1){
			callback(true);//selected length >= 1
		}else{
			callback(false);//selected length is 0 or less
		}
	});
}

module.exports = GoogleServerFoldersDAO;