var OAUTH_GROUPS = {
	t1:{
	    consumer_key: '75otna9w35iudo'
	    , consumer_secret: 'Zr6IYQxnELcwywLB'
	    , token: '620859b4-d7d5-4f60-9c3c-66a06f4b686f'
	    , token_secret: '777bbe55-39b6-4494-a9dd-eff9ab2b6ae7'
	},
	t2:{
		consumer_key: '75zk9y8biiqhwl'
	    , consumer_secret: 'PpgGs9QQliIMkv46'
	    , token: 'a62b1fdf-88ac-4062-a9b8-602d5f48de66'
	    , token_secret: '31dcfab4-a3e5-42ea-903b-2b69e8c595f7'
	},
	t3:{
		consumer_key: '75ykn07z5f4pp4'
	    , consumer_secret: 'IsvID0ukMlVa0fez'
	    , token: '7e3ef627-79fc-4b4e-9c97-ab20a5ef8928'
	    , token_secret: '262839b5-b051-4f5a-a6e8-c231b717bd9b'
	},
	t4:{
		consumer_key: '75q21r3tmzi0iv'
	    , consumer_secret: 'KtDRXqIRQSK43hPr'
	    , token: 'a3c3cee6-1dc3-4b33-b015-342f795c1fa4'
	    , token_secret: 'c816aa48-f6a9-4ef0-9e71-a2012a89af13'
	}
},
OAUTH_GROUP = OAUTH_GROUPS.t2,
//OAuth_Token = '620859b4-d7d5-4f60-9c3c-66a06f4b686f',
LOCAL_CALLBACK = 'http://localhost:5432/oauth/linkedin/callback',
DEPLOYED_CALLBACK = 'http://textalytics-wit.herokuapp.com/oauth/linkedin/callback',
LinkedIN = require('node-linkedin')(OAUTH_GROUP.consumer_key, OAUTH_GROUP.consumer_secret, LOCAL_CALLBACK),
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
	svcLinkedIn = LinkedIN.init('620859b4-d7d5-4f60-9c3c-66a06f4b686f');
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

	/*for (var i = 0; i < companyValues.length; i++) {

	}*/
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

module.exports = LinkedIn;