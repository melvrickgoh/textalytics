var pgDAO = require('./index');
var dao = new pgDAO({pgURL:"postgresql://lxkdnxglxsqpfd:i652h8UFdyfV-hRnADKlJDBWit@ec2-23-21-170-57.compute-1.amazonaws.com:5432/d2t3trkm3dvedc"});

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
		dao = new pgDAO({pgURL:options.pgURL})
	}
}

TeamDAO.prototype.getAllTeams = function(callback){
	var selectTeamDetails = {
		name:TABLENAME,
		distinct:false,
		attributes:[NAME,PAGE,PITCH,ACCEPTANCE,POSTER,MIDTERMS,FINALS,REFERENCE,DESCRIPTION,
			DESCRIPTIONLINKS,MEMBERS,SPONSOR,SPONSORLINK,SEMESTER,YEAR,ID,DES_KEYWORDS,DES_ENTITIES,
			LI_NAME,LI_ID,LI_DESCRIPTION,LI_FOUNDINGYEAR,LI_EMPLOYEES,LI_INDUSTRIES,LI_UNIVERSALNAME,
			LI_WEBSITE,LI_SPECIALITIES,
			WIT_INTENT,WIT_CONFIDENCE,WIT_PERSONS,WIT_ORGANIZATIONS,WIT_DEPARTMENTS,WIT_EMAILS,
			WIT_ACRONYMS,WIT_LOCATIONS,WIT_STARTUP]
	};
	dao.select(selectTeamDetails,function(isSuccess,result){
		console.log(result);
		if (result.length >= 1){
			callback(true,result);//selected length >= 1
		}else{
			callback(false,result);//selected length is 0 or less
		}
	});
}

TeamDAO.prototype.updateTeamWitData = function(teamID,witData,callback){
	var updateWitDetails = {
		name:this.TABLENAME,
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
		conditions:['id = \'' + teamID + '\'']
	}
	dao.update(updateWitDetails,function(isSuccess,result){
		if (result.rowCount >= 1){
			callback(true);//selected length >= 1
		}else{
			callback(false);//selected length is 0 or less
		}
	});
}

TeamDAO.prototype.updateTeamLinkedInData = function(teamID,linkedInDetails,callback){
	var updateTeamLinkedInDataDetails = {
		name:this.TABLENAME,
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
			value:linkedInDetails.foundedYear
		},{
			name:LI_EMPLOYEES,
			type:'string',
			value:linkedInDetails.employees
		},{
			name:LI_INDUSTRIES,
			type:'string',
			value:_arrayToString(linkedInDetails.industries)
		},{
			name:LI_UNIVERSALNAME,
			type:'string',
			value:linkedInDetails.universalName
		},{
			name:LI_WEBSITE,
			type:'string',
			value:linkedInDetails.website
		},{
			name:LI_SPECIALITIES,
			type:'string',
			value:_arrayToString(linkedInDetails.specialities)
		}],
		conditions:['id = \'' + teamID + '\'']
	}
	dao.update(updateTeamLinkedInDataDetails,function(isSuccess,result){
		if (result.rowCount >= 1){
			callback(true);//selected length >= 1
		}else{
			callback(false);//selected length is 0 or less
		}
	});
}

TeamDAO.prototype.interpretArrays = function(dbString){
	return dbString.split(';');
}

TeamDAO.prototype.interpretIndustryArray = function(industryDBString){
	var groups = industryDBString.split(';');
	var resultArray = [];
	for (var i = 0; i<groups.length; i++){
		var resultValueArr = groups[i].split('=');
		resultArray.push({
			code: resultValueArr[0],
			name: resultValueArr[1]
		});
	}
	return resultArray;
}

function _liIndustryArrayToString(industries){
	var result = '';

	if (industries){
		for (var i = 0; i<industries.length; i++){
			var industryCode = industries[i].code,
			industryName = industries[i].name;
			result += industryCode + '=' + industryName + ';';
		}

		if (result.length>0){
			result = result.substring(0,result.length-1);
		}
	}

	return result;
}

function _arrayToString(array){
	var result = '';

	if (array){
		for (var i = 0; i<array.length; i++) {
			result += array[i] + ';';
		}
		if (result.length>0){
			result = result.substring(0,result.length-1);
		}
	}

	return result;
}

module.exports = TeamDAO;