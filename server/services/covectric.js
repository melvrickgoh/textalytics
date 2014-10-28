//instantiate the model
var covectric = require('.../covectric');
var model = new covectric.Model();

function Covectric(options){
	//populate the vector space and weight tokens based on term frequency
	var id = 1;
	['hello','hi','hi there','hey','hi to you'].forEach(function(t) {
		model.upsertDocument(id++, t, t);
	});
	model.recomputeVectorBaseTokenWeights();

	//search the vector space

	var results = model.search("hi bob", 3);
	console.log("Search Results:", results);
}

Covectric.prototype.searchIndustry = function(){

}