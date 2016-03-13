
var spawn = require('child_process').spawn;

function run(imagePath, patternPath, destFolder, parameters, callback) {

    // let's try to avoid file colision ... hum hum
    var outFilePath = destFolder + '/outFile_asdgh234sd00jsmlsdfkl08350oijoensldfhg.jpg';

    // load parameters with defaults
    var imageSize = 100;
    var numberIterations = 300;

    if (parameters) {
        numberIterations = parameters.numberIterations || numberIterations;
        imageSize = parameters.imageSize || imageSize;
    }


    var ls = spawn('sh', ['./src/child-process.sh', imagePath, patternPath, outFilePath, imageSize, numberIterations]);

    ls.stdout.on('data', function(data) {
        console.log('stdout: ' + data);
    });

    ls.stderr.on('data', function(data) {
        console.log('stderr: ' + data);
    });

    ls.on('close', function(code) {
        console.log('child process exited with code ' + code);

        callback(outFilePath, code);
    });
}

// some testing
// run('output/package.json.blob2', 'output/package.json.blob1', 'output', {}, function(outFile, execCode) {console.log(outFile, execCode)});

module.exports = {
    run: run
};