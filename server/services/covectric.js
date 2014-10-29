//instantiate the model
var covectric = require('covectric');
var industryModel = new covectric.Model(),
industryModMap = {};

function Covectric(){

}

Covectric.prototype.constructor = Covectric;

Covectric.prototype.setIndustries = function(industryResults){
	//populate the industry vector space and weight tokens based on term frequency
	var id = 1;
	industryResults.forEach(function(t) {
		var description = t.description;
		if (description.indexOf('/') > -1){
			var replacedDes = description.replace('/',' / ');
			industryModMap[replaceDes] = description;
			industryModel.upsertDocument(t.id, replaceDes, replaceDes);
		}else{
			industryModel.upsertDocument(t.id, t.description, t.description);
		}
	});
	industryModel.recomputeVectorBaseTokenWeights();
}

Covectric.prototype.searchIndustry = function(searchString){
	return industryModel.search(searchString, 2);
}

Covectric.prototype.getIndustryModMap = function(){
	return industryModMap;
}

module.exports = Covectric;