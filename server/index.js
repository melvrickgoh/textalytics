/*
 * GET home page.
 */

const express = require('express'),


TeamDAO = require('./dao/TeamDAO'),
SupervisorsDAO = require('./dao/SupervisorsDAO'),
IndustriesDAO = require('./dao/IndustriesDAO'),
Wit = require('./services/wit'),
LinkedIn = require('./services/linkedin'),
Covectric = require('./services/covectric'),
GoogleServices = require('./services/GoogleServices'),
UserServices = require('./services/UserServices'),
FileServices = require('./services/FileServices'),
DownloaderService = require('./services/DownloaderService'),
OCRService = require('./services/OCRService'),
UserController = require('./controller/UserController'),
User = require('./entity/user'),
File = require('./entity/file'),
ImageCrawler = require('./services/ImageCrawler'),
main_router = express.Router();
//svc acct pw: notasecret
var readline = require('readline');

var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

var tDAO = new TeamDAO(),
sDAO = new SupervisorsDAO(),
iDAO = new IndustriesDAO(),
wit = new Wit(),
linkedIn = new LinkedIn(),
covectric = new Covectric(),
uSvcs = new UserServices(),
gSvcs = new GoogleServices(),
fSvcs = new FileServices(),
downloaderSvc = new DownloaderService({ GoogleServices: gSvcs}),
ocrReaderSvc = new OCRService(),
imageCrawler = new ImageCrawler(),
uController = new UserController({pgURL:process.env.HEROKU_POSTGRESQL_RED_URL});

//SET COVECTRIC BASELINES
iDAO.getAllIndustries(function(isSuccess,results){
	covectric.setIndustries(results);
});

/*
* APP Classes hello
*/

main_router.route('/')
	.all(function(req,res){
		res.render('index.ejs');
		//res.send('welcome to head');
	});

main_router.route('/ebolamap')
	.all(function(req,res){
		res.render('ebolamap.ejs');
		//res.send('welcome to head');
	});

main_router.route('/ebola')
	.all(function(req,res){
		res.render('ebola.ejs');
		//res.send('welcome to head');
	});

main_router.route('/ocr/login')
	.all(function(req,res){
		gSvcs.login(res);
	});

main_router.route('/ocr/oauth2callback')
	.all(function(req,res){
		var code = req.query.code;

		var returnCounter = 0;
		var loggedInUser = new User({}),
		files = [];

		gSvcs.getUserAndDriveProfile(code,function(resultType,err,results,tokens,oauth2Client,client) {

	      if (err) {
	        console.log('An error occured', err);
	        return;
	      }else{
	      	switch(resultType){
	      		case 'profile':
	      			uSvcs.loadSessionUserInfo(loggedInUser,results,tokens,oauth2Client,client);
	      			break;
	      		case 'folder':
	      			loggedInUser.ocrFolder = results;
	      			break;
	      		case 'drive':
	      			uSvcs.loadSessionUserFiles(results.items,files);	      			
	      			break;
	      		default:
	      			break;
	      	}
	      	returnCounter++;

	      	if (returnCounter == 3){//assign to the user the files at the end of the second callback
	      		loggedInUser.files = files;
	      		req.session.user = loggedInUser; //set the session to that of this user
	      		req.flash('user',loggedInUser);

	      		var authorization = req.session.authorization;
					  if (!authorization) {
					    authorization = req.session.authorization = {}
					  }
					  req.session.authorization['tokens'] = tokens;
					  req.session.authorization['authClient'] = oauth2Client;
					  req.session.authorization['client'] = loggedInUser.client;

	      		var targetRedirect = req.flash('target_locale')[0];//use only the first element as the result

	      		//update user database on user details
	      		uController.processGoogleLogin(loggedInUser,function(action,isSuccess,result){
	      			//action performed
	      			switch(action){
	      				case 'Update User':
	      					console.log(result);
	      					break;
	      				case 'Insert User':
	      					console.log(result);
	      					break;
	      				default:
	      			}
	      		});

	      		switch(targetRedirect){
	      			case 'ocr/play':
	      				req.flash('target_locale',undefined);//reset given that you've logged in already
	      				res.redirect('/ocr/play');
	      				break;
	      			default:
	      				res.redirect('/');
	      		}
	      	}
	      }
	      
	    });
	});

