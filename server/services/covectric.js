//instantiate the model
var covectric = require('covectric');
var industryModel = new covectric.Model(),
industryModMap = {};

function Covectric(){

}

Covectric.prototype.constructor = Covectric;

Covectric.prototype.setIndustries = function(industryResults){
	//populate the industry vector space and weight tokens based on term frequency
	industryResults.forEach(function(t) {
		industryModel.upsertDocument(t.code, t.description, t.description);
	});
	industryModel.recomputeVectorBaseTokenWeights();
}

Covectric.prototype.searchIndustry = function(searchString){
	if (searchString.indexOf('/') > -1){
		searchString = searchString.replace('/',' or ');
	}
	return industryModel.search(searchString, 2);
}

Covectric.prototype.getIndustryModMap = function(){
	return industryModMap;
}

module.exports = Covectric;