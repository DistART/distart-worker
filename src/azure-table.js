
var GLOBAL_TABLE = 'distarttable';
var GLOBAL_PARTITION = 'distartjobpartition';

var azure = require('azure-storage');

var tableSvc = azure.createTableService();

tableSvc.createTableIfNotExists(GLOBAL_TABLE, function(error, result, response){
    tableSvc.createTableIfNotExists(GLOBAL_TABLE, function(error, result, response){
        if(!error){
            // Queue created or exists
        }

        console.log('table ' + GLOBAL_TABLE + ' ' + (result? 'created': 'existing'));
    });
});


// also used to create a JOB
function updateJob(job, callback) {
    //https://azure.microsoft.com/en-us/documentation/articles/storage-nodejs-how-to-use-table-storage/
    var entGen = azure.TableUtilities.entityGenerator;
    var jobEntity = {
        PartitionKey: entGen.String(GLOBAL_PARTITION),
        RowKey: entGen.String(job.jobID),
        jobID: entGen.String(job.jobID),
        parameters: entGen.String(JSON.stringify(job.parameters ? job.parameters : {})),
        imageBlobName: entGen.String(job.imageBlobName),
        patternBlobName: entGen.String(job.patternBlobName),
        status: entGen.String(job.status),
        outputBlobName: entGen.String(job.outputBlobName),
        message: entGen.String(job.message)
    };

    tableSvc.insertOrReplaceEntity(GLOBAL_TABLE, jobEntity, function (error, result, response) {
        callback(error, result, response);
    })
}

function getJob(jobID, callback) {
    tableSvc.retrieveEntity(GLOBAL_TABLE, GLOBAL_PARTITION, jobID, function(error, result, response){
        var job = null;
        if (!error) {
            var b = response.body;
            job = {
                jobID: b.jobID,
                parameters: JSON.parse(b.parameters),
                imageBlobName: b.imageBlobName,
                patternBlobName: b.patternBlobName,
                status: b.status,
                outputBlobName: b.outputBlobName,
                message: b.message
            };
        }
        callback(error, result, response, job);
    });
}

function updateJobProperty(jobID, propertyName, propertyValue, callback) {
    getJob(jobID, function(error, result, response, job) {
        if (job) {

            job[propertyName] = propertyValue;

            updateJob(job, function(error, result, response) {
                callback(error, result, response, job);
            })
        } else {
            callback(error, result, response, job);
        }
    })
}

// some tests
//updateJob({
//    jobID: 'matt-test-job-01',
//    imageBlobName: 'test1-matt',
//    patternBlobName: 'test2-matt',
//    parameters: {},
//}, function(error, result, response) {
//    console.log(error, result, response);
//
//    getJob('matt-test-job-01', function(error, result, response, job) {
//        console.log('table contains : ', job);
//
//        updateJobProperty(job.jobID, 'imageBlobName', 'updated-test-val', function(error, result, response, job) {
//            console.log('updated job: ', job);
//
//            getJob('matt-test-job-01', function(error, result, response, job) {
//                console.log('table contains after update : ', job);
//            });
//        })
//    });
//});

module.exports = {
    updateJob: updateJob,
    getJob: getJob,
    updateJobProperty: updateJobProperty
};