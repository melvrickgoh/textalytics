var pgDAO = require('./index');
var dao = new pgDAO({pgURL:"postgres://raooddscbjubfm:_hRtPSh-P_d97Za496xD75SBCp@ec2-107-20-169-200.compute-1.amazonaws.com:5432/d1v8k0l98bmvg4"});

var TABLENAME = 'teams',
	NAME = "teamname",
	PAGE = "teampage",
	PITCH = "teampitch",
	ACCEPTANCE = "teamacceptance",
	POSTER = "teamposter",
	MIDTERMS = "teammidterm",
	FINALS = "teamfinalpresentation",
	REFERENCE = "projectreference",
	DESCRIPTION = "projectdescription",
	DESCRIPTIONLINKS = "descriptionlinks",
	MEMBERS = "teammembers",
	SPONSOR = "sponsor",
	SPONSORLINK = "sponsorlink",
	SEMESTER = "semester",
	YEAR = "year",
	ID = "id",
	DES_KEYWORDS = "descriptionkeywords",
	DES_ENTITIES = "descriptionentities",
	LI_NAME = "liname",
	LI_ID = 'liid',
	LI_DESCRIPTION = 'lidescription',
	LI_FOUNDINGYEAR = 'lifoundingyear',
	LI_EMPLOYEES = 'liemployees',
	LI_INDUSTRIES = 'liindustries',
	LI_UNIVERSALNAME = 'liuniversalname',
	LI_WEBSITE = 'liwebsite',
	LI_SPECIALITIES = 'lispecialities',
	LI_RAWNAME = "lirawname",
	WIT_INTENT = "witintent",
	WIT_CONFIDENCE = "witconfidence",
	WIT_PERSONS = "witpersons",
	WIT_ORGANIZATIONS = "witorganizations",
	WIT_DEPARTMENTS = "witdepartments",
	WIT_EMAILS = "witemails",
	WIT_ACRONYMS = "witacronyms",
	WIT_LOCATIONS = "witlocations",
	WIT_STARTUP = "witstartup";

function TeamDAO(options){
	if (options){
		dao = new pgDAO({pgURL:options.pgURL});
	}
}

TeamDAO.prototype.getAllTeams = function(callback){
	var selectTeamDetails = {
		name:TABLENAME,
		distinct:false,
		attributes:[NAME,PAGE,PITCH,ACCEPTANCE,POSTER,MIDTERMS,FINALS,REFERENCE,DESCRIPTION,
			DESCRIPTIONLINKS,MEMBERS,SPONSOR,SPONSORLINK,SEMESTER,YEAR,ID,DES_KEYWORDS,DES_ENTITIES,
			LI_NAME,LI_ID,LI_DESCRIPTION,LI_FOUNDINGYEAR,LI_EMPLOYEES,LI_INDUSTRIES,LI_UNIVERSALNAME,
			LI_WEBSITE,LI_SPECIALITIES,LI_RAWNAME,
			WIT_INTENT,WIT_CONFIDENCE,WIT_PERSONS,WIT_ORGANIZATIONS,WIT_DEPARTMENTS,WIT_EMAILS,
			WIT_ACRONYMS,WIT_LOCATIONS,WIT_STARTUP]
	};
	dao.select(selectTeamDetails,function(isSuccess,result){
		if (result.length >= 1){
			callback(true,result);//selected length >= 1
		}else{
			callback(false,result);//selected length is 0 or less
		}
	});
}

TeamDAO.prototype.getDimTeams = function(callback){
	var selectTeamDetails = {
		name:TABLENAME,
		distinct:false,
		attributes:[NAME,PAGE,PITCH,ACCEPTANCE,POSTER,MIDTERMS,FINALS,REFERENCE,DESCRIPTION,
			DESCRIPTIONLINKS,MEMBERS,SPONSOR,SPONSORLINK,SEMESTER,YEAR,ID,DES_KEYWORDS,DES_ENTITIES,
			LI_NAME,LI_ID,LI_DESCRIPTION,LI_FOUNDINGYEAR,LI_EMPLOYEES,LI_INDUSTRIES,LI_UNIVERSALNAME,
			LI_WEBSITE,LI_SPECIALITIES,LI_RAWNAME,
			WIT_INTENT,WIT_CONFIDENCE,WIT_PERSONS,WIT_ORGANIZATIONS,WIT_DEPARTMENTS,WIT_EMAILS,
			WIT_ACRONYMS,WIT_LOCATIONS,WIT_STARTUP],
		conditions:['witconfidence is null' ]
	};
	dao.select(selectTeamDetails,function(isSuccess,result){
		if (result.length >= 1){
			callback(true,result);//selected length >= 1
		}else{
			callback(false,result);//selected length is 0 or less
		}
	});
}

