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

app.post('/api3_post', async (req, res)=> {
  const all_data = req.body
  const jsonContent = await doResponse(all_data)
  await fs.writeFile("api3_data.json", jsonContent, 'utf8', function (err) {
      if (err) {
          console.log("An error occured while writing JSON Object to File.");
          return console.log(err);
      }
      console.log("JSON file has been saved.");
      return jsonContent
  })
  console.log(jsonContent)
  return res.send(jsonContent)
})

function callRequest(recall_num, all_data){
  return new Promise(function(resolve, reject) {
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
  all_data[num].SYSTEM_TYPE_ETXT = system_TYPE_ETXT
  all_data[num].SYSTEM_TYPE_FTXT = system_TYPE_FTXT
  resolve(all_data)
})
})
}

function doResponse(all_data){
  return new Promise(async function(resolve, reject) {
    for(num in all_data){
      recall_num = all_data[num].recallNumber
      console.log(recall_num)
      await callRequest(recall_num, all_data)
    }
    //output json file
    var jsonContent = JSON.stringify(all_data);
    resolve(jsonContent)
  })
}

app.listen(port, () => console.log(`Hello world app listening on port ${port}!`))
//te
