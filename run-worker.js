// local imports
var jobQueue = require('./src/azure-queue.js');
var imageStore = require('./src/azure-blob-storage.js');
var jobLauncher = require('./src/deep-art-launcher.js');
var jobTable = require('./src/azure-table.js');

// node imports
var os = require('os');
var fs = require('fs');

rmdir = require('rimraf');

function processJob(jobID, error) {
    console.log('found new job:', jobID);

    jobTable.updateJobProperty(jobID, 'status', 'PROCESSING',
        function(error, result, response, job) {/* nothing to do here */
        jobTable.getJob(job.jobID, function(error, result, response, job){ console.log('job status is now: ' + job.status)})});

    // get the actual job metadata
    jobTable.getJob(jobID, function(error, result, response, job_) {

        var job = job_;

        // create temporary folder
        var destFolder = os.tmpdir() + '/' + job.jobID + '/';

        var finito = function(status, outputBlobName, message) {

            jobTable.updateJobProperty(job.jobID, 'status', status, function(error, result, response, job) {
                jobTable.updateJobProperty(job.jobID, 'outputBlobName', outputBlobName, function(error, result, response, job) {
                    jobTable.updateJobProperty(job.jobID, 'message', message, function(error, result, response, job) {/* nothing to do here */
                        jobTable.getJob(job.jobID, function(error, result, response, job_){ console.log('job is now: ', job_)})});
                });
            });


            // Remove temp files (we use rimraf to perform a recursive rm)
            rmdir(destFolder, function(err) {
                console.log(err);
            });

            // loop
            loop();
        };

        fs.mkdir(destFolder, function(err) {

            console.log('mkdir passed: ');

            // Download images locally from azure blobs into temporary file with jobID
            imageStore.downloadImages([job.imageBlobName, job.patternBlobName], destFolder, function(paths, errs, results, responses) {
                if (errs[0] || errs[1]) {
                    //console.log('---------', [job.imageBlobName, job.patternBlobName]);
                    finito('FAILED', null, JSON.stringify(errs));
                    return;
                }

                console.log('download passed: ');

                // Execute JOB
                jobLauncher.run(paths[0], paths[1], destFolder, job.parameters, function(outFile, execCode){
                    if (execCode != 0) {
                        finito('FAILED', null, 'exec errorcode: ' + execCode);
                        return;
                    }

                    console.log('job runner passed: ');

                    var uploadBlobName = job.jobID + ".out";

                    // Upload image to blobstore
                    imageStore.uploadImage(outFile, uploadBlobName, function(err, outputBlobName){
                        if (err) {
                            finito('FAILED', null, JSON.stringify(err));
                            return;
                        }

                        finito('SUCCESS', outputBlobName, null);

                    });

                });

            });

        });
    });
}


function loop() {
    jobQueue.fetchNextJob(processJob);
}

//start the loop()
loop();


setTimeout(function(){
    var job = {
        jobID: 'matt-test-job-01',
        imageBlobName: 'test1-matt',
        patternBlobName: 'test2-matt',
        status: 'WAITING',
        parameters: {},
    };

    console.log('adding job to queue', job.jobID);

    jobTable.updateJob(job, function(error, result, response) {

        jobQueue.pushJob(job.jobID, function(error, result) {
            //console.log(error, result);

            console.log('job added to queue', job.jobID);
        })

    });
}, 2500);