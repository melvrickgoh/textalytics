var pgDAO = require('./index');
var dao = new pgDAO({pgURL:process.env.HEROKU_POSTGRESQL_RED_URL});

var TABLENAME = 'googleusers',
	ID = 'id',
	GOOGLE_ID = "googleid",
	TOKEN = "refreshtoken",
	EMAIL = "email",
	LAST_VISIT = "lastvisit",
	OCR_FOLDER_ID = "ocrfolder";

function GoogleUsersDAO(options){
	if (options){
		dao = new pgDAO({pgURL:options.pgURL});
	}
}

GoogleUsersDAO.prototype.updateUser = function(user,callback){
	var updateUserDetails = {
		name:TABLENAME,
		values:[{
			name: LAST_VISIT,
			type:'BIGINT',
			value:user.lastVisit.getTime()
		},{
			name:TOKEN,
			type:'string',
			value:user.refreshToken
		},{
			name:OCR_FOLDER_ID,
			type:'string',
			value:user.ocrFolder.id
		}],
		conditions:[GOOGLE_ID + ' = \'' + user.id + '\'']
	}
	dao.update(updateUserDetails,function(isSuccess,result){
		if (result.rowCount >= 1){
			callback(true,result);//selected length >= 1
		}else{
			callback(false,result);//selected length is 0 or less
		}
	});
}

GoogleUsersDAO.prototype.insertNewUser = function(user,callback){
	this.insertNewUsers([user],callback);
}

GoogleUsersDAO.prototype.insertNewUsers = function(users,callback){
	var userExtracts = this.extractUsersDetails(users);
	var newUserDetails = {
		name:TABLENAME,
		attributes:[{name:GOOGLE_ID,type:'string'},{name:TOKEN,type:'string'},{name:EMAIL,type:'string'},
		{name:LAST_VISIT,type:'BIGINT'},{name:OCR_FOLDER_ID,type:'string'}],
		values:userExtracts
	};
	dao.insert(newUserDetails,function(isSuccess,result){
		callback(isSuccess,result);
	});
}

GoogleUsersDAO.prototype.extractUsersDetails = function(users){
	var extract = [];
	for (var i in users){
		var user = users[i];
		extract.push({
			"googleid":user.id,
			"givenName":user.name.givenName,
			"email":user.email,
			"emailusername":user.emailUsername,
			"gender":user.gender,
			"lastvisit":user.lastVisit.getTime(),
			"refreshtoken":user.refreshToken,
			"ocrfolder":user.ocrFolder.id
		});
	}
	return extract;
}

GoogleUsersDAO.prototype.getAllUsers = function(callback){
	var selectUsersDetails = {
		name:TABLENAME,
		distinct:false,
		attributes:[ID,GOOGLE_ID,TOKEN,EMAIL,LAST_VISIT,OCR_FOLDER_ID]
	};
	dao.select(selectUsersDetails,function(isSuccess,result){
		if (result.length >= 1){
			callback(true,result);//selected length >= 1
		}else{
			callback(false,result);//selected length is 0 or less
		}
	});
}

GoogleUsersDAO.prototype.getUser = function(googleID,callback){
	var selectUserDetails = {
		name:TABLENAME,
		distinct:false,
		attributes:[ID,GOOGLE_ID,TOKEN,EMAIL,LAST_VISIT,OCR_FOLDER_ID],
		conditions:[GOOGLE_ID + ' = \''+ googleID +'\'']
	};
	dao.select(selectUserDetails,function(isSuccess,result){
		if (result.length >= 1){
			callback(true,result);//selected length >= 1
		}else{
			callback(false,result);//selected length is 0 or less
		}
	});
}

GoogleUsersDAO.prototype.checkUserExists = function(user,callback){
	var selectUserDetails = {
		name:TABLENAME,
		distinct:false,
		attributes:[GOOGLE_ID,OCR_FOLDER_ID],
		conditions:[GOOGLE_ID + ' = \''+ user.id +'\'']
	};
	dao.select(selectUserDetails,function(isSuccess,result){
		if (result.length >= 1){
			callback(true);//selected length >= 1
		}else{
			callback(false);//selected length is 0 or less
		}
	});
}

module.exports = GoogleUsersDAO;