main_router.route('/api/server/createFolder')
	.all(function(req,res){
		gSvcs.createServerFolder(req.query.name, req.query.purpose, function(err,response){
			res.json(response);
		});
	});

main_router.route('/api/server/listServiceDriveFiles')
	.all(function(req,res){
		errCallback = function(err,results){
	  	res.json(results);
	  }
	  successCallback = function(files,tokens,authClient){
	  	res.json(files);
	  }
	  gSvcs.listServiceAccountFiles(successCallback,errCallback);
	});

main_router.route('/api/server/deleteServiceFile')
	.all(function(req,res){
		var	errCallback = function(msg,err){
			err['sysMessage'] = msg;
	  	res.json(err);
	  },
	  successCallback = function(err,repsonse){
	  	res.json(repsonse);
	  };
	  gSvcs.deleteServiceFile(req.query.id,successCallback,errCallback);
	});

main_router.route('/api/server/downloadServiceFile')
	.all(function(req,res){
		downloaderSvc.downloadServiceFile(req.query.id,function(err,results){
			res.json(results);
		});
	});

main_router.route('/api/server/readServiceFile')
	.all(function(req,res){
		ocrReaderSvc.readOCRFile(__dirname+'/../',req.query.id+'.txt',function(isSuccess,response){
			res.json(response);
		});
	});

main_router.route('/api/server/readServiceHTML')
	.all(function(req,res){
		ocrReaderSvc.readOCRHTML(__dirname+'/../',req.query.id+'.html',function(isSuccess,response){
			res.json(response);
		});
	});

main_router.route('/api/ocr/serverUploadImage')
	.all(function(req,res){
	  errCallback = function(err,results){
	  	res.json(results);
	  }
	  successCallback = function(results){
	  	res.json(results);
	  }

		var imageLink = req.query.image_link,
		imageName = req.query.image_name;

		imageCrawler.downloadImage(imageLink,function(err,imageResults){
			gSvcs.uploadServerOCRFile(imageLink,{
				title: imageLink,
				description: imageLink,
				mimeType: imageResults.mimeType,
				body: imageResults.data,
				folderId: process.env.GOOGLE_SERVICE_FOLDERS_DEMO_ID
			},function(err,response){
				response['bodyImage'] = imageResults.mimeType + ";base64," + imageResults.data.toString('base64');
				response['purpose'] = 'demo';
				response['type'] = 'demo';

				gSvcs.addServicePermissionsToFile(response.id, process.env.GOOGLE_TEXTALYTICS_USER_ID, process.env.GOOGLE_TEXTALYTICS_USER_EMAIL, function(permsErr, permsResp){
					if (permsErr) {
						permsResp('error') = true;
						permsResp('error_message') = 'Image not processed and recorded. Err: Failure to add sys service permission to file';
					}
				});

				var recursiveDownloadAndReadOCR = function(response,masterCallback){
					_downloadAndReadOCRFile(response,function(isReadOCRSuccess,readOCRResults){
						if (!isReadOCRSuccess && readOCRResults.error_code == 1){ //failure
							failureOCRAction(response,masterCallback);
						}else{
							successOCRAction(response,readOCRResults,masterCallback);
						}
					});
				}

				var failureOCRAction = function(response,masterCallback){
					fSvcs.removeOCRFile(__dirname+'/../downloads/'+response.id + '.html',function(isRemovalSuccess,removalMessage){
						gSvcs.setGlobalReadPermissions(response.id,function(readPermissionsErr,readPermissionResponse){
							setTimeout(recursiveDownloadAndReadOCR(response,masterCallback),3500);
						});
					});
				}

				var successOCRAction = function(response,successResults,masterCallback){
					fSvcs.saveOCRRawText(response,function(isSuccess,results){
						if (!isSuccess) { 
							console.log(results); 
						} else {
							fSvcs.removeOCRFile(__dirname+'/../downloads/'+response.id + '.html',function(isRemovalSuccess,removalMessage){
								masterCallback(true,response);
							});
						}
					});
				}

				gSvcs.setGlobalReadPermissions(response.id,function(readPermissionsErr,readPermissionResponse){
					setTimeout(recursiveDownloadAndReadOCR(response,function(isRecursionSuccess,recursionResponse){
						res.json(response);
					}),3500);
				});
			});
		});
		
	});

