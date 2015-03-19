const Download = require('download'),
DownloadHTTP = require('download-http');

var gSvcs;

function DownloaderService(options){
	if (options) {
		gSvcs = options.GoogleServices;
	}
}

DownloaderService.prototype.constructor = DownloaderService;

DownloaderService.prototype.downloadServiceFile = function(fileId,downloadCallback){
	gSvcs.getServerOCRFileMetadata(fileId,function(err,results){
		if (err) {
			err['error'] = true;
			err['error_message'] = 'Error in retrieving file metadata';
			downloadCallback(false,err);
			return;
		}

		var textLink = results['exportLinks']['text/html'];

		var download = new Download({extract: true, strip: 1, mode: '755'})
			.rename(results['id']+'.html')
	    .get(textLink)
	    .dest('downloads');
		 
		download.run(function (err, files) {
	    if (err) {
	    	err['error'] = true;
				err['error_message'] = 'Error in downloading to server html file';
	      downloadCallback(false,err);
	      return;
	    }
	    downloadCallback(true,files);
		});
	});
}

module.exports = DownloaderService;