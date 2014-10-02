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
	DES_ENTITIES = "descriptionentities";

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
			DESCRIPTIONLINKS,MEMBERS,SPONSOR,SPONSORLINK,SEMESTER,YEAR,ID,DES_KEYWORDS,DES_ENTITIES]
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

module.exports = TeamDAO;