main_router.route('/api/ocr/uploadImage')
	.all(function(req,res){
		_restrict(req,res,function(user){
			var authorization = req.session.authorization,
			user = req.session.user;

		  if (!authorization) {
		    res.redirect('/ocr/play');
		  }

			var imageLink = req.query.image_link,
			imageName = req.query.image_name;

			imageCrawler.downloadImage(imageLink,function(err,imageResults){
				gSvcs.uploadClientOCRFile(authorization['client'],authorization['authClient'],authorization['tokens'],{
					title: imageName,
					description: imageLink,
					mimeType: imageResults.mimeType,
					body: imageResults.data,
					folderId: user.ocrFolder.id
				},function(err,response){
					response['bodyImage'] = imageResults.mimeType + ";base64," + imageResults.data.toString('base64');
					
					gSvcs.getClientOCRFile(authorization['client'],authorization['authClient'],authorization['tokens'],response.id,function(getFileErr,getFileResponse){
						response['ocrFile'] = getFileResponse;
						res.send(response);
					});
				});
			});

		},'api/ocr/uploadImage');
	});

main_router.route('/api/image_crawl')
	.all(function(req,res){
		var url = req.query.image,
		authorization = req.session.authorization,
		user = req.session.user;

		if (!authorization) {
	    res.redirect('/ocr/login');
	  }
		imageCrawler.downloadImage(url,function(err,imageResults){
			gSvcs.uploadClientOCRFile(authorization['client'],authorization['authClient'],authorization['tokens'],{
				title: "test_file.png",
				description: url,
				mimeType: imageResults.mimeType,
				body: imageResults.data,
				folderId: user.ocrFolder.id
			},function(err,response){
				response['bodyImage'] = imageResults.mimeType + ";base64," + imageResults.data.toString('base64');
				res.send(response);
			});
		});
	});

main_router.route('/ocr/play')
	.all(function(req,res){
		_restrict(req,res,function(user){
			res.render('ocr_flow.ejs',{
				user : req.session.user
			});
		},'ocr/play');
	});

main_router.route('/ocr/server/test')
	.all(function(req,res){
		_restrict(req,res,function(user){
			res.render('ocr_server_flow.ejs',{
				user : req.session.user
			});
		},'ocr/server/test');
	});

main_router.route('/ocr/files')
	.all(function(req,res){
		_restrict(req,res,function(user){
			res.json(req.flash('user'));
		},'ocr/files');
	});

main_router.route('/play')
	.all(function(req,res){
		res.render('flow.ejs');
		//res.send('welcome to head');
	});

main_router.route('/nv')
	.all(function(req,res){
		res.render('visualize.ejs');
	});

main_router.route('/covectric')
	.all(function(req,res){
		var search = req.query.q;
		var results = covectric.searchIndustry(search);
		res.json(results);
	});

main_router.route('/visualize')
	.all(function(req,res){
		res.render('visualizebar.ejs');
	});

main_router.route('/allteamsdata')
	.all(function(req,res){
		tDAO.getAllTeams(function(isSuccess,results){
			if(isSuccess){
				res.json(results);
			}else{
				res.json({error:true});
			}
		});
	});

main_router.route('/oauth/linkedin')
	.all(function(req,res){
		var liMaster = linkedIn.getLinkedInMaster();
		liMaster.auth.authorize(res, ['r_basicprofile', 'r_fullprofile', 'r_emailaddress', 'r_network', 'r_contactinfo', 'rw_nus', 'rw_groups', 'w_messages']);
	});

