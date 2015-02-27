var pgDAO = require('./index');
var dao = new pgDAO({pgURL:"postgres://raooddscbjubfm:_hRtPSh-P_d97Za496xD75SBCp@ec2-107-20-169-200.compute-1.amazonaws.com:5432/d1v8k0l98bmvg4"});

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
	dao.select(selectSupervisorsDetails,function(isSuccess,result){
		if (result.length >= 1){
			callback(true,result);//selected length >= 1
		}else{
			callback(false,result);//selected length is 0 or less
		}
	});
}

module.exports = SupervisorsDAO;