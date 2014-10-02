/*
 * GET home page.
 */

var express = require('express'),
TeamDAO = require('./dao/TeamDAO'),
main_router = express.Router();
//svc acct pw: notasecret
var readline = require('readline');

var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

var tDAO = new TeamDAO();

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

exports.index = main_router;