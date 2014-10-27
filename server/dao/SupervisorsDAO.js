var pgDAO = require('./index');
var dao = new pgDAO({pgURL:"postgresql://lxkdnxglxsqpfd:i652h8UFdyfV-hRnADKlJDBWit@ec2-23-21-170-57.compute-1.amazonaws.com:5432/d2t3trkm3dvedc"});

var TABLENAME = 'supervisorteams',
	ID = 'id',
	SUPERVISOR = "supervisor",
	TEAM = "team",
	YEAR = "year",
	SEMESTER = "semester";

function SupervisorsDAO(options){
	if (options){
		dao = new pgDAO({pgURL:options.pgURL});
	}
}

SupervisorsDAO.prototype.getAllSupervisorRecords = function(callback){
	var selectSupervisorsDetails = {
		name:TABLENAME,
		distinct:false,
		attributes:[ID,SUPERVISOR,TEAM,YEAR,SEMESTER]
	};
	dao.select(selectIndustriesDetails,function(isSuccess,result){
		if (result.length >= 1){
			callback(true,result);//selected length >= 1
		}else{
			callback(false,result);//selected length is 0 or less
		}
	});
}

module.exports = IndustriesDAO;