var https = require('https');
var Future = require('futures').future;

var AUTHORIZATION = 'Bearer KA5DLWOLPPGEHURAE7PBZPSPU5MK2L2N';

function Wit(options){

}

Wit.prototype.constructor = Wit;


Wit.prototype.requestWit = function(user_text) {
    var future = Future.create();
    var options = {
        host: 'api.wit.ai',
        path: '/message?v=20141001&q=' + encodeURIComponent(user_text),
        // the Authorization header allows you to access your Wit.AI account
        // make sure to replace it with your own
        headers: {'Authorization': AUTHORIZATION}
    };

    https.request(options, function(res) {
        var response = '';

        res.on('data', function (chunk) {
            response += chunk;
        });

        res.on('end', function () {
            future.fulfill(undefined, JSON.parse(response));
        });
    }).on('error', function(e) {
        future.fulfill(e, undefined);
    }).end();

    return future;
}

Wit.prototype.processWitResults = function(postTeam){

	var teamID = postTeam.id,
	sponsorRaw = postTeam.team,
	witIntepretation = postTeam.intepretation,
	witOutcomes = postTeam.intepretation.outcomes,
	bestOutcome,
	ultimateResult = {};

	ultimateResult.teamID = teamID;
	ultimateResult.raw = sponsorRaw;

	witOutcomes = _filterInvalidOutcomes(witOutcomes);

	//weed out invalid responses
	if (witOutcomes.length == 0){
		return {error: true, message: 'invalid input'}
	}

	//get the most confident outcome
	if (witOutcomes.length == 1){
		bestOutcome = witOutcomes[0];
	}else{
		bestOutcome = _getBestOutcome(witOutcomes);
	}

	ultimateResult.outcome = bestOutcome;
	ultimateResult.confidence = bestOutcome.confidence;

	//capture organizations
	var organizationResults = _getOrganizations(bestOutcome);
	ultimateResult.organizations = organizationResults.organizations,
	ultimateResult.acronyms = organizationResults.acronyms,
	ultimateResult.departments = organizationResults.departments;

	//capture persons from outcomes
	ultimateResult.persons = _getPersons(bestOutcome);

	//capture locations
	ultimateResult.locations = _getLocations(bestOutcome);

	//capture fringe results: emails
	var fringeResults = _getFringeResults(bestOutcome),
	ultimateResult.emails = fringeResults.emails;

	ultimateResult.startup = _checkForStartup(outcome);

	return ultimateResult;
}

function _checkForStartup(outcome){
	var startup = outcome.entities.startup;
	if (startup){
		return true;
	}
	return false;
}

function _getAlternateResults(outcome){
	var emails = outcome.entities.email,
	emailResults = [];

	if (emails && emails.length > 0){
		for (var i = 0; i < emails.length; i++) {
			if (emailResults.indexOf(emails[i].value.trim()) < 0){
				emailResults.push(emails[i].value.trim());
			}
		}
	}

	return {emails:emailResults}
}

function _getLocations(outcome){
	var locations = outcome.entities.location,
	locationResults = [];

	if (locations) {
		for (var i = 0; i < locations.length; i++) {
			if (locationResults.indexOf(locations[i].value.trim()) < 0) {
				locationResults.push(locations[i].value.trim());
			}
		}
	}

	return locationResults;
}

function _getOrganizations(outcome){
	var organizations = outcome.entities.organization,
	acronyms = outcome.entities.organization_acronym,
	departments = outcome.entities.department,
	organizationResults = [],
	organizationAcronyms = [],
	departmentResults = [];
	
	if (organizations && organizations.length > 0){
		for (var i = 0; i < organizations.length; i++){
			if (organizationResults.indexOf(organizations[i].value.trim()) < 0){
				organizationResults.push(organizations[i].value.trim());
			}
		}
	}

	if (acronyms && acronyms.length > 0){
		for (var i = 0; i < acronyms.length; i++){
			if (organizationAcronyms.indexOf(acronyms[i].value.trim()) < 0){
				organizationAcronyms.push(acronyms[i].value.trim());
			}
		}
	}

	if (departments && departments.length > 0){
		for (var i = 0; i < departments.length; i++){
			if (departmentResults.indexOf(departments[i].value.trim()) < 0){
				departmentResults.push(departments[i].value.trim());
			}
		}
	}

	return {organizations: organizationResults, acronyms: organizationAcronyms, departments: departmentResults};
}

function _getPersons(outcome){
	var persons = outcome.entities.person,
	firstNames = outcome.entities.first_name,
	lastNames = outcome.entities.last_name,
	personsResult = [];

	if (persons && persons.length > 0){
		for (var i = 0; i<persons.length; i++){
			personsResult.push(persons[i].value.trim());
		}
	}else{
		if (!firstNames && !lastNames){
			return [];//completely no one
		}else if (firstNames && lastNames && firstNames.length == lastNames.length){//if same match: can link coz in order
			for (var i = 0; i<firstNames.length; i++) {
				personsResult.push(firstNames[i].value.trim() + ' ' + lastNames[i].value.trim());
			}
		}else{
			if (firstNames && firstNames.length>0){
				for (var i = 0; i<firstNames.length; i++) {
					personsResult.push(firstNames[i].value.trim());
				}
			}
		}
	}
	return personsResult;
}

function _getBestOutcome(outcomes){
	var bestOutcome, topConfidence = 0;
	for (var i = 0; i<outcomes.length; i++){
		var currOutcome = outcomes[i];
		if (currOutcome.confidence > topConfidence){
			bestOutcome = currOutcome;
			topConfidence = currOutcome.confidence;
		}
	}
	return bestOutcome;
}

function _filterInvalidOutcomes(outcomes){
	var outcomes =  outcomes.filter(function(outcome){
		return outcome.intent !== 'invalid';
	});
	return outcomes;
}

module.exports = Wit;