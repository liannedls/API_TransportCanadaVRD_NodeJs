const express = require('express');
const app = express();
const port = 3000;
var bodyParser = require('body-parser')
const request = require('request');
const fs = require('fs');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(function (req, res, next) {
  next()
})

app.post('/api3_post', function (req, res) {

  all_data = req.body
  for(num in all_data){
    recall_num = all_data[num].RECALL_NUMBER_NUM

    request('https://data.tc.gc.ca/v1.3/api/eng/vehicle-recall-database/recall-summary/recall-number/'+recall_num+'?format=json',
    { json: true }, (err, res, body) => {
      if (err) { return console.log(err); }
      data = JSON.parse(JSON.stringify(body.ResultSet[0]));
      function findByKey(key, value) {
          return (item, i) => item[key] === value
      }

      let findParams1 = findByKey('Name', 'SYSTEM_TYPE_ETXT')
      let index1 = data.findIndex(findParams1)
      system_TYPE_ETXT = data[index1].Value.Literal
      let findParams2 = findByKey('Name', 'SYSTEM_TYPE_FTXT')
      let index2 = data.findIndex(findParams2)
      system_TYPE_FTXT = data[index2].Value.Literal
      //append to all_data
      all_data[num].SYSTEM_TYPE_ETXT = system_TYPE_ETXT
      all_data[num].SYSTEM_TYPE_FTXT = system_TYPE_FTXT

      //GET new data
      app.get('/api3_get', function (req,res) {
          res.send(all_data);
      });

      //output json file
      var jsonContent = JSON.stringify(all_data);
      fs.writeFile("api3_data.json", jsonContent, 'utf8', function (err) {
          if (err) {
              console.log("An error occured while writing JSON Object to File.");
              return console.log(err);
          }
          console.log("JSON file has been saved.");
      });
    });
}})

app.listen(port, () => console.log(`Hello world app listening on port ${port}!`))
//test
