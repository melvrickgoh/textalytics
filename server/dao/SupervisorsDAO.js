var pgDAO = require('./index');
var dao = new pgDAO({pgURL:process.env.HEROKU_POSTGRESQL_RED_URL});

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