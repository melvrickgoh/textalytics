var pgDAO = require('./index');
var dao = new pgDAO({pgURL:process.env.HEROKU_POSTGRESQL_RED_URL});

var TABLENAME = 'linkedinindustries',
	ID = 'id',
	GROUPS = "groups",
	DES = "description",
	CODE = "code";

function IndustriesDAO(options){
	if (options){
		dao = new pgDAO({pgURL:options.pgURL});
	}
}

IndustriesDAO.prototype.getAllIndustries = function(callback){
	var selectIndustriesDetails = {
		name:TABLENAME,
		distinct:false,
		attributes:[ID,GROUPS,DES,CODE]
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