main_router.route('/oauth/linkedin/callback')
	.all(function(req,res){
		var liMaster = linkedIn.getLinkedInMaster();
		liMaster.auth.getAccessToken(res, req.query.code, function(err, results) {
	        if ( err )
	            return console.error(err);

	        /**
	         * Results have something like:
	         * {"expires_in":5184000,"access_token":". . . ."}
	         */
	         var results = JSON.parse(results);
	         var accessToken = results.access_token;
	         linkedIn.initializeUserAuthorization(accessToken);

	        var targetLocale = req.flash('destination')[0];

	        req.flash('linkedIn',accessToken);
	        req.session.linkedIn = accessToken;

	        res.redirect(targetLocale);
	    });
	});

main_router.route('/linkedin/helloworld')
	.all(function(req,res){
		_restrictedLinkedIn(req,res,function(result){
			res.json('linked in authenticated');
		},'/linkedin/helloworld');
	});

main_router.route('/linkedin/company-search')
	.all(function(req,res){
		var company = req.query.company;
		_matchAndSearchCompanySingapore(company,function(isSuccess,results){
			if(isSuccess){
				res.json(results);
			}else{
				console.log('cannot find company');
				res.json(results);
			}
		});
	});

main_router.route('/teamextracts')
	.all(function(req,res){
		var newTeams = tDAO.getAllTeams(function(isSuccess,results){
			if(isSuccess){
				res.json(results);
			}else{
				res.json(results);
			}
		});
	});

main_router.route('/testSplitString')
	.all(function(req,res){
		res.json('overture labs'.split('~~'));
	});

main_router.route('/linkedin/processSearch')
	.all(function(req,res){
		tDAO.getTeamsWithCompanies(function(isSuccess,results){
			if(isSuccess){
				var bigCounter = 0,
				companiesLISearchStore = {};
				for (var i = 0; i<results.length; i++){
					var coy = results[i],
					companies = results[i].witorganizations.split('~~');
					companiesLISearchStore[coy.id] = {};
					companiesLISearchStore[coy.id].companiesResults = [],
					companiesLISearchStore[coy.id].companiesScores = {},
					companiesLISearchStore[coy.id].companiesCounter = 0;
					for (var j = 0; j<companies.length; j++){
						var company = companies[j];
						console.log('PRE CALL > '+company);
						/*if (company.trim().toLowerCase() == 'iie'){
							companiesCounter++;
							continue;
						}*/
						_matchAndSearchCompanySingapore(company,function(isSuccess,searchResults,companyID){
							if(isSuccess){
								searchResults.rawName = company;
								companiesLISearchStore[companyID].companiesScores[company] = searchResults;
								companiesLISearchStore[companyID].companiesResults.push(searchResults);
							}else{
								companiesLISearchStore[companyID].companiesScores[company] = false;
								console.log('cannot find company > ' + company);
							}
								
							companiesLISearchStore[companyID].companiesCounter++;

							if (companiesLISearchStore[companyID].companiesCounter == companies.length){
								tDAO.updateTeamLinkedInData(companyID,{scores: companiesLISearchStore[companyID].companiesScores,dataArray: companiesLISearchStore[companyID].companiesResults},function(isSuccess,dbresults){
									console.log(companyID + " update results > " + dbresults);
								});
								bigCounter++;
							}
							if (bigCounter == results.length){
								res.json('done processing');
							}
							return;
						},coy.id);
					}
					
				}
			}else{
				res.json('DAO failed to retrieve companies');
			}
			
		});
	});

