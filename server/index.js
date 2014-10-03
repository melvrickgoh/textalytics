/*
 * GET home page.
 */

var express = require('express'),
TeamDAO = require('./dao/TeamDAO'),
Wit = require('./services/wit'),
main_router = express.Router();
//svc acct pw: notasecret
var readline = require('readline');

var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

var tDAO = new TeamDAO(),
wit = new Wit();

/*
* APP Classes
*/

main_router.route('/')
	.all(function(req,res){
		res.send('welcome to head');
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

				var team = results[80];
				var sponsorIntepretation = wit.requestWit(team.sponsor);

				sponsorIntepretation.when(function(err,response){
					if (err) console.log(err); // handle error here
        			team.intepretation = response;
        			console.log(team);
        			wit.processWitResults(response);

        			res.json(response);
				});
			}else{
				res.json('Cannot call from DB team data');
			}
		});
	});

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