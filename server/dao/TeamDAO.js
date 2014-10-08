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
	LI_NAME = "liName",
	LI_ID = 'liID',
	LI_DESCRIPTION = 'liDescription',
	LI_FOUNDINGYEAR = 'liFoundingYear',
	LI_EMPLOYEES = 'liEmployees',
	LI_INDUSTRIES = 'liIndustries',
	LI_UNIVERSALNAME = 'liUniversalName',
	LI_WEBSITE = 'liWebsite',
	LI_SPECIALITIES = 'liSpecialities';

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
			LI_WEBSITE,LI_SPECIALITIES]
	};
	dao.select(selectTeamDetails,function(isSuccess,result){
		if (result.length >= 1){
			callback(true,result);//selected length >= 1
		}else{
			callback(false,result);//selected length is 0 or less
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
			value:JSON.stringify(linkedInDetails.industries)
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
			value:JSON.stringify(linkedInDetails.specialities)
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

module.exports = TeamDAO;