main_router.route('/api/recommendation')
	.all(function(req,res){
		req.setTimeout(200000000,function () {
		  req.abort();
		  self.emit('pass',message);
		});

		var company = req.query.company,
		industry = req.query.industry,
		industryCode = req.query.industryCode;

		if (industry.indexOf('XandX')>-1){
			industry = industry.replace('XandX','&');
		}

		tDAO.getAllTeams(function(isSuccess,tResults){
			sDAO.getAllSupervisorRecords(function(isSuccess,sResults){
				iDAO.getAllIndustries(function(isSuccess,iResults){
					var industryDictionary = sortTeamsByIndustries(tResults,sResults,iResults);
					//console.log(Object.keys(industryDictionary));
					console.log('----------   Industry   -------------');
					var wantedIndustryGroup;
					if (industry.indexOf('/')>-1){
						var modIndustryName = industry;
						modIndustryName = modIndustryName.replace('/',' or ');
						wantedIndustryGroup = industryDictionary[modIndustryName];
					}else{
						wantedIndustryGroup = industryDictionary[industry];
					}
					console.log('------------ wanted group ----------');
					//console.log(wantedIndustryGroup);
					if (!wantedIndustryGroup){//if undefined, check out for similar groups
						var similarResults = covectric.searchIndustry(industry);
						if (similarResults.length>0){
							var aggregateSimilarProjects = _aggregateSimilarProjects(similarResults,industryDictionary,industry);
							console.log('------------- aggregated projects --------------');
							//console.log(aggregateSimilarProjects);
							var rankResults = _organizeAndRankByProfessors(wantedIndustryGroup);
							res.json(rankResults);
						}else{
							console.log('no similar results as weill');
							res.json({noresults:true});
							//no similar results have to address that you're unable to find a prof
						}
					}else{
						var rankResults = _organizeAndRankByProfessors(wantedIndustryGroup);
						res.json(rankResults);
					}
				});
			});
		});
	});

main_router.route('/api/linkedin')
	.all(function(req,res){
		var company = req.query.company,
		teamID = req.query.id;
		_matchAndSearchCompanySingapore(company,function(isSuccess,results){
			if(isSuccess){
				tDAO.updateRecommendedLinkedInData(teamID,company,results,function(isSuccess){
					console.log('company data found');
					res.json({liWorked:isSuccess,linkedin: results, db: isSuccess});
				});
			}else{
				console.log('cannot find company');
				res.json({liWorked:isSuccess,linkedin:results});
			}
		});
	});

main_router.route('/api/wit')
	.all(function(req,res){
		req.setTimeout(200000000,function () {
		  req.abort();
		  console.log("timeout");
		  self.emit('pass',message);
		});
		var teamName = req.query.name,
		teamID = req.query.id,
		teamSponsor = req.query.sponsor;

		var team = {
			id:parseInt(teamID),
			team:teamName,
			sponsor:teamSponsor
		};

		var sponsorIntepretation = wit.requestWit(team);
		sponsorIntepretation.when(function(err,response){
			if (err) console.log(err); // handle error here
			//team.intepretation = response;
			var processedResults = wit.processWitResults(response);
			
			if (processedResults.outcome && processedResults.outcome.intent == 'sponsor'){
				tDAO.updateTeamWitData(response.id,processedResults,function(isSuccess){
					res.json(processedResults);
				});
			}else{
				tDAO.updateInvalidIntent(response.id,processedResults,function(isSuccess){
					if (witCounter == results.length-1) {
						res.json('Invalid Intent');
					}
				});
			}
		});
	});

main_router.route('/teamwit')
	.all(function(req,res){
		req.setTimeout(200000000,function () {
		  req.abort();
		  console.log("timeout");
		  self.emit('pass',message);
		});

		_getTeamSponsorsInfo(function(isSuccess,results){
			if (isSuccess){
				var witCounter = 0,
				finalResponse = [];

				for (var k = 0; k<results.length; k++){
					
					var team = results[k];
					if (team != undefined){
						var sponsorIntepretation = wit.requestWit(team);

						sponsorIntepretation.when(function(err,response){
							if (err) console.log(err); // handle error here
		        			//team.intepretation = response;
		        			var processedResults = wit.processWitResults(response);
		        			if (processedResults.outcome && processedResults.outcome.intent == 'sponsor'){
		        				tDAO.updateTeamWitData(response.id,processedResults,function(isSuccess){
		        					/*if (processedResults.organizations.length > 0){
		        						var organizations = processedResults.organizations;
		        						var organizationsLinkedInData = [],
		        						scoring = {},
		        						organizationSearchCounter = 0;//let dao know which one failed linkedin's search
		        						for (var i = 0; i<organizations.length; i++){
		        							var companyName = organizations[i];
		        							/*_matchAndSearchCompany(companyName,function(isSuccess,companyDetails){
		        								if(isSuccess){
		        									//do something about it
		        									companyDetails.rawName = companyName;
		        									organizationsLinkedInData.push(companyDetails);
		        									scoring[companyName] = companyDetails.name;
		        								}else{
		        									scoring[companyName] = false;
		        								}

		        								organizationSearchCounter++;
		        								console.log('counter  == '+ organizationSearchCounter);
		        								if (organizationSearchCounter == organizations.length){
		        									//time to update database
		        									tDAO.updateTeamLinkedInData(team.id,{scores:scoring,dataArray:organizationsLinkedInData},function(isSuccess){
		        										
		        										if (witCounter == results.length){
		        											//res.json('done processing');
		        										}
		        										//res.json(organizationsLinkedInData);
		        									});
		        								}
		        							});
		        						}
		        					}*/
		        					witCounter++;
		        					console.log('counter > ' + witCounter + 'results length > ' + results.length);

		        					if (witCounter == results.length-1){
		        						res.json('done processing');
		        					}
		        				});
		        			}else{
		        				tDAO.updateInvalidIntent(response.id,processedResults,function(isSuccess){
		        					//res.json('single  full stream processing done but invalid intent');
		        					witCounter++;
		        					console.log('counter > ' + witCounter + 'results length > ' + results.length);


		        					if (witCounter == results.length-1) {
		        						res.json('done processing');
		        					}
		        				});
	        				}
	        				

						});
					}else{
						witCounter++;
					}
				}
			}else{
				res.json('Cannot call from DB team data');
			}
		});
	});

