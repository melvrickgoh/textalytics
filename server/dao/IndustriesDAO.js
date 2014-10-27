var pgDAO = require('./index');
var dao = new pgDAO({pgURL:"postgresql://lxkdnxglxsqpfd:i652h8UFdyfV-hRnADKlJDBWit@ec2-23-21-170-57.compute-1.amazonaws.com:5432/d2t3trkm3dvedc"});

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