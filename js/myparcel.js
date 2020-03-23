const https = require('https')
const electron = require('electron')
const pdfWindow = require('electron-pdf-window')
const lightspeed = require(__dirname + '/js/lightspeed')

//jQuery moet op een andere manier worden toegevoegd
window.$ = window.jQuery = require('./js/jquery-3.4.1.min.js')


var mpURL = "api.myparcel.nl";

//De key moet worden opgrvraagd door de gebruiker in hun MyParcel account
var base64Key = window.localStorage.getItem('mpKey');

var loadScreen = $(`
<div id='loading' class="sk-circle">
<div class="sk-circle1 sk-child"></div>
<div class="sk-circle2 sk-child"></div>
<div class="sk-circle3 sk-child"></div>
<div class="sk-circle4 sk-child"></div>
<div class="sk-circle5 sk-child"></div>
<div class="sk-circle6 sk-child"></div>
<div class="sk-circle7 sk-child"></div>
<div class="sk-circle8 sk-child"></div>
<div class="sk-circle9 sk-child"></div>
<div class="sk-circle10 sk-child"></div>
<div class="sk-circle11 sk-child"></div>
<div class="sk-circle12 sk-child"></div>
</div>`)

var gesorteerd = null;
var typeFilter = null;
var statusFilter = null;
var zendingen = [];
var selectedParcels = [];

var arrowUp = String.fromCharCode(9650);
var arrowDown = String.fromCharCode(9660);

getMyParcelData();

function search(){
  var input = document.getElementById("searchBox");
  var query = input.value.toLowerCase();

  let tr = $('#zendingen').find('tr');
  if(tr.length > 0){
    for (let i = 0; i < tr.length; i++){
      tr[i].remove();
    }
  }

  for(let i = 0; i < zendingen.length; i++){
    if(zendingen[i].kenmerk.toLowerCase().includes(query) || zendingen[i].naam.toLowerCase().includes(query) || zendingen[i].stad.toLowerCase().includes(query) || zendingen[i].straat.toLowerCase().includes(query) || zendingen[i].postcode.toLowerCase().includes(query) || zendingen[i].email.toLowerCase().includes(query)){
      zendingen[i].show($('#zendingen'));
    }
  }
}

function filter(category, value, element){

  let tr = $('#zendingen').find('tr');
  if(tr.length > 0){
    for (let i = 0; i < tr.length; i++){
      tr[i].remove();
    }
  }

  switch(category){
    case 'Status':
      for(let i = 0; i < zendingen.length; i++){
        if(category == value){
          zendingen[i].show($('#zendingen'));
        }
        else if(typeFilter !== null){
          if(zendingen[i].status == value && zendingen[i].type == typeFilter){
            zendingen[i].show($('#zendingen'));
          }
        }
        else{
          if(zendingen[i].status == value){
            zendingen[i].show($('#zendingen'));
          }
        }
      }

      if(category == value){
        $('#statusFilter').find('.filterTitle').eq(0).text('Status')
        statusFilter = null;
      }
      else if(element !== null){
        $('#statusFilter').find('.filterTitle').eq(0).text(element.innerHTML);
        statusFilter = value;
      }
      
      break;
    case 'Type':
      for(let i = 0; i < zendingen.length; i++){
        if(category == value){
          zendingen[i].show($('#zendingen'));
        }
        else if(statusFilter !== null){
          if(zendingen[i].type == value && zendingen[i].status == statusFilter){
            zendingen[i].show($('#zendingen'));
          }
        }
        else{
          if(zendingen[i].type == value){
            zendingen[i].show($('#zendingen'));
          }
        }
      }

      if(category == value){
        $('#typeFilter').find('.filterTitle').eq(0).text('Type')
        typeFilter = null;
      }
      else if(element !== null){
        $('#typeFilter').find('.filterTitle').eq(0).text(element.innerHTML);
        typeFilter = value;
      }
      break;
      
  }


}