function _aggregateSimilarProjects(similarResults,industryDictionary,industry){
	var aggregatedProjects = [];
	var industryModMap = covectric.getIndustryModMap();
	var resIndustry = industry;
	if(industry.indexOf('/')>-1){
		resIndustry = resIndustry.replace('/',' or ');
	}
	for (var i in similarResults){
		var resultCode = similarResults[i].id,
		resultDes = similarResults[i].name;

		var similarArray = industryDictionary[resultDes];
		if (similarArray) {
			aggregatedProjects = aggregatedProjects.concat(similarArray);
		}
	}
	return aggregatedProjects;
}

function _organizeAndRankByProfessors(industryArray){
	var highestCounter = 0,
	highestProfessor;

	var professorLog = {};
	for (var i in industryArray){
		console.log('----------- ranking groups ' + i + ' ---------------' );
		var industryProject = industryArray[i];
		if (industryProject.supervisor){
			console.log(industryProject.supervisor);
			var supervisor = industryProject.supervisor.supervisor;
			if (!professorLog[supervisor]) {
				professorLog[supervisor] = {tf:0,array:[]};
			}

			professorLog[supervisor].array.push(industryProject);

			if (professorLog[supervisor].array.length>highestCounter){
				highestCounter = professorLog[supervisor].array.length;
				highestProfessor = supervisor;
			}
		}
	}

	var professorLogKeys = Object.keys(professorLog);
	for (var k in professorLogKeys){
		var professorGroup = professorLog[professorLogKeys[k]];
		console.log('score: '+professorGroup.array.length/highestCounter);
		professorGroup.tf = professorGroup.array.length/highestCounter;
		professorGroup.supervisor = professorLogKeys[k];
	}

	var sortedProfessorLog = _sortProfessorLog(professorLog);

	return {highestCounter:highestCounter,profLog:professorLog,sortArray:sortedProfessorLog};
}

function _sortProfessorLog(logs){
	var logsKeys = Object.keys(logs),
	sortable = [];

	for (var i in logsKeys){
		sortable.push(logs[logsKeys[i]]);
	}

	if (logsKeys.length > 1){
		sortable.sort(function(a,b){
			var atf = a.tf,
			btf = b.tf;
			return btf < atf ? -1 : (btf > atf ? 1 : 0);
		});
	}

	return sortable;
}

function _matchAndSearchCompanySingapore(companyName,callback,companyID){
	linkedIn.companyMatch(companyName,function(e,results){
		if(e){
			console.log('error' + e);
		}else{
			var matchResults = results;
			if (matchResults.errorCode == 0){
				//initiate search
				linkedIn.companySingaporeSearch(companyName,function(e,results1){
					if(e){
						console.log('error occured');
					}else{
						var searchResults = results1;
						if (searchResults.companies && searchResults.companies._total > 0){
							callback(true,linkedIn.extractFirstSearchCompany(searchResults),companyID);
						}else{
							callback(false,searchResults,companyID);
						}
					}
				});
			}else{
				//got back the results
				callback(true,linkedIn.getCompanyDetails(results),companyID);
			}
		}
	});
}

