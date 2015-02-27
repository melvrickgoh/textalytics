var googleapis = require('googleapis');
var OAuth2Client = googleapis.OAuth2Client;
var CLIENT_ID = '43920069348-dumn50n713ibd53u0r39co0vke0pho6u.apps.googleusercontent.com';
var CLIENT_SECRET = 'YNhCQTVTDcTt5zwhmPNV5BAv';
var LOCAL_URL = 'http://localhost:5432/',
		REMOTE_URL = 'http://textalytics-wit.herokuapp.com/';
var REDIRECT_URL = REMOTE_URL + 'ocr/oauth2callback';

//For Client Side logging in
var OAuth2 = googleapis.auth.OAuth2;

var SERVICE_CLIENT_ID = '43920069348-tgnid2frja9o5otfbf5u5s6l2hkpp30r.apps.googleusercontent.com';
var SERVICE_ACCOUNT_EMAIL = '43920069348-tgnid2frja9o5otfbf5u5s6l2hkpp30r@developer.gserviceaccount.com';
var SERVICE_ACCOUNT_KEY_FILE = './server/key.pem';

//Other info
var CLIENT_DEFAULT_OCR_FOLDER_NAME = "melvrickgoh/textalytics/ocr_demo"

function GoogleServices(options){}

GoogleServices.prototype.constructor = GoogleServices;

GoogleServices.prototype.getOAuthClient = function(){
	return oauth2Client;
}

GoogleServices.prototype.login = function(response){
	// generates a url that allows offline access and asks permissions
	// for Google+ scope.
	var oauth2Client = new OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URL);
	var scopes = [
		'https://www.googleapis.com/auth/plus.login',
	  	'https://www.googleapis.com/auth/plus.me',
	  	'https://www.googleapis.com/auth/plus.profile.emails.read',
	 	'https://www.googleapis.com/auth/calendar',
	 	'https://www.googleapis.com/auth/drive'
	];

	var url = oauth2Client.generateAuthUrl({
	  access_type: 'offline',
	  scope: scopes.join(" ") // space delimited string of scopes
	});

	googleapis.drive('v2');
	googleapis.plus('v1');
	googleapis.oauth2('v2');
	
	response.writeHead(302, {location: url});
  response.end();
}

GoogleServices.prototype.loginCallback = function(code,response){
	this.getAccessToken(code,function(tokens){
		response.send(JSON.stringify(tokens));
	});
}

GoogleServices.prototype.getAccessToken =function(code, callback) {
  // request access token
	var oauth2Client = new OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URL);
	oauth2Client.getToken(code, function(err, tokens) {
    oauth2Client.setCredentials(tokens);
    callback(oauth2Client);
  });
}

GoogleServices.prototype.getUserProfile = function(code,callback){
  getAccessToken(code,function(oauth2Client,tokens){
  	_executeCommand(oauth2Client,function(client,oauth2Client){
  		_getUserProfile(client,oauth2Client,'me',function(err,results){callback('profile',err,results,tokens,oauth2Client);});
  	});
  });
}

GoogleServices.prototype.getDriveProfile = function(code,callback){
	getAccessToken(code,function(oauth2Client,tokens){
	  	_executeCommand(oauth2Client,function(client,oauth2Client){
	  		_getDriveProfile(client,oauth2Client,'me',function(err,results){callback('drive',err,results,tokens,oauth2Client);});
	  	});
	});
}

GoogleServices.prototype.reQueryDriveProfile = function(client,authClient,callback){

  	_executeCommand(authClient,function(reClient,oauth2Client){

		console.log('Requery Drive Profile Clients info');
  	_getDriveProfile(client,authClient,'me',function(err,results){callback('drive',err,results,tokens,authClient);});

	});
}

GoogleServices.prototype.getUserAndDriveProfile = function(code,callback){
	var self = this;
	getAccessToken(code,function(oauth2Client,tokens){
  	_executeCommand(oauth2Client,function(client,oauth2Client){
  		_getUserProfile(client,oauth2Client,'me',function(err,results){
  			console.log(results);
  			callback('profile',err,results,tokens,oauth2Client,client);

  		});
  				
  		_getDriveProfile(client,oauth2Client,'me',function(err,results){callback('drive',err,results,tokens,oauth2Client)});
  		_getClientFolders(client,oauth2Client,'me',function(err,results){
  			_processAndCheckOCRFolder(results,callback,client,oauth2Client,tokens);
  		})
		});
	});
}