function printSelected(parcels){
  var selectedOrders = [];
  var selectedShipments = [];
  var verzendLabels = [];
  for(var i = 0; i < parcels.length; i++){
    for(x = 0; x < zendingen.length; x++){
      if(zendingen[x].id == parcels[i]){
        if(zendingen[x].lightspeedOrder != null){
          selectedOrders.push(zendingen[x].lightspeedOrder);
          selectedShipments.push(zendingen[x].lightspeedShipment);
        } else{
          verzendLabels.push(zendingen[x].id);
        }
      }
    }
  }

  console.log({selectedOrders, selectedShipments, verzendLabels})
  if(selectedOrders.length > 0){
    lightspeed.getOrderVerzendLabel(selectedOrders, selectedShipments);
  }
  if(verzendLabels.length > 0){
    getPDF(verzendLabels);
  }
}

function getPDF(id){
  let data = '';
  let requestId = id;
  let fileName = id;
  if(id instanceof Array){
    if(id.length == 0){
      console.error('GEEN ZENDINGEN GESELECTEERD');
      return;
    }

    fileName = `${id[0]} - ${id[id.length-1]}`

    for(let i = 0; i < id.length; i++){
      if(i == 0){
        requestId = id[i];
      }
      else{
        requestId += `;${id[i]}`;
      }
    }
  }

  var options = {
    hostname: mpURL,
    path: `/shipment_labels/${requestId}`,
    method: "GET",
    encoding: null,
    headers:{
      "Host": mpURL,
      "Authorization": `base ${base64Key}`,
      "Content-Type": "application/pdf",
      "Upgrade-Insecure-Requests": 1,
      "User-Agent": "CustomApiCall/2",
      "Accept": "application/pdf",
    }
  }
  if(!fs.existsSync("./data")){
    fs.mkdirSync("./data");
  }
  var pdfFile = fs.createWriteStream(`data/label${fileName}.pdf`)
  var request = https.request(options, function(result){
    result.on('data', (d) => {
      data += d;
      pdfFile.write(d);
    })

    result.on("end", () => {
      pdfFile.end();
      console.log(`label opgeslagen in data/label${fileName}.pdf`)
      openPDF(__dirname + `/data/label${fileName}.pdf`);
    })
  })

  request.on('error', (e) => {
    console.error("KON LABEL NIET OPHALEN \n" + e);
  });
  request.end();
}

