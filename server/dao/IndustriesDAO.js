var pgDAO = require('./index');
var dao = new pgDAO({pgURL:"postgres://raooddscbjubfm:_hRtPSh-P_d97Za496xD75SBCp@ec2-107-20-169-200.compute-1.amazonaws.com:5432/d1v8k0l98bmvg4"});

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