GoogleServices.prototype.uploadClientOCRFile = function(client,oauth2Client,tokens,dataOptions, uploadCallback){
	_executeCommand(oauth2Client,function(newClient,newOauth2Client){
		_createClientOCRFile(newClient, oauth2Client, tokens, 'me', dataOptions, uploadCallback);
	});
}

GoogleServices.prototype.getClientOCRFile = function(client,oauth2Client,tokens,fileId, receivalCallback){
	_executeCommand(oauth2Client,function(newClient,newOauth2Client){
		_getClientOCRFile(newClient, oauth2Client, tokens, 'me', fileId, receivalCallback);
	});
}

function _processAndCheckOCRFolder(results,callback,client,oauth2Client,tokens){
	var folderObjs = results.items;
	var folder;
	for (var i in folderObjs) {
		folder = folderObjs[i];

		if (folder.mimeType == 'application/vnd.google-apps.folder' && folder.title == CLIENT_DEFAULT_OCR_FOLDER_NAME){
			callback('folder',undefined,folder,tokens,oauth2Client);
			return;
		}
	}
	_createClientOCRFolder(client,oauth2Client,'me',function(err,results){
		callback('folder',err,results,tokens,oauth2Client);
	});
}

GoogleServices.prototype.copyServiceDriveFileServiceAuth = function(fileId,newName,user,callback){
	var authClientCallback = function(err, tokens, client, authClient) {
		if (err) {
	    	errorCallback('Error authorizing account in authClient (Service account)',err);
	    	return;
	  	}
	  	// Successfully authorize account
	  	// Make an authorized request to list Drive files.
	  	_copyServiceFile(client,authClient,fileId,newName,callback);
	}
	_serviceAccountExecution(authClientCallback);
}


GoogleServices.prototype.copyServiceDriveFile = function(fileId,newName,user,callback){
	var authClient = user.serviceAuthClient;
	_executeCommand(authClient,function(client,oauth2Client){
		_copyServiceFile(client,oauth2Client,fileId,newName,callback);
	});
}

function _copyServiceFile(client,authClient,fileId,newName,callback){
	client.drive.files.copy({ 
		fileId : fileId,
		resource: { 
			title: newName
		} 
	}).withAuthClient(authClient).execute(callback);
}

GoogleServices.prototype.updateServiceDriveFileServiceAuth = function(fileId,newTitle,callback){
	var authClientCallback = function(err, tokens, client, authClient) {
		if (err) {
	    	errorCallback('Error authorizing account in authClient (Service account)',err);
	    	return;
	  	}
	  	// Successfully authorize account
	  	// Make an authorized request to list Drive files.
	  	_updateServiceFile(client,authClient,fileId,newTitle,callback);
	}
	_serviceAccountExecution(authClientCallback);
}

GoogleServices.prototype.updateServiceDriveFile = function(fileId,newTitle,user,callback){
	var authClient = user.serviceAuthClient;
	_executeCommand(authClient,function(client,oauth2Client){
		_copyServiceFile(client,oauth2Client,fileId,newTitle,callback);
	});
}

function _updateServiceFile(client,authClient,fileId,newTitle,callback){
	client.drive.files.update({ 
		fileId : fileId,
		resource: { 
			title: newTitle
		} 
	}).withAuthClient(authClient).execute(callback);
}
function _getUserProfile(client, authClient, userId, callback){
    client.plus.people.get({ userId: userId, auth: authClient }, callback);
}

function _getDriveProfile(client, authClient, userId, callback){
	client.drive.files.list({ auth: authClient }, callback);
}

function _getClientFolders(client, authClient, userId, callback){
	client.drive.files.list({
    q: "mimeType = 'application/vnd.google-apps.folder'",
    auth: authClient
  },callback);
}

function _createClientOCRFolder(client, authClient, userId, callback){
	client.drive.files.insert({
		resource:{
			"mimeType":"application/vnd.google-apps.folder",
			"title":CLIENT_DEFAULT_OCR_FOLDER_NAME
		},
		media:{
			"writersCanShare":true
		},
		auth: authClient
	}, callback);
}

