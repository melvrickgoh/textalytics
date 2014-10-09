/*
 * GET home page.
 */

var express = require('express'),

TeamDAO = require('./dao/TeamDAO'),
Wit = require('./services/wit'),
LinkedIn = require('./services/linkedin'),
main_router = express.Router();
//svc acct pw: notasecret
var readline = require('readline');

var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

var tDAO = new TeamDAO(),
wit = new Wit(),
linkedIn = new LinkedIn();

/*
* APP Classes
*/

main_router.route('/')
	.all(function(req,res){
		res.send('welcome to head');
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
		_matchAndSearchCompany('linkedin',function(isSuccess,results){
			if(isSuccess){
				res.json(results);
			}else{
				console.log('cannot find company');
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

				for (var k = 0; k<100; k++){
					
					var team = results[k];
					if (team != undefined){
						console.log(JSON.stringify(team));
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

		        					if (witCounter == 100-1){
		        						res.json('done processing');
		        					}
		        				});
		        			}else{
		        				tDAO.updateInvalidIntent(response.id,processedResults,function(isSuccess){
		        					//res.json('single  full stream processing done but invalid intent');
		        					witCounter++;
		        					console.log('counter > ' + witCounter + 'results length > ' + results.length);


		        					if (witCounter == 100-1) {
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
						console.log(e);
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



exports.index = main_router;