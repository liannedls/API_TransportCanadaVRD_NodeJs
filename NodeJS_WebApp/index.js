const express = require('express')
const path = require('path')
const bodyParser= require('body-parser')
const multer = require('multer');
const request = require('request');
const formidable = require('formidable')
const fs = require('fs');
const PORT = process.env.PORT || 5000
var app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// SET STORAGE
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads')
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now())
  }
})

var upload = multer({ storage: storage })

function callAPI(dataUploaded, url, num){
  return new Promise(function(resolve, reject) {
    request( {
      url: url,
      method: "POST",
      json: dataUploaded}, (err, res, body) => {
        return resolve(body)
        console.log("Calling API "+ num)
    }).on('error', function (err) {
    console.log(err);
    });
  })
}

async function callAllAPI(res, dataUploaded, next){
  url = 'http://localhost:55696/api/v1/Vehicle'
  api1 = await callAPI(dataUploaded, url, 1)
  if(typeof api1 === 'undefined'){
    api1 = dataUploaded
  }
  //api2
  url = 'http://localhost:55698/api/v1/Vehicle'
  api2 = await callAPI(api1, url, 2)
  if(typeof api2 === 'undefined'){
    api2 = api1
  }
  //api3
  url = 'http://localhost:3000/api3_post'
  api3 = await callAPI(api2, url, 3)
  if(typeof api3 === 'undefined'){
    api3 = api2
  }
  global.values = api3

  res.redirect('/results')
  return false
}

express()
  .use(express.static('public'))
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  .get('/', (req, res) => res.render('pages/index'))
  .post('/uploadfile', upload.single('myFile'), (req, res, next) => {
      const file = req.file
      if (!file) {
        const error = new Error('Please upload a JSON file')
        error.httpStatusCode = 400
        return next(error)
      }

    fs.readFile('uploads/'+ file.filename, (err, data) => {
        if (err) throw err;
        let dataUploaded = JSON.parse(data);
        callAllAPI(res, dataUploaded, next)

      })
    })

    .get('/results', (req, res) => res.render('pages/results'))

    .get('/findByRecallNumber', function(req, res){
      search_val = req.query.search
      search_results = []
      for (x in values) {
        if (values[x].recallNumber == search_val) {
            search_results.push(values[x])
        }
      }
      res.send(search_results)
    })

    .get('/findByCategory', function(req, res){
      search_val = req.query.search
      search_results = []
      for (x in values) {
        if (values[x].CATEGORY_ETXT == search_val) {
            search_results.push(values[x])
        }
      }
        res.send(search_results)
    })

    .get('/findBySystemType', function(req, res){
      search_val = req.query.search
      search_results = []
      for (x in values) {
        if (values[x].SYSTEM_TYPE_ETXT == search_val) {
            search_results.push(values[x])
        }
      }
    res.send(search_results)
    })

  .listen(PORT, () => console.log(`Listening on ${ PORT }`))