async function getMyParcelData(){
  loadScreen.appendTo($('.main_content')[0]);
  var data = "";

  zendingen = [];


  //Deze opties zijn standaard voor de API en komen van de documentatie op https://myparcelnl.github.io/api
  var options = {
    hostname: mpURL,
    path: "/shipments",
    method: "GET",
    headers:{
      "Host": mpURL,
      "Authorization": `base ${base64Key}`,
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
        if(!fs.existsSync("./data")){
          fs.mkdirSync("./data");
        }
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

async function displayMPInfo(data){
  $('.sortBtn').each(function(){
    $(this).text($(this).text().replace(arrowUp, ''))
    $(this).text($(this).text().replace(arrowDown, ''))
  });

  

  selectedParcels = [];
  $('#myparcel').find(".checkmark").eq(0).removeClass('fa-check-square').addClass("fa-square");
  
  gesorteerd = null;
  let tr = $('#zendingen').find('tr');
  if(tr.length > 0){
    for (let i = 0; i < tr.length; i++){
      tr[i].remove();
    }
  }
  
  let parsedData = JSON.parse(data);
  console.log(parsedData)
  let count = parsedData.data.shipments.length;
  let zending = parsedData.data.shipments;

  var {shipments, orders, products} = await lightspeed.getLightspeedData();
  console.log(zending);
  //Elke zending wordt apart weergegeven
  for(var i = 0; i < count; i++){
    console.log(i)
    let lightspeedOrder, lightspeedShipment = null;
    let klant = zending[i].recipient;
    if(zending[i].options.label_description.includes('ORD')){
      for(let x = 0; x < orders.length; x++){
        if(zending[i].options.label_description == orders[x].number){
          lightspeedOrder = orders[x];
          lightspeedShipment = shipments[x];
        }
      }
    }
    let shipment = new Shipment(zending[i].id, zending[i].options.package_type, (zending[i].options.label_description.includes('retour'))?5:zending[i].status, zending[i].options.label_description, zending[i].barcode, klant.person, klant.postal_code, klant.street, klant.number + ((klant.number_suffix != null) ? klant.number_suffix : ''), klant.city, klant.cc, klant.email, klant.phone, new Date(zending[i].modified), lightspeedOrder, lightspeedShipment);
    zendingen[i] = shipment;
  }
  zendingen.forEach(function (item){
    item.show($('#zendingen'));
  })
  $('#loading').remove();
}

function redisplayMPInfo(sortingMethod){

  $('.sortBtn').each(function(){
    $(this).text($(this).text().replace(arrowUp, ''))
    $(this).text($(this).text().replace(arrowDown, ''))
  });

  let tr = $('#zendingen').find('tr');
  if(tr.length > 0){
    for (let i = 0; i < tr.length; i++){
      tr[i].remove();
    }
  }

  zendingen.sort(sortingMethod);
  for(let i = 0; i < zendingen.length; i++){
    zendingen[i].show($('#zendingen'));
  }

  search();
  if(statusFilter !== null){
    filter('Status', statusFilter, null);
  }
  else if(typeFilter !== null){
    filter('Type', typeFilter, null);
  }
}

function openPDF(filePath){
  let win = new electron.remote.BrowserWindow({
    width: 1200,
    height: 800
  })
  pdfWindow.addSupport(win);
  win.loadURL(filePath)
}

function selectParcel(id){
  let selected = false;
  let i = null;
  selectedParcels.forEach((parcel, index) => {
    if(parcel==id){
      selected = true;
      i = index;
    }
    
  })

  if(selected){
    if($('#myparcel').find('tr').length - 1 == selectedParcels.length){
      $('#myparcel').find(".checkmark").eq(0).removeClass('fa-check-square').addClass("fa-square");
    }
    selectedParcels.splice(i, 1);
    $(`.checkmark${id}`).removeClass("fa-check-square").addClass("fa-square");
  }
  else{
    selectedParcels.push(id);
    $(`.checkmark${id}`).removeClass("fa-square").addClass("fa-check-square");
    if($('#myparcel').find('tr').length - 1 == selectedParcels.length){
      $('#myparcel').find(".checkmark").eq(0).removeClass('fa-square').addClass("fa-check-square");
    }
  }
}

function TrackTrace(id){
  let data = '';
  var options = {
    hostname: mpURL,
    path: `/tracktraces/${id}`,
    method: "GET",
    headers:{
      "Host": mpURL,
      "Authorization": `base ${base64Key}`,
      "Content-Type": "application/json;charset=utf-8",
      "Connection": "keep-alive",
      "Pragma": "no-cache",
      "Cache-Control": "no-cache",
      "Upgrade-Insecure-Requests": 1,
      "Accept-Encoding": "gzip, deflate, sdch, br",
      "User-Agent": "CustomApiCall/2"
    }
  }

  var request = https.request(options, (response)=>{
    response.on('data', (d) => {
      data += d;
    })

    response.on('end', ()=>{
      console.log(data);
    })
  })

  request.end();
}

function selectAllParcels(){
  let rows = $('#myparcel').find('tr');
  parcelLength = selectedParcels.length;
  selectedParcels = [];

  if(rows.length - 1 > parcelLength){
    for(let i = 0; i < rows.length; i++){
      if(rows[i].getAttribute('data-id') != null){
        selectedParcels.push(rows[i].getAttribute("data-id"));
      }
    }

    $('#myparcel').find(".checkmark").removeClass('fa-square').addClass("fa-check-square");
  }
  else{
    $('#myparcel').find(".checkmark").removeClass('fa-check-square').addClass("fa-square");
  }
}

function deleteShipment(id){
  var data = '';
  console.log(mpURL + `/shipments/${id}`)
  var options = {
    hostname: mpURL,
    path: `/shipments/${id}`,
    method: "DELETE",
    headers:{
      "Host": mpURL,
      "Authorization": `base ${base64Key}`,
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
      console.log(data);
    })
  })
  request.on('error', (e) => {
    console.error(`KON ZENDING MET ID ${id} NIET VERWIJDEREN\n` + e);
  });
  request.end();

  setTimeout(getMyParcelData, 500);
}

function getTrackTrace(barcode, postcode){
  let win = new electron.remote.BrowserWindow({
    width: 1200,
    height: 800,
    autoHideMenuBar: true,
    icon: './img/icon.png',
  })
  win.loadURL(`https://jouw.postnl.nl/track-and-trace/${barcode}-NL-${postcode}`);
}

function sortDatum(){
  let btn = $('#datumButton');


  if(gesorteerd == "DNO"){
    redisplayMPInfo(datumOudNaarNieuw);
    btn.text(btn.text() + arrowUp);
    gesorteerd = "DON";
  }
  else{
    redisplayMPInfo(datumNieuwNaarOud);
    btn.text(btn.text() + arrowDown);
    gesorteerd = "DNO";
  }
}

function sortNaam(){
  let btn = $('#naamButton');


  if(gesorteerd == "NAL"){
    redisplayMPInfo(naamOmgekeerd);
    btn.text(btn.text() + arrowUp);
    gesorteerd = "NOM";
  }
  else{
    redisplayMPInfo(naamAlfabetisch);
    btn.text(btn.text() + arrowDown);
    gesorteerd = "NAL";
  }
}

function sortStad(){
  let btn = $('#stadButton');


  if(gesorteerd == "SAL"){
    redisplayMPInfo(stadOmgekeerd);
    btn.text(btn.text() + arrowUp);
    gesorteerd = "SOM";
  }
  else{
    redisplayMPInfo(stadAlfabetisch);
    btn.text(btn.text() + arrowDown);
    gesorteerd = "SAL";
  }
}

function sortStatus(){
  let btn = $('#statusButton');


  if(gesorteerd == "SGK"){
    redisplayMPInfo(statusKleinGroot);
    btn.text(btn.text() + arrowUp);
    gesorteerd = "SKG";
  }
  else{
    redisplayMPInfo(statusGrootKlein);
    btn.text(btn.text() + arrowDown);
    gesorteerd = "SGK";
  }
}

function sortType(){
  let btn = $('#typeButton');


  if(gesorteerd == "TGK"){
    redisplayMPInfo(typeKleinGroot);
    btn.text(btn.text() + arrowUp);
    gesorteerd = "TKG";
  }
  else{
    redisplayMPInfo(typeGrootKlein);
    btn.text(btn.text() + arrowDown);
    gesorteerd = "TGK";
  }
}

function datumOudNaarNieuw(a,b){
  if(a.datum < b.datum){
    return -1;
  }
  if(a.datum > b.datum){
    return 1;
  }
  return 0;
}

function datumNieuwNaarOud(a,b){
  if(a.datum > b.datum){
    return -1;
  }
  if(a.datum < b.datum){
    return 1;
  }
  return 0;
}

function naamAlfabetisch(a,b){
  if(a.naam.split(" ")[a.naam.split(" ").length - 1] < b.naam.split(" ")[b.naam.split(" ").length - 1]){
    return -1;
  }
  if(a.naam.split(" ")[a.naam.split(" ").length - 1]  > b.naam.split(" ")[b.naam.split(" ").length - 1]){
    return 1;
  }
  return 0;
}

function naamOmgekeerd(a,b){
  if(a.naam.split(" ")[a.naam.split(" ").length - 1] > b.naam.split(" ")[b.naam.split(" ").length - 1]){
    return -1;
  }
  if(a.naam.split(" ")[a.naam.split(" ").length - 1] < b.naam.split(" ")[b.naam.split(" ").length - 1]){
    return 1;
  }
  return 0;
}

function stadAlfabetisch(a,b){
  if(a.stad < b.stad){
    return -1;
  }
  if(a.stad > b.stad){
    return 1;
  }
  return 0;
}

function stadOmgekeerd(a,b){
  if(a.stad > b.stad){
    return -1;
  }
  if(a.stad < b.stad){
    return 1;
  }
  return 0;
}

function statusGrootKlein(a,b){
  if(a.status < b.status){
    return -1;
  }
  if(a.status > b.status){
    return 1;
  }
  return 0;
}

function statusKleinGroot(a,b){
  if(a.status > b.status){
    return -1;
  }
  if(a.status < b.status){
    return 1;
  }
  return 0;
}

function typeGrootKlein(a,b){
  if(a.type < b.type){
    return -1;
  }
  if(a.type > b.type){
    return 1;
  }
  return 0;
}

function typeKleinGroot(a,b){
  if(a.type > b.type){
    return -1;
  }
  if(a.type < b.type){
    return 1;
  }
  return 0;
}
class Shipment{
  
  constructor(id, type, status, kenmerk, barcode, naam, postcode, straat, huisnummer, stad, land, email, telefoon, datum, lightspeedOrder, lightspeedShipment){
    this.id = id;
    this.type = type;
    this.status = status;
    this.kenmerk = kenmerk;
    this.barcode = barcode;
    this.naam = naam;
    this.postcode = postcode;
    this.straat = straat;
    this.huisnummer = huisnummer;
    this.stad = stad;
    this.land = land;
    this.email = email;
    this.telefoon = telefoon;
    this.datum = datum;
    this.lightspeedOrder = lightspeedOrder;
    this.lightspeedShipment = lightspeedShipment;
  }

  show(parent) {
    let row = document.createElement('tr');
    row.setAttribute('data-id', this.id);

    let checkMark = $(`<td><span><a onclick="selectParcel(${this.id})"><i class="fas ${(selectedParcels.includes(this.id))?'fa-check-square':'fa-square'} checkmark checkmark${this.id}"></i></a></span></td>`);
    checkMark.appendTo(row);

    let type = document.createElement('td');
    switch(this.type){
      case 1:
        type.innerHTML = 'Standaard pakket';
        break;
      case 2:
        type.innerHTML = 'Brievenbus pakket';
        break;
      case 3:
        type.innerHTML = 'Brief';
        break;
      case 4:
        type.innerHTML = 'Digitale postzegel'
        break;
      default:
        type.innerHTML = 'Standaard pakket';
        break;
    }

    let status = document.createElement('td');
    switch(this.status){
      case 1:
        status.innerHTML = 'Concept';
        break;
      case 2:
        status.innerHTML = 'Voorgemeld';
        break;
      case 3:
        status.innerHTML = 'Onderweg';
        break;
      case 4:
        status.innerHTML = 'Afgeleverd';
        break;
      case 5:
        status.innerHTML = 'Retour';
        break;
      default:
        status.innerHTML = 'Kon status niet ophalen';
        status.style = 'color: red;';
        break;
    }

    let kenmerk = document.createElement('td');
    kenmerk.innerHTML = this.kenmerk;

    let barcode = document.createElement('td');
    barcode.innerHTML = (this.barcode != '')?`<a class='barcode' onclick = 'getTrackTrace(\"${this.barcode}\", \"${this.postcode}\")'>${this.barcode}</a>`:'/';

    let name = document.createElement('td');
    name.innerHTML = this.naam;

    let adres = document.createElement('td');
    adres.innerHTML = `${this.straat} ${this.huisnummer}<br>${this.postcode}<br>${this.stad}, ${this.land}`;

    let contact = document.createElement('td');
    contact.innerHTML = `<span><i class="fas fa-envelope"></i></span> ${(this.email !== "") ? `<a style=\"color: #9fda34;\" href=\"mailto:${this.email}\">${this.email}</a>` : "/"}<br><span><i class="fas fa-phone-alt"></i></span> ${(this.telefoon != '')?this.telefoon:'/'}`;

    let datum = document.createElement('td');
    datum.innerHTML = `${this.datum.getDate()}/${this.datum.getMonth() + 1}/${this.datum.getFullYear()}`;

    let buttons = document.createElement('td');
    buttons.innerHTML = `<span><a id='print${this.id}'><i class='fas fa-file-pdf fa-lg'></i>${(this.status == 1)? `<a onclick='deleteShipment(${this.id})'><i class='fas fa-trash fa-lg' style='color: red'></i></a>`: ''}</span>`;

    row.append(type, status, kenmerk, barcode, name, adres, contact, datum, buttons);
    parent.append(row);
    
    if(this.lightspeedOrder != null){
      document.getElementById(`print${this.id}`).addEventListener('click', () => {
        lightspeed.getOrderVerzendLabel(this.lightspeedOrder, this.lightspeedShipment);
        setTimeout(() => {getMyParcelData()}, 500);
      });
    }else{
      document.getElementById(`print${this.id}`).addEventListener('click', () => {
        getPDF(this.id);
        setTimeout(() => {getMyParcelData()}, 500);
      });
    }
  }
}