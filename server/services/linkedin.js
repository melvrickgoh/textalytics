var API_KEY = '75otna9w35iudo',
OAuth_Token = '620859b4-d7d5-4f60-9c3c-66a06f4b686f',
LOCAL_CALLBACK = 'http://localhost:5432/oauth/linkedin/callback',
DEPLOYED_CALLBACK = 'http://textalytics-wit.herokuapp.com/oauth/linkedin/callback',
LinkedIN = require('node-linkedin')(API_KEY, 'Zr6IYQxnELcwywLB', LOCAL_CALLBACK),
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
 
    , oauth = {
        consumer_key: '75otna9w35iudo'
        , consumer_secret: 'Zr6IYQxnELcwywLB'
        , token: '620859b4-d7d5-4f60-9c3c-66a06f4b686f'
        , token_secret: '777bbe55-39b6-4494-a9dd-eff9ab2b6ae7'
    };
 
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
 
    , oauth = {
        consumer_key: '75otna9w35iudo'
        , consumer_secret: 'Zr6IYQxnELcwywLB'
        , token: '620859b4-d7d5-4f60-9c3c-66a06f4b686f'
        , token_secret: '777bbe55-39b6-4494-a9dd-eff9ab2b6ae7'
    };
 
	var fetchCompanyInfo = function(companyName, callback){


	    var url = apiHost + '/company-search:(companies:(id,name,universal-name,website-url,industries,status,logo-url,blog-rss-url,twitter-id,employee-count-range,specialties,locations,description,stock-exchange,founded-year,end-year,num-followers))?keywords='+companyName+'&facet=location,sg:0,us:0&format=json'
	 
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
 
    , oauth = {
        consumer_key: '75otna9w35iudo'
        , consumer_secret: 'Zr6IYQxnELcwywLB'
        , token: '620859b4-d7d5-4f60-9c3c-66a06f4b686f'
        , token_secret: '777bbe55-39b6-4494-a9dd-eff9ab2b6ae7'
    };
 
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