TeamDAO.prototype.getTeamsWithCompanies = function(callback){
	var selectTeamDetails = {
		name:TABLENAME,
		distinct:false,
		attributes:[NAME,ID,
			WIT_INTENT,WIT_CONFIDENCE,WIT_ORGANIZATIONS,WIT_DEPARTMENTS,
			WIT_ACRONYMS,WIT_LOCATIONS,WIT_STARTUP],
		conditions:['length(witorganizations)>0' ]
	};
	dao.select(selectTeamDetails,function(isSuccess,result){
		if (result.length >= 1){
			callback(true,result);//selected length >= 1
		}else{
			callback(false,result);//selected length is 0 or less
		}
	});
}

TeamDAO.prototype.updateInvalidIntent = function(teamID,witData,callback){
	var updateWitDetails = {
		name:TABLENAME,
		values:[{
			name:WIT_INTENT,
			type:'string',
			value:'invalid'
		}],
		conditions:['id = ' + teamID ]
	}
	dao.update(updateWitDetails,function(isSuccess,result){
		if (result.rowCount >= 1){
			callback(true);//selected length >= 1
		}else{
			callback(false);//selected length is 0 or less
		}
	});
}

TeamDAO.prototype.updateTeamWitData = function(teamID,witData,callback){
	console.log('team dao update wit called');
	var updateWitDetails = {
		name:TABLENAME,
		values:[{
			name:WIT_INTENT,
			type:'string',
			value:witData.outcome.intent
		},{
			name:WIT_CONFIDENCE,
			type:'double',
			value:witData.confidence
		},{
			name:WIT_PERSONS,
			type:'string',
			value:_arrayToString(witData.persons)
		},{
			name:WIT_ORGANIZATIONS,
			type:'string',
			value:_arrayToString(witData.organizations)
		},{
			name:WIT_DEPARTMENTS,
			type:'string',
			value:_arrayToString(witData.departments)
		},{
			name:WIT_EMAILS,
			type:'string',
			value:_arrayToString(witData.emails)
		},{
			name:WIT_ACRONYMS,
			type:'string',
			value:_arrayToString(witData.acronyms)
		},{
			name:WIT_LOCATIONS,
			type:'string',
			value:_arrayToString(witData.locations)
		},{
			name:WIT_STARTUP,
			type:'boolean',
			value:witData.startup
		}],
		conditions:['id = ' + teamID ]
	}
	dao.update(updateWitDetails,function(isSuccess,result){
		console.log('update processed details');
		console.log(isSuccess);
		console.log(result);
		if (result.rowCount >= 1){
			callback(true);//selected length >= 1
		}else{
			callback(false);//selected length is 0 or less
		}
	});
}

TeamDAO.prototype.updateRecommendedLinkedInData = function(teamID,rawName,linkedInDetails,callback){
	var updateTeamLinkedInDataDetails = {
		name:TABLENAME,
		values:[{
			name:LI_NAME,
			type:'string',
			value:linkedInDetails.name
		},{
			name:LI_ID,
			type:'string',
			value:linkedInDetails.id
		},{
			name:LI_DESCRIPTION,
			type:'string',
			value:linkedInDetails.description
		},{
			name:LI_FOUNDINGYEAR,
			type:'string',
			value:linkedInDetails.foundedYear? linkedInDetails.foundedYear:''
		},{
			name:LI_EMPLOYEES,
			type:'string',
			value:linkedInDetails.employees? linkedInDetails.employees:''
		},{
			name:LI_INDUSTRIES,
			type:'string',
			value:linkedInDetails.industries? _liIndustryArrayToString(linkedInDetails.industries):''
		},{
			name:LI_UNIVERSALNAME,
			type:'string',
			value:linkedInDetails.universalName? linkedInDetails.universalName: ''
		},{
			name:LI_WEBSITE,
			type:'string',
			value:linkedInDetails.website? linkedInDetails.website:''
		},{
			name:LI_SPECIALITIES,
			type:'string',
			value:linkedInDetails.specialities? ( _arrayToString(linkedInDetails.specialities).length>0 ? _arrayToString(linkedInDetails.specialities) : '' ) : ''
		},{
			name:LI_RAWNAME,
			type:'string',
			value:rawName
		}],
		conditions:['id = ' + teamID ]
	}
	dao.update(updateTeamLinkedInDataDetails,function(isSuccess,result){
		if (result.rowCount >= 1){
			callback(true);//selected length >= 1
		}else{
			try{
				callback(false);//selected length is 0 or less
			}catch(err){
				console.log(err);
			}
		}
	});
}

