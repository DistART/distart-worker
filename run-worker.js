// local imports
var jobQueue = require('./src/azure-queue.js');
var imageStore = require('./src/azure-blob-storage.js');
var jobLauncher = require('./src/deep-art-launcher.js');

// node imports
var os = require('os');
var fs = require('fs');

rmdir = require('rimraf');

function processJob(job, error) {
    console.log('starting job:', job);

    // create temporary folder
    var destFolder = os.tmpdir() + '/' + job.jobID + '/';

    var finito = function(status, outputURL, message) {

        console.log('sending the finito job', status, outputURL, message);

        // Modify job and switch queue
        jobQueue.jobFinished(job, status, outputURL, message, function(err, result) {
            console.log(err, result);
        });

        // Remove temp files (we use rimraf to perform a recursive rm)
        rmdir(destFolder, function(err) {
            console.log(err);
        });

        // loop
        loop();
    };

    fs.mkdir(destFolder, function(err) {

        console.log('mkdir passed: ', err);

        // Download images locally from azure blobs into temporary file with jobID
        imageStore.downloadImages([job.imageBlobName, job.patternBlobName], destFolder, function(paths, errs, results, responses) {
            if (errs[0] || errs[1]) {
                console.log('---------', [job.imageBlobName, job.patternBlobName]);
                finito('FAILED', null, JSON.stringify(errs));
                return;
            }

            console.log('download passed: ', errs, results, responses);

            // Execute JOB
            jobLauncher.run(paths[0], paths[1], destFolder, job.parameters, function(outFile, execCode){
                if (execCode != 0) {
                    finito('FAILED', null, 'exec errorcode: ' + execCode);
                    return;
                }

                console.log('job runner passed: ', outFile, execCode);

                var uploadBlobName = job.jobID + ".out";

                // Upload image to blobstore
                imageStore.uploadImage(outFile, uploadBlobName, function(err, outputURL){
                    if (err) {
                        finito('FAILED', null, JSON.stringify(err));
                        return;
                    }

                    finito('SUCCESS', outputURL, null);

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