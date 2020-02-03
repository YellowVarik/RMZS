const https = require('https')
const fs = require('fs')

var mpURL = "api.myparcel.nl";
var mpKey = "914bb634d3cf4a01ba809dd4b121e33f9d2ea50a";

getMyParcelData();

function getMyParcelData(){
  let keyBuffer = new Buffer.from(mpKey);
  let base64Key = keyBuffer.toString("base64");

  
  var data = "";

  var options = {
    hostname: mpURL,
    path: "/shipments",
    method: "GET",
    headers:{
      "Host": "api.myparcel.nl",
      "Authorization": "base " + base64Key,
      "Content-Type": "application/json;charset=utf-8",
      "Connection": "keep-alive",
      "Pragma": "no-cache",
      "Cache-Control": "no-cache",
      "Upgrade-Insecure-Requests": 1,
      "Accept-Encoding": "gzip, deflate, sdch, br",
      "User-Agent": "CustomApiCall/2"
    }
  }

  var request = https.request(options, function(result){
    result.on('data', (d) => {
      data += d;
    });
    result.on("end", () => {
      console.log(JSON.parse(data).data.shipments);
      fs.writeFile("data/zendingen.json", data, (e) => {
        if(e) throw e;
        console.log("Data opgeslagen!");
      })
    })
  })
  request.on('error', (e) => {
    console.error(e);
  });
  request.end();
  
  
}