var OAUTH_GROUPS = {
	t1:{
	    consumer_key: process.env.LI_1_KEY
	    , consumer_secret: process.env.LI_1_SECRET
	    , token: process.env.LI_1_TOKEN
	    , token_secret: process.env.LI_1_TOKEN_SECRET
	},
	t2:{
		consumer_key: process.env.LI_2_KEY
	    , consumer_secret: process.env.LI_2_SECRET
	    , token: process.env.LI_2_TOKEN
	    , token_secret: process.env.LI_2_TOKEN_SECRET
	},
	t3:{
		consumer_key: process.env.LI_3_KEY
	    , consumer_secret: process.env.LI_3_SECRET
	    , token: process.env.LI_3_TOKEN
	    , token_secret: process.env.LI_3_TOKEN_SECRET
	},
	t4:{
		consumer_key: process.env.LI_4_KEY
	    , consumer_secret: process.env.LI_4_SECRET
	    , token: process.env.LI_4_TOKEN
	    , token_secret: process.env.LI_4_TOKEN_SECRET
	}
},
OAUTH_GROUP = OAUTH_GROUPS.t3,
LinkedIN = require('node-linkedin')(OAUTH_GROUP.consumer_key, OAUTH_GROUP.consumer_secret, _determineLinkedInCallback()),
linkedin, svcLinkedIn;

function LinkedIn(options){

}

LinkedIn.prototype.constructor = LinkedIn;

LinkedIn.prototype.getLinkedInMaster = function(){
	return LinkedIN;
}

LinkedIn.prototype.initializeUserAuthorization = function(access_token) {
    linkedin = LinkedIN.init(access_token);
    return linkedin;
}

LinkedIn.prototype.serviceAutorization = function(){
	svcLinkedIn = LinkedIN.init(process.env.LI_1_TOKEN);
	return svcLinkedIn;
}

LinkedIn.prototype.companySearch = function(companyName,callback){
	var request = require('request')
    , qs = require('querystring')
 
    // LinkedIn Specifics
    , apiHost = 'https://api.linkedin.com/v1'
 
    , oauth = OAUTH_GROUP;
 
	var fetchCompanyInfo = function(companyName, callback){


	    var url = apiHost + '/company-search:(companies:(id,name,universal-name,website-url,industries,status,logo-url,blog-rss-url,twitter-id,employee-count-range,specialties,locations,description,stock-exchange,founded-year,end-year,num-followers))?keywords='+companyName+'&format=json'
	 
	    request.get({url:url, oauth:oauth, json:true}, function (e, r, body) {
	        if (e) return callback(e);

	        return callback(null, body);
	    });
	}
	fetchCompanyInfo(companyName,callback); 
}

LinkedIn.prototype.companySingaporeSearch = function(companyName,callback){
	var request = require('request')
    , qs = require('querystring')
 
    // LinkedIn Specifics
    , apiHost = 'https://api.linkedin.com/v1'
 
    , oauth = OAUTH_GROUP;
 
	var fetchCompanyInfo = function(companyName, callback){


	    var url = apiHost + '/company-search:(companies:(id,name,universal-name,website-url,industries,status,logo-url,blog-rss-url,twitter-id,employee-count-range,specialties,locations,description,stock-exchange,founded-year,end-year,num-followers))?keywords='+companyName+'&facet=location,sg:0&format=json'
	 
	    request.get({url:url, oauth:oauth, json:true}, function (e, r, body) {
	        if (e) return callback(e);

	        return callback(null, body);
	    });
	}
	fetchCompanyInfo(companyName,callback); 
}

LinkedIn.prototype.companyMatch = function(companyName,callback){
	https://api.linkedin.com/v1/companies/universal-name=linkedin
	var request = require('request')
    , qs = require('querystring')
 
    // LinkedIn Specifics
    , apiHost = 'https://api.linkedin.com/v1'
 
    , oauth = OAUTH_GROUP;
 
	var fetchCompanyInfo = function(companyName, callback){


	    var url = apiHost + '/companies/universal-name='+companyName+':(id,name,universal-name,website-url,industries,status,logo-url,blog-rss-url,twitter-id,employee-count-range,specialties,locations,description,stock-exchange,founded-year,end-year,num-followers)?format=json'
	 
	    request.get({url:url, oauth:oauth, json:true}, function (e, r, body) {
	        if (e) return callback(e);

	        return callback(null, body);
	    });
	}
	fetchCompanyInfo(companyName,callback); 
}

LinkedIn.prototype.extractFirstSearchCompany = function(bulkResults){
	var companyValues = bulkResults.companies.values;

	for (var i = 0; i < companyValues.length; i++) {
		console.log(companyValues[i].name);
	}
	return this.getCompanyDetails(companyValues[0]);
}

LinkedIn.prototype.getCompanyDetails = function(company){
	var specialities = [];
	if (company.specialities){
		specialities = company.specialities.values;
	}
	return {
		name: company.name,
		id: company.id,
		description: company.description,
		employees: company.employeeCountRange ? company.employeeCountRange.name : '',
		foundedYear: company.foundedYear,
		industries: company.industries ? company.industries.values : '',
		universalName : company.universalName,
		website : company.websiteUrl,
		specialities: specialities
	}
}

function _determineLinkedInCallback(){
	if (process.env.GOOGLE_STATUS) {
		return 'http://textalytics-wit.herokuapp.com/oauth/linkedin/callback';
	}else{
		return 'http://localhost:5432/oauth/linkedin/callback';
	}
}

module.exports = LinkedIn;