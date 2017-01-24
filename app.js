

var express = require('express')
var AWS = require('aws-sdk')
var fs = require('fs')
var s3 = new AWS.S3();

// For details and examples about AWS Node SDK,
// please see https://aws.amazon.com/sdk-for-node-js/

var myBucket = 'cs499ar';
var app = express()

// This is how your enable CORS for your web service
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

var fs = require('file-system');

fs.watch('tmp', function (event, filename) {
    if (event == "rename") {
        if (fs.existsSync("tmp/" + filename)) {
            uploadFileToS3(filename);
        } else {
            deleteFileToS3(filename);
        }
    }
    else if (event == "change") {
        uploadFileToS3(filename);
        console.log('filename change: ' + filename);
    }
});

app.get('/', function (req, res) {
    res.sendfile('index.html')
})

app.get('/list', function(req, res){
    var params = {
        Bucket: myBucket
    };
    s3.listObjects(params, 	function(err, data){
        for(var i = 0; i < data.Contents.length; i++) {
            data.Contents[i].Url = 'https://s3.amazonaws.com/' + data.Name + '/' + data.Contents[i].Key;
        }
        res.send(data.Contents);
    })
})


function uploadFileToS3(imageFilePath) {
    fs.readFile(imageFilePath, function (err, data) {
        params = {Bucket: myBucket, Key: imageFilePath, Body: data, ACL: "public-read"};
        s3.putObject(params, function(err, data) {
            if (err) {
                console.log(err)
            } else {
                console.log("Successfully uploaded data to " + myBucket, data);
            }
        });
    });
}

function deleteFileToS3(imageFilePath) {
    fs.readFile(imageFilePath, function (err, data) {
        params = {Bucket: myBucket, Key: imageFilePath};
        s3.deleteObject(params, function(err, data) {
            if (err) {
                console.log(err)
            } else {
                console.log("Successfully delete data ");
            }
        });
    });
}

app.listen(3000, function () {
    console.log('Example app listening on port 3000!')
})