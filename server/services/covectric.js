//instantiate the model
var covectric = require('covectric');
var industryModel = new covectric.Model();

function Covectric(){

}

Covectric.prototype.constructor = Covectric;

Covectric.prototype.setIndustries = function(industryResults){
	var industryVectors = [];
	for (var i in industryResults){
		var result = industryResults[i];
		industryVectors.push(result.description);
	}
	//populate the industry vector space and weight tokens based on term frequency
	var id = 1;
	industryVectors.forEach(function(t) {
	    industryModel.upsertDocument(id++, t, t);
	});
	industryModel.recomputeVectorBaseTokenWeights();
}

Covectric.prototype.searchIndustry = function(searchString){
	return industryModel.search(searchString, 5);
}

module.exports = Covectric;