var express = require('express'); 
var app = express(); 
var bodyParser = require('body-parser');
var multer = require('multer');
var fs   = require('fs');

var myFileName;
var key = "AIzaSyBxFRHU5etlSSUGaSNm62Agv9Hn0gA_AR4";
var request = require('request');
var mongoose = require('mongoose');                 // mongoose for mongodb
var database = require('./config/database');            // load the database config
var Imgobj = mongoose.model('ihack', {
    labelAnnotations : [{ description: String,  score: Number}],
    bytecode: String,
    imagePropertiesAnnotation: {r: Number, g: Number, b: Number}
});

mongoose.connect(database.localUrl);

// function yoyo (res) {
//      var imageFile = fs.readFileSync('./uploads/'+myFileName);
//      var encoded = Buffer.from(imageFile).toString('base64');

//      console.log(encoded);
//     fs.unlinkSync('./uploads/'+myFileName);
//  }
// Convert the image data to a Buffer and base64 encode it.

function find(label) {

    Imgobj.find({labelAnnotations: {$elemMatch: {description: "cat", description: "laptop"}}}, function (err, todo) {
        if (err) {
            // res.send(err);
            console.log(err);
        }
        console.log(todo);
        // res.json(todo); // return all todo in JSON format
    });
}

function getImgobjs(res) {
    Imgobj.find(function (err, todo) {
        if (err) {
            res.send(err);
        }
        console.log(todo);
        // res.json(todo); // return all todo in JSON format
    });
};

function addImg(data, bytecode) {
    Imgobj.create({
        labelAnnotations : data.labelAnnotations,
        bytecode: bytecode,
        imagePropertiesAnnotation: {
            r: data.imagePropertiesAnnotation.dominantColors.colors[0].color.red,
            g: data.imagePropertiesAnnotation.dominantColors.colors[0].color.green,
            b: data.imagePropertiesAnnotation.dominantColors.colors[0].color.blue
        }        
        }, function (err, todo) {
            if (err)
                res.send(err);

            // get and return all the todo after you create another
        });
}


    app.use(function(req, res, next) { //allow cross origin requests
        res.setHeader("Access-Control-Allow-Methods", "POST, PUT, OPTIONS, DELETE, GET");
        res.header("Access-Control-Allow-Origin", "http://localhost");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        next();
    });

    /** Serving from the same express Server
    No cors required */
    app.use(express.static('../client'));
    app.use(bodyParser.json());  

    var storage = multer.diskStorage({ //multers disk storage settings
        destination: function (req, file, cb) {
            cb(null, './uploads/');
        },
        filename: function (req, file, cb) {
            var datetimestamp = Date.now();
            myFileName = file.fieldname + '-' + datetimestamp + '.' + file.originalname.split('.')[file.originalname.split('.').length -1];
            cb(null, file.fieldname + '-' + datetimestamp + '.' + file.originalname.split('.')[file.originalname.split('.').length -1]);
        }
    });

    var upload = multer({ //multer settings
                    storage: storage
                }).single('file');

    /** API path that will upload the files */
    app.post('/upload', function(req, res) {
        upload(req,res,function(err){
            if(err){
                 res.json({error_code:1,err_desc:err});
                 return;
            }
            var imageFile = fs.readFileSync('./uploads/'+myFileName);
                 var encoded = Buffer.from(imageFile).toString('base64');

                 // to delete file from storage
                // fs.unlinkSync('./uploads/'+myFileName);
                var myJSONObject = {
                    "requests": [
                      {
                        "image": {
                          "content": encoded
                        },
                        "features": [
                            {"type":"LABEL_DETECTION", "maxResults":10},
                            {"type":"IMAGE_PROPERTIES", "maxResults":1} 
                        ]
                      }
                    ]
                  };
                request({
                    url: "https://vision.googleapis.com/v1/images:annotate?key="+key,
                    method: "POST",
                    json: true,   // <--Very important!!!
                    body: myJSONObject
                }, function (error, response, body){
                    console.log(response.body.responses);
                    // addImg(response.body.responses[0], encoded);
                    var imgdata = {
                            labelAnnotations : response.body.responses[0].labelAnnotations,
                            bytecode: encoded,
                            imagePropertiesAnnotation: {
                                r: response.body.responses[0].imagePropertiesAnnotation.dominantColors.colors[0].color.red,
                                g: response.body.responses[0].imagePropertiesAnnotation.dominantColors.colors[0].color.green,
                                b: response.body.responses[0].imagePropertiesAnnotation.dominantColors.colors[0].color.blue
                            }
                    };
                    Imgobj.find({labelAnnotations: {$elemMatch: {description: imgdata.labelAnnotations[0].description}}}, function (err, imgSearchData) {
                        if (err) {
                            res.send(err);
                            return;
                        }
                        // if (!imgSearchData.length) {
                            addImg(response.body.responses[0], encoded);    
                        // }
                        
                        res.json({imgdata: imgdata, imgSearchData: imgSearchData}); // return all todo in JSON format
                    });
                    // find.call(response)
                    // res.json({result: {
                    //     labelAnnotations : response.body.responses[0].labelAnnotations,
                    //     bytecode: encoded,
                    //     imagePropertiesAnnotation: {
                    //         r: response.body.responses[0].imagePropertiesAnnotation.dominantColors.colors[0].color.red,
                    //         g: response.body.responses[0].imagePropertiesAnnotation.dominantColors.colors[0].color.green,
                    //         b: response.body.responses[0].imagePropertiesAnnotation.dominantColors.colors[0].color.blue
                    //     }
                    // }});
                });
                    });
    });

    app.listen('3000', function(){
        console.log('running on 3000...');
    });