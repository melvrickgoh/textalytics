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
		_restrictedLinkedIn(req,res,function(result){
			var liMaster = linkedIn.getLinkedInMaster();
			liMaster.auth.getAccessToken(res, req.query.code, function(err, results) {
		        if ( err )
		            return console.error(err);

		        /**
		         * Results have something like:
		         * {"expires_in":5184000,"access_token":". . . ."}
		         */

		        console.log(results);
		        return res.send(results);
		    });
		});
	});

main_router.route('/linkedin/helloworld')
	.all(function(req,res){
		_restrictedLinkedIn(req,res,function(result){
			res.send('linked in authenticated');
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
		_getTeamSponsorsInfo(function(isSuccess,results){
			if (isSuccess){
				var witCounter = 0,
				finalResponse = [];

				/*for (var k = 0; k<results.length; k++){
					var team = results[k];
					var sponsorIntepretation = wit.requestWit(team.sponsor);

					sponsorIntepretation.when(function(err,response){
						if (err) console.log(err); // handle error here
	        			team.intepretation = response;
	        			finalResponse.push(team);

	        			wit.processWitResults(response);

	        			witCounter++;
	        			if(witCounter==results.length){
	        				res.json(finalResponse);
	        			}
					});
				}*/

				var team = results[89];
				var sponsorIntepretation = wit.requestWit('Mr. Mishra Nigamananda, Standard Chartered. Mr Chris Ismael, Developer Evangelist, Microsoft Singapore');

				sponsorIntepretation.when(function(err,response){
					if (err) console.log(err); // handle error here
        			team.intepretation = response;
        			var processedResults = wit.processWitResults(team);
        			
        			res.json(processedResults);
				});
			}else{
				res.json('Cannot call from DB team data');
			}
		});
	});

function _restrictedLinkedIn(req,res,next){
	if(req.session.linkedIn){
		next(req.session.linkedIn);
	}else{
		res.redirect('/oauth/linkedin'); 
	}
}

function _getTeamSponsorsInfo(callback){
	tDAO.getAllTeams(function(isSuccess,results){
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
		}else{
			callback(isSuccess,results);
		}
	});
}



exports.index = main_router;