TeamDAO.prototype.updateTeamLinkedInData = function(teamID,linkedInDetails,callback){

	var processedCompaniesLIData = _linkedInMultiArray(linkedInDetails);
	var updateTeamLinkedInDataDetails = {
		name:TABLENAME,
		values:[{
			name:LI_NAME,
			type:'string',
			value:processedCompaniesLIData.names
		},{
			name:LI_ID,
			type:'string',
			value:processedCompaniesLIData.ids
		},{
			name:LI_DESCRIPTION,
			type:'string',
			value:''//processedCompaniesLIData.descriptions
		},{
			name:LI_FOUNDINGYEAR,
			type:'string',
			value:processedCompaniesLIData.years
		},{
			name:LI_EMPLOYEES,
			type:'string',
			value:processedCompaniesLIData.employees
		},{
			name:LI_INDUSTRIES,
			type:'string',
			value:processedCompaniesLIData.industries
		},{
			name:LI_UNIVERSALNAME,
			type:'string',
			value:processedCompaniesLIData.universalNames
		},{
			name:LI_WEBSITE,
			type:'string',
			value:processedCompaniesLIData.websites
		},{
			name:LI_SPECIALITIES,
			type:'string',
			value:processedCompaniesLIData.specialities
		},{
			name:LI_RAWNAME,
			type:'string',
			value:processedCompaniesLIData.rawNames
		}],
		conditions:['id = ' + teamID ]
	}
	dao.update(updateTeamLinkedInDataDetails,function(isSuccess,result){
		if (result.rowCount >= 1){
			callback(true);//selected length >= 1
		}else{
			try{
				callback(false);//selected length is 0 or less
			}catch(err){
				console.log(err);
			}
		}
	});
}

function _processDescription(input){
	var desired = input.replace(/[^\w\s]/gi, '');
	desired = desired.replace('\'','');
	return desired;
}

TeamDAO.prototype.interpretArrays = function(dbString){
	return dbString.split('~~');
}

TeamDAO.prototype.interpretLinkedInData = function(dbString){
	return dbString.split('XXX');
}

TeamDAO.prototype.interpretLinkedInIndustryArray = function(industryDBString){
	var companies = industryDBString.split('XXX');
	var companiesArr = [];
	for (var k = 0; k<companies.length; k++){
		var companyDBString = companies[k];
		var groups = companyDBString.split('~~');
		var resultArray = [];
		for (var i = 0; i<groups.length; i++){
			var resultValueArr = groups[i].split('III');
			resultArray.push({
				code: resultValueArr[0],
				name: resultValueArr[1]
			});
		}
		companiesArr.push(resultArray);
	}
	
	return companiesArr;
}

function _liIndustryArrayToString(industries){
	var result = '';

	if (industries){
		for (var i = 0; i<industries.length; i++){
			var industryCode = industries[i].code,
			industryName = industries[i].name;
			result += industryCode + 'III' + industryName + '~~';
		}

		if (result.length>0){
			result = result.substring(0,result.length-2);
		}
	}

	return result;
}

function _linkedInMultiArray(linkedInDetails){
	var scores = linkedInDetails.scores,
	companies = linkedInDetails.dataArray;

	//ordering is important
	var companyNames = '',
	companyIDs = '',
	companyDescriptions = '',
	foundingYears = '',
	employees = '',
	industries = '',
	universalNames = '',
	websites = '',
	specialities = '',
	rawNames = '';

	for (var i = 0; i<companies.length; i++){
		var company = companies[i];
		companyNames += company.name? company.name + 'XXX': '';
		companyIDs += company.id? company.id + 'XXX': '';
		companyDescriptions += company.description? _processDescription(company.description) + 'XXX' : '';
		foundingYears += company.foundedYear? company.foundedYear + 'XXX' : '';
		employees += company.employees? company.employees + 'XXX' : '';
		industries += company.industries? _liIndustryArrayToString(company.industries) + 'XXX' : '';
		universalNames += company.universalName? company.universalName + 'XXX' : '';
		websites += company.website? company.website + 'XXX' : '';
		specialities += company.specialities? ( _arrayToString(company.specialities).length>0 ? _arrayToString(company.specialities) + 'XXX' : '' ) : '';
		rawNames += company.rawName? company.rawName + 'XXX' : '';
	}

	if (companyNames.length > 3){
		companyNames = companyNames.substring(0,companyNames.length - 3);
	}
	if (companyIDs.length > 3){
		companyIDs = companyIDs.substring(0,companyIDs.length - 3);
	}
	if (companyDescriptions.length > 3){
		companyDescriptions = companyDescriptions.substring(0,companyDescriptions.length - 3);
	}
	if (foundingYears.length > 3){
		foundingYears = foundingYears.substring(0,foundingYears.length - 3);
	}
	if (employees.length > 3){
		employees = employees.substring(0,employees.length - 3);
	}
	if (industries.length > 3){
		industries = industries.substring(0,industries.length - 3);
	}
	if (universalNames.length > 3){
		universalNames = universalNames.substring(0,universalNames.length - 3);
	}
	if (websites.length > 3){
		websites = websites.substring(0,websites.length - 3);
	}
	if (specialities.length > 3){
		specialities = specialities.substring(0,specialities.length - 3);
	}
	if (rawNames.length > 3){
		rawNames = rawNames.substring(0,rawNames.length - 3);
	}

	return {
		names : companyNames,
		ids : companyIDs,
		descriptions : companyDescriptions,
		years : foundingYears,
		employees : employees,
		industries : industries,
		universalNames : universalNames,
		websites : websites,
		specialities : specialities,
		rawNames : rawNames
	}
}

function _arrayToString(array){
	var result = '';

	if (array){
		for (var i = 0; i<array.length; i++) {
			result += array[i] + '~~';
		}
		if (result.length>0){
			result = result.substring(0,result.length-2);
		}
	}
	return result;
}

module.exports = TeamDAO;