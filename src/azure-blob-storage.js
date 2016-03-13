
var INPUT_CONTAINER = 'distart-input';
var OUTPUT_CONTAINER = 'distart-output';

var azure = require('azure-storage');


var blobSvc = azure.createBlobService();

function maybeCreateContainer(container) {
    blobSvc.createContainerIfNotExists(container, function(error, result, response){
        if(!error){
            // Container exists and allows
            // anonymous read access to blob
            // content and metadata within this container
        }

        console.log('container ' + container + ' ' + (result? 'created': 'existing'));
    });
};

// sort of a touch command, to make sure queues exist
maybeCreateContainer(INPUT_CONTAINER);
maybeCreateContainer(OUTPUT_CONTAINER);

function uploadFile_(localPath, blobName, container, callback) {
    blobSvc.createBlockBlobFromLocalFile(container, blobName, localPath, function(error, result, response){
        if(!error){
            // file uploaded
        }

        callback(error, result, response);
    });
};

function uploadImage(localImagePath, blobName, callback) {
    uploadFile_(localImagePath, blobName, OUTPUT_CONTAINER, function(error, result, response) {

        callback(error, blobName);
    });
}


function downloadImage_(blobName, localDir, callback) {
    // we add jpg, just to be sure
    var localPath = localDir + '/' + blobName + '.jpg';

    blobSvc.getBlobToLocalFile(INPUT_CONTAINER, blobName, localPath, function(error, result, response) {
        callback(localPath, error, result, response);
    })
};


function downloadImages(blobNames, localDir, callback) {
    // we assume for now there is only two images in blobNames (bcause HACKathon)
    downloadImage_(blobNames[0], localDir, function(localPath1, error1, result1, response1) {
        downloadImage_(blobNames[1], localDir, function(localPath2, error2, result2, response2) {
            callback([localPath1, localPath2], [error1, error2], [result1, result2], [response1, response2]);
        })
    })
};


// some testing
//uploadFile_('package.json', 'package.json.blob1', OUTPUT_CONTAINER, function (error, result, response) {
//    console.log(error, result, response);
//    uploadFile_('package.json', 'package.json.blob2', OUTPUT_CONTAINER, function (error, result, response) {
//        console.log(error, result, response);
//        downloadImages(['package.json.blob1', 'package.json.blob2'], './output/', function(errors, results, responses) {
//            console.log(errors, results, responses);
//        });
//    });
//});

//uploadFile_('output/test/file1.txt', 'test1-matt', INPUT_CONTAINER, function(error, result, response) {/*console.log(error, result, response)*/})
//uploadFile_('output/test/file2.txt', 'test2-matt', INPUT_CONTAINER, function(error, result, response) {/*console.log(error, result, response)*/})

module.exports = {
    uploadImage: uploadImage,
    downloadImages: downloadImages,
};