function _getClientOCRFile(client, authClient, tokens, userId, fileId, callback){
	console.log(client.drive.files);
	client.drive.files.get({
		fileId: 			fileId,
		acknowledgeAbuse: true,
		media:true,
		auth: 				_renewClientOAuth2(tokens)
	}, callback);
}

function _createClientOCRFile(client, authClient, tokens, userId, dataOptions, callback){
	client.drive.files.insert({
		"convert": 					true,
	  "ocr": 							true,
	  "ocrLanguage": 			"en",
		resource:{
			"title":  					new Date().toDateString() + '/' + dataOptions.title,
	    "uploadType": 			"multipart",
	    "mimeType": 				dataOptions.mimeType,
	    "writersCanShare": 	true,
	    "description": 			dataOptions.description,
	    "parents": 					[ { id: dataOptions.folderId } ]
		},
		media:{
			"mimeType":					dataOptions.mimeType,
			"body": 						dataOptions.body
		},
		auth: 								_renewClientOAuth2(tokens)
	}, callback);
}

function _renewClientOAuth2(tokens){
	var OAuth2 = googleapis.auth.OAuth2;
	oauth2Client = new OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URL);
	oauth2Client.setCredentials(tokens);
	return oauth2Client;
}

function _executeCommand(oauth2Client,callback){
	callback({
		drive: 	googleapis.drive('v2'),
		plus: 	googleapis.plus('v1'),
		oauth: 	googleapis.oauth2('v2')
	},oauth2Client);
}

function getAccessToken(code, callback) {
    var oauth2Client = new OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URL);
    // request access token
  	oauth2Client.getToken(code, function(err, tokens) {
  		if (err) {
  			console.log(err);
	        console.log('An error occured', err);
	        return;
		}
  	    // set tokens to the client
   	 	// TODO: tokens should be set by OAuth2 client.
   	 	oauth2Client.setCredentials(tokens);

   		callback(oauth2Client,tokens);
 	});
}

/**
 * Copy an existing file.
 *
 * @param {String} originFileId ID of the origin file to copy.
 * @param {String} copyTitle Title of the copy.
 */
function copyFile(originFileId, copyTitle) {
  var body = {'title': copyTitle};
  var request = gapi.client.drive.files.copy({
    'fileId': originFileId,
    'resource': body
  });
  request.execute(function(resp) {
    console.log('Copy ID: ' + resp.id);
    return resp;
  });
}

//function compare()

/*
* Application Drive is accessed via this method
* successCallback(filesObject,tokens): JSON response of the files retrieved, Access tokens used for accessing the files
* errorCallback(message,errorObject): Message on the error appearing, err object returned by Google APIs
* where the authclient for svc account is returned, this is the beginning
*/


GoogleServices.prototype.listServiceAccountFiles = function(successCallback,errorCallback){
	var authClientCallback = function(err, tokens, client, authClient) {
	  if (err) {
	    errorCallback('Error authorizing account in authClient (Service account)',err);
	    return;
	  }
	  // Successfully authorize account
	  // Make an authorized request to list Drive files.
	  client.drive.files.list().withAuthClient(authClient).execute(function(err, files) {
	  		if (err) {
			    errorCallback('Error accessing files with authClient (Service Account)',err);
			    return;
			}
	  		successCallback(files,tokens,authClient);
		});
	}
	_serviceAccountExecution(authClientCallback);
}

GoogleServices.prototype.getServiceFilesByTitle= function(title,callback){
	var successCallback = function(files,tokens,authClient){
		var filesArray = files.items,
		callbackArray = [];
		for (var i in filesArray){
			var jsonFile = filesArray[i];
			if(jsonFile.title==title){
				callbackArray.push(jsonFile);
			}
		}
		callback(callbackArray);
	}
	var errorCallback = function(msg,err){
		console.log(msg);
	}
	this.listServiceAccountFiles(successCallback,errorCallback);
}

GoogleServices.prototype._consoleLogServiceAccountFiles = function(){
	var successCallback = function(files,tokens,authClient){
		var filesArray = files.items;
		for (var i in filesArray){
			var jsonFile = filesArray[i];
			console.log('ID: ' + jsonFile.id + ', Title: '+ jsonFile.title);
		}
	}
	var errorCallback = function(msg,err){
		console.log(msg);
	}
	this.listServiceAccountFiles(successCallback,errorCallback);
}

