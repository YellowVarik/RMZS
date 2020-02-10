const https = require('https')
const fs = require('fs')

//jQuery moet op een andere manier worden toegevoegd
window.$ = window.jQuery = require('./js/jquery-3.4.1.min.js')


var mpURL = "api.myparcel.nl";

//De key moet worden opgrvraagd door de gebruiker in hun MyParcel account
var mpKey = "18b49878b83c8fdfd1a67b75909eeedaacd17f13";

var loadScreen = document.createElement('img');
loadScreen.src = './img/loading.gif';
loadScreen.id = 'loading';

getMyParcelData();

function getMyParcelData(){
  $("#myparcel").append(loadScreen);
  
  //De key moet met base64 worden versleuteld
  let keyBuffer = new Buffer.from(mpKey);
  let base64Key = keyBuffer.toString("base64");

  var data = "";


  //Deze opties zijn standaard voor de API en komen van de documentatie op https://myparcelnl.github.io/api
  var options = {
    hostname: mpURL,
    path: "/shipments",
    method: "GET",
    headers:{
      "Host": mpURL,
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
      //De tussentijdse data wordt toegevoegd aan een variabele
      data += d;
    });
    result.on("end", () => {
        //De data wordt verwerkt
        displayMPInfo(data);
        //De data wordt opgeslagen in een bestand
        fs.writeFile("data/zendingen.json", data, (e) => {
            if(e) throw e;
            console.log("Data opgeslagen!");
        })
    })
  })
  request.on('error', (e) => {
    console.error("KON DATA VAN MYPARCEL NIET OPHALEN \n" + e);

    //Als er geen data kon worden opgehaald wordt het uit een bestand gehaald
    if(fs.existsSync("./data/zendingen.json")){
      fs.readFile("data/zendingen.json", function(err, data){
        displayMPInfo(data);
      });      
    }
    else{
      let error = "<p>Kon data niet vinden</p>";
      $("#myparcel").append(error);
    }
  });
  request.end();
  
  
}

function displayMPInfo(data){
  let parsedData = JSON.parse(data);
        let count = parsedData.data.results;
        let zending = parsedData.data.shipments;

        //Elke zending wordt apart weergegeven
        for(var i = 0; i < count; i++){
          let row = document.createElement('tr');
          let name = document.createElement('td');
          name.innerHTML = zending[i].recipient.person;

          let postcode = document.createElement('td');
          postcode.innerHTML = zending[i].recipient.postal_code;

          let adress = document.createElement('td');
          adress.innerHTML = zending[i].recipient.street + " " + zending[i].recipient.number + " " + zending[i].recipient.city;

          let email = document.createElement('td');
          email.innerHTML = (zending[i].recipient.email !== "") ? zending[i].recipient.email : "-";

          let telefoon = document.createElement('td');
          telefoon.innerHTML = (zending[i].recipient.phone !== "") ? zending[i].recipient.phone : "-";


          
          row.append(name, postcode, adress, email, telefoon);
          $("#myparcel").find("table")[0].append(row);
        }
        $('#loading').remove();
}