function _matchAndSearchCompany(companyName,callback){
	linkedIn.companyMatch(companyName,function(e,results){
		if(e){
			console.log('error' + e);
		}else{
			var matchResults = results;
			if (matchResults.errorCode == 0){
				//initiate search
				linkedIn.companySearch(companyName,function(e,results1){
					if(e){
						console.log('error occured');
					}else{
						var searchResults = results1;
						if (searchResults.companies._total > 0){
							callback(true,linkedIn.extractFirstSearchCompany(searchResults));
						}else{
							callback(false,searchResults);
						}
					}
				});
			}else{
				//got back the results
				callback(true,linkedIn.getCompanyDetails(results));
			}
		}
	});
}

function _restrictedLinkedIn(req,res,next,targetLocale){
	if(req.session.linkedIn){
		next(req.flash('linkedIn'));
	}else{
		req.flash('destination',targetLocale);
		res.redirect('/oauth/linkedin'); 
	}
}

function _getTeamSponsorsInfo(callback){
	tDAO.getDimTeams(function(isSuccess,results){
		if (isSuccess){
			var resultsArr = [];
			for (var i = 0; i<results.length; i++){
				resultsArr.push({
					id: results[i].id,
					sponsor: results[i].sponsor,
					team:results[i].teamname
				});
			}
			callback(true,resultsArr);
			console.log(resultsArr.length);
		}else{
			callback(isSuccess,results);
		}
	});
}

function sortTeamsByIndustries(teams,supervisorRecords,industriesList){
	var industriesDictionary = {
		startup:[],
		unclassified:[]
	},
	supervisorMap = mapSupervisors(supervisorRecords);

	for (var i in teams){
		var team = teams[i],
		teamSRID = ''+team.teamname + team.year + team.semester;
		team.supervisor = supervisorMap[teamSRID];
		if (team.witstartup) {
			industriesDictionary.startup.push(team);
		}else{
			if (team.liindustries && team.liindustries.length>0){
				var industry = intepretIndustries(team.liindustries);
				if (!industriesDictionary[industry]){
					industriesDictionary[industry] = [];
				}
				industriesDictionary[industry].push(team);
			}else{
				industriesDictionary.unclassified.push(team);
			}
		}
	}
	return industriesDictionary;
}

function mapSupervisors(supervisorRecords){
	var teamMap = {};
	for (var i in supervisorRecords){
		var sr = supervisorRecords[i],
		srID = sr.team + sr.year + sr.semester;
		teamMap[srID] = sr;
	}
	return teamMap;
}

function intepretIndustries(dbString){
	return dbString.trim().split('III')[1];
}

function _restrict(req, res, next, targetLocale) {                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     
  if (req.session.user) {
    next(req.session.user);                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             
  } else {                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              
    req.session.error = 'Access denied!';
    req.flash('target_locale',targetLocale);
    console.log(targetLocale);
    res.redirect('/ocr/login');                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             
  }                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     
}

function _downloadAndReadOCRFile(response, dlCallback){
	console.log('Wait 3.5 seconds to launch download feature');
	downloaderSvc.downloadServiceFile(response.id,function(downloadSuccess,downloadResults){
		if (downloadSuccess) {
			ocrReaderSvc.readOCRHTML(__dirname+'/../',response.id + '.html',function(ocrSuccess,ocrResults){
				if (ocrSuccess) { 
					response['ocrText'] = ocrResults;
					dlCallback(true,response);
				}else{
					dlCallback(false,{
						error: true,
						error_code: ocrResults.error_code,
						error_message: ocrResults.error_message,
					});
				}
			});
		} else {
			dlCallback(false,{
				error: true,
				error_code: 0,
				error_message: 'Image not processed and recorded. Err: Download to file system was a failure',
				err: downloadResults 
			});
		}
	});
}

exports.index = main_router;