GoogleServices.prototype.deleteServiceFile = function(id,successCallback,errorCallback){
	var authClientCallback = function(err, tokens, client, authClient) {
	  if (err) {
	    errorCallback('Error authorizing account in authClient (Service account)',err);
	    return;
	  }

	  var retrieveGTempCredentials = function(response){
	  	var permissions = response.items;
	  	if (permissions.length>1){
	  		var svcPermission, secondaryPermission;
	  		for (var i in permissions){
		  		var indPermission = permissions[i];
		  		if (indPermission.domain=='developer.gserviceaccount.com'){
		  			svcPermission = indPermission;
		  		}else{
		  			secondaryPermission = indPermission;
		  		}
		  	}
	  		return {type:'multiple',service:svcPermission,secondary:secondaryPermission}
	  	}else{
	  		return {type:'single',permission:permissions[0]}
	  	}
	  }

	  _getServicePermissions(id,errorCallback,function(response){
	  	var serviceResults = retrieveGTempCredentials(response);
	  	if (serviceResults.type == 'single'){
	  		var serviceCredentials = serviceResults.permission;
	  		_deleteServiceFile(id,function(err,response){
	  			errorCallback('Could not remove permissions',err);
	  		},function(err,response){
	  			if (!response){
	  				response = {file:id}
	  			}else{
	  				response.file = id;
	  			}
	  			successCallback(err,response);
	  		});
	  	}else{
	  		var serviceCredentials = serviceResults.service,
	  		secondaryCredentials = serviceResults.secondary;
	  		console.log('multi file permissions');
	  		if (serviceCredentials.role == 'owner'){
	  			//upgrade secondary n remove urself
	  			_upgradeOtherUserToOwner(id,secondaryCredentials.id,function(err,success){
	  				if (success){
			  			success.file = id;
	  					successCallback(err,success);
	  				}else{
	  					console.log(err);
	  					errorCallback('Could not handle upgrading other user error',err);
	  				}
	  			});
	  		}else{
	  			_removeServiceFilePermission(id,serviceCredentials.id,function(err,response){
	  				console.log(err);
		  			errorCallback('Could not remove permissions',err);
		  		},function(err,response){
		  			if (!response){
		  				response = {file:id}
		  			}else{
		  				response.file = id;
		  			}
		  			successCallback(err,response);
		  		});
	  		}
	  	}
	  });
	}
	_serviceAccountExecution(authClientCallback);
}

GoogleServices.prototype.removeServiceFilePermissions = function(fileid,successCallback,errorCallback){
	var authClientCallback = function(err, tokens, client, authClient) {
	  if (err) {
	    errorCallback('Error authorizing account in authClient (Service account)',err);
	    return;
	  }

	  var retrieveGTempCredentials = function(response){
	  	var permissions = response.items;
	  	for (var i in permissions){
	  		var indPermission = permissions[i];
	  		if (indPermission.domain=='developer.gserviceaccount.com'){
	  			return indPermission;
	  		}
	  	}
	  	return null;
	  }

	  _getServicePermissions(fileid,errorCallback,function(response){
	  	var serviceCredentials = retrieveGTempCredentials(response);
	  	if(serviceCredentials!=null){
	  		// Successfully authorize account
			// Make an authorized request to list Drive files.
			_removeServiceFilePermission(fileid,serviceCredentials.id,errorCallback,successCallback);
		  	//client.drive.permissions.delete({fileId:fileid,permissionId:serviceCredentials.id}).withAuthClient(authClient).execute(function(err, success) {
		  		//successCallback(err,success);
			//});
	  	}else{
	  		errorCallback('No service credentials found',err);
	  	}
	  });
	}
	_serviceAccountExecution(authClientCallback);
}

function _removeServiceFilePermission(fileid,permissionid,errorCallback,successCallback){
	var authClientCallback = function(err, tokens, client, authClient) {
	  if (err) {
	    errorCallback('Error authorizing account in authClient (Service account)',err);
	    return;
	  }
	  // Successfully authorize account
	  // Make an authorized request to list Drive files.
	  client.drive.permissions.delete({fileId:fileid,permissionId:permissionid}).withAuthClient(authClient).execute(function(err,response) {
	  		if (err){
	  			errorCallback(err,response);
	  		}else{
	  			successCallback(err,response);
	  		}
		});
	}
	_serviceAccountExecution(authClientCallback);
}

function _deleteServiceFile(fileid,errorCallback,successCallback){
	var authClientCallback = function(err, tokens, client, authClient) {
	  if (err) {
	    errorCallback('Error authorizing account in authClient (Service account)',err);
	    return;
	  }
	  // Successfully authorize account
	  // Make an authorized request to list Drive files.
	  client.drive.files.delete({fileId:fileid}).withAuthClient(authClient).execute(function(err,response) {
	  		if (err){
	  			errorCallback(err,response);
	  		}else{
	  			successCallback(err,response);
	  		}
		});
	}
	_serviceAccountExecution(authClientCallback);
}

function _upgradeOtherUserToOwner(fileid,permissionid,callback){
	var authClientCallback = function(err, tokens, client, authClient) {
	  if (err) {
	    errorCallback('Error authorizing account in authClient (Service account)',err);
	    return;
	  }
	  // Successfully authorize account
	  // Make an authorized request to upgeade Drive files permission.
	  client.drive.permissions.update({
	  		fileId:fileid,
	  		permissionId:permissionid,
	  		transferOwnership:true
	  	},{
	  		role:'owner'
	  	}).withAuthClient(authClient).execute(function(err, success) {
	  		callback(err,success);
	  	});
	}
	_serviceAccountExecution(authClientCallback);
}

GoogleServices.prototype.addPermissionsToFile = function(fileID,userID,email,callback){
	var authClientCallback = function(err, tokens, client, authClient) {
	  if (err) {
	    errorCallback('Error authorizing account in authClient (Service account)',err);
	    return;
	  }
	  // Successfully authorize account
	  // Make an authorized request to list Drive files.
	  client.drive.permissions.insert({
	  	fileId:fileID,
	  	emailMessage: 'It does not do to dwell on dreams and forget to live, remember that. ~ Dumbledore'
	  },{
		id:userID,
		value: email,
		type: 'user',
		role: 'writer'
	  }
	  ).withAuthClient(authClient).execute(function(err,response) {
	  		callback(err,response);
		});
	}
	_serviceAccountExecution(authClientCallback);
}

GoogleServices.prototype.updateFileMetadata = function(fileID,title,callback){
	var authClientCallback = function(err, tokens, client, authClient) {
	  if (err) {
	    callback(err);
	    return;
	  }
	  // Make an authorized request to patch file title.
	  client.drive.files.patch({
	  	fileId:fileID,
	  },{
		title:title
	  }
	  ).withAuthClient(authClient).execute(function(err,response) {
	  		callback(err,response);
		});
	}
	_serviceAccountExecution(authClientCallback);
}

function _getServicePermissions(fileID,errorCallback,successCallback){
	var authClientCallback = function(err, tokens, client, authClient) {
	  if (err) {
	    errorCallback('Error authorizing account in authClient (Service account)',err);
	    return;
	  }
	  // Successfully authorize account
	  // Make an authorized request to list Drive files.
	  client.drive.permissions.list({fileId:fileID}).withAuthClient(authClient).execute(function(err,response) {
	  		if (err){
	  			errorCallback(err);
	  		}else{
	  			successCallback(response);
	  		}
		});
	}
	_serviceAccountExecution(authClientCallback);
}

/*
* Service discovery and request execution
*/
function _serviceAccountExecution(authClientCallback){
	googleapis
	  	.discover('drive', 'v2')
	  	.execute(function(err, client) {

		  var authClient = new googleapis.auth.JWT(
		    SERVICE_ACCOUNT_EMAIL,
		    SERVICE_ACCOUNT_KEY_FILE,
		    // Contents of private_key.pem if you want to load the pem file yourself
		    // (do not use the path parameter above if using this param)
		    '',
		    ['https://www.googleapis.com/auth/drive'],
		    // User to impersonate (leave empty if no impersonation needed)
		    '');

		  authClient.authorize(function(err,tokens){
		  	authClientCallback(err,tokens,client,authClient);
		  });

		});
}




module.exports = GoogleServices;