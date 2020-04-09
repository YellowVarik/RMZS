const https = require('https')
const electron = require('electron')
const pdfWindow = require('electron-pdf-window')
const lightspeed = require(__dirname + '/js/lightspeed')
const path = require('path')

//jQuery moet op een andere manier worden toegevoegd
const $ = require('jquery')


var mpURL = "api.myparcel.nl";

//De key moet worden opgrvraagd door de gebruiker in hun MyParcel account
var base64Key = window.localStorage.getItem('mpKey');

const loadScreen = $(`
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
var lsStatusFilter = null;
var lsCustomStatusFilter = null;
var customStatusesArray;
var zendingen = [];
var selectedParcels = [];

var arrowUp = String.fromCharCode(9650);
var arrowDown = String.fromCharCode(9660);

getMyParcelData();

function filter(category, value, element) {
  var input = document.getElementById("searchBox");
  var query = input.value.toLowerCase();

  let tr = $('#zendingen').find('tr');
  if (tr.length > 0) {
    for (let i = 0; i < tr.length; i++) {
      tr[i].remove();
    }
  }

  switch (category) {
    case 'Status':
      if (category == value) {
        $('#statusFilter').find('.filterTitle').eq(0).text('MyParcel Status')
        statusFilter = null;
      }
      else if (element !== null) {
        $('#statusFilter').find('.filterTitle').eq(0).text(element.innerHTML);
        statusFilter = value;
      }

      break;
    case 'Type':
      if (category == value) {
        $('#typeFilter').find('.filterTitle').eq(0).text('Type')
        typeFilter = null;
      }
      else if (element !== null) {
        $('#typeFilter').find('.filterTitle').eq(0).text(element.innerHTML);
        typeFilter = value;
      }
      break;
    case 'lsStatus':
      if (category == value) {
        $('#lsStatusFilter').find('.filterTitle').eq(0).text('Lightspeed Status');
        lsStatusFilter = null;
      }
      else if (element !== null) {
        $('#lsStatusFilter').find('.filterTitle').eq(0).text(element.innerHTML);
        lsStatusFilter = value;
      }
      break;

    case 'lsCustomStatus':
      if (category == value) {
        $('#lsCustomStatusFilter').find('.filterTitle').eq(0).text('Eigen Status');
        lsCustomStatusFilter = null;
      }
      else if (element !== null) {
        $('#lsCustomStatusFilter').find('.filterTitle').eq(0).text(element.innerHTML);
        lsCustomStatusFilter = value;
      }
      break;


  }

  zendingen.forEach((zending) => {
    if (statusFilter !== null && zending.status != statusFilter) {
    }
    else if (typeFilter !== null && zending.type != typeFilter) {
    }
    else if (lsStatusFilter !== null && zending.lsStatus != lsStatusFilter) {
    }
    else if (lsCustomStatusFilter !== null && (zending.lsCustomStatus == null || zending.lsCustomStatus.id != lsCustomStatusFilter)) {
    }
    else if(!zending.kenmerk.toLowerCase().includes(query) && !zending.naam.toLowerCase().includes(query) && !zending.stad.toLowerCase().includes(query) && !zending.straat.toLowerCase().includes(query) && !zending.postcode.toLowerCase().includes(query) && !zending.email.toLowerCase().includes(query)){
    }
    else {
      zending.show($('#zendingen'));
    }
  })

}

function printSelected(parcels) {
  var selectedOrders = [];
  var selectedShipments = [];
  var verzendLabels = [];
  var datapath = path.resolve('./data');
  for (var i = 0; i < parcels.length; i++) {
    for (x = 0; x < zendingen.length; x++) {
      if (zendingen[x].id == parcels[i]) {
        if (zendingen[x].lightspeedOrder != null) {
          selectedOrders.push(zendingen[x].lightspeedOrder);
          selectedShipments.push(zendingen[x].lightspeedShipment);
        } else {
          verzendLabels.push(zendingen[x].id);
        }
      }
    }
  }

  if (selectedOrders.length > 0) {
    lightspeed.getOrderVerzendLabel(selectedOrders, selectedShipments, datapath);
  }
  if (verzendLabels.length > 0) {
    getPDF(verzendLabels, datapath);
  }
}

function getPDF(id, datapath) {
  let data = '';
  let requestId = id;
  let fileName = id;
  if (id instanceof Array) {
    if (id.length == 0) {
      console.error('GEEN ZENDINGEN GESELECTEERD');
      return;
    }

    fileName = `${id[0]} - ${id[id.length - 1]}`

    for (let i = 0; i < id.length; i++) {
      if (i == 0) {
        requestId = id[i];
      }
      else {
        requestId += `;${id[i]}`;
      }
    }
  }

  var options = {
    hostname: mpURL,
    path: `/shipment_labels/${requestId}`,
    method: "GET",
    encoding: null,
    headers: {
      "Host": mpURL,
      "Authorization": `base ${base64Key}`,
      "Content-Type": "application/pdf",
      "Upgrade-Insecure-Requests": 1,
      "User-Agent": "CustomApiCall/2",
      "Accept": "application/pdf",
    }
  }
  if (!fs.existsSync("./data")) {
    fs.mkdirSync("./data");
  }
  var pdfFile = fs.createWriteStream(path.join(datapath, `label${fileName}.pdf`))
  var request = https.request(options, function (result) {
    result.on('data', (d) => {
      data += d;
      pdfFile.write(d);
    })

    result.on("end", () => {
      pdfFile.end();
      openPDF(path.join(datapath, `label${fileName}.pdf`));
    })
  })

  request.on('error', (e) => {
    console.error("KON LABEL NIET OPHALEN \n" + e);
  });
  request.end();
}

async function getMyParcelData() {
  loadScreen.appendTo($('.main_content')[0]);
  var data = "";

  zendingen = [];


  //Deze opties zijn standaard voor de API en komen van de documentatie op https://myparcelnl.github.io/api
  var options = {
    hostname: mpURL,
    path: "/shipments",
    method: "GET",
    headers: {
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

  var request = https.request(options, function (result) {
    result.on('data', (d) => {
      //De tussentijdse data wordt toegevoegd aan een variabele
      data += d;
    });
    result.on("end", () => {
      //De data wordt verwerkt
      displayMPInfo(data);
      //De data wordt opgeslagen in een bestand
      if (!fs.existsSync("./data")) {
        fs.mkdirSync("./data");
      }
      fs.writeFile("data/zendingen.json", data, (e) => {
        if (e) throw e;
      })
    })
  })
  request.on('error', (e) => {
    console.error("KON DATA VAN MYPARCEL NIET OPHALEN \n" + e);

    //Als er geen data kon worden opgehaald wordt het uit een bestand gehaald
    if (fs.existsSync("./data/zendingen.json")) {
      fs.readFile("data/zendingen.json", function (err, data) {
        displayMPInfo(data);
      });
    }
    else {
      let error = "<p>Kon data niet vinden</p>";
      $("#myparcel").append(error);
    }
  });
  request.end();


}

async function displayMPInfo(data) {
  $('.sortBtn').each(function () {
    $(this).text($(this).text().replace(arrowUp, ''))
    $(this).text($(this).text().replace(arrowDown, ''))
  });



  selectedParcels = [];
  $('#myparcel').find(".checkmark").eq(0).removeClass('fa-check-square').addClass("fa-square");

  gesorteerd = null;
  let tr = $('#zendingen').find('tr');
  if (tr.length > 0) {
    for (let i = 0; i < tr.length; i++) {
      tr[i].remove();
    }
  }

  let parsedData = JSON.parse(data);
  let count = parsedData.data.shipments.length;
  let zending = parsedData.data.shipments;

  var { shipments, orders, products, customStatuses } = await lightspeed.getLightspeedData();
  customStatusesArray = customStatuses;
  //Elke zending wordt apart weergegeven
  for (var i = 0; i < count; i++) {
    let lightspeedOrder, lightspeedShipment, lsStatus, lsCustomStatus = null;
    let klant = zending[i].recipient;
    if (zending[i].options.label_description.includes('ORD')) {
      for (let x = 0; x < orders.length; x++) {
        if (zending[i].options.label_description == orders[x].number) {
          lightspeedOrder = orders[x];
          lightspeedShipment = shipments[x];
          lsStatus = orders[x].status;
          if (orders[x].customStatusId != null && orders[x].customStatusId != 0) {
            for (var z = 0; z < customStatuses.length; z++) {
              if (customStatuses[z].id == orders[x].customStatusId) {
                lsCustomStatus = {
                  id: customStatuses[z].id,
                  title: customStatuses[z].title,
                  color: customStatuses[z].color
                }
                break;
              }
            }
          }
          break;
        }
      }
    }
    let shipment = new Shipment(zending[i].id, zending[i].options.package_type, zending[i].status, zending[i].options.label_description, zending[i].barcode, klant.person, klant.postal_code, klant.street, klant.number + ((klant.number_suffix != null) ? klant.number_suffix : ''), klant.city, klant.cc, klant.email, klant.phone, new Date(zending[i].modified), lightspeedOrder, lightspeedShipment, lsStatus, lsCustomStatus);
    zendingen[i] = shipment;
  }
  let filterParent = $('#lsCustomStatusFilter').find('.filterList').eq(0);
  filterParent.empty();
  $(`<li class='filterOption'><a onclick='filter("lsCustomStatus", "lsCustomStatus", this)'>-</a></li>`).appendTo(filterParent)
  customStatuses.forEach(function (status) {
    let filterOption = $(`<li class='filterOption'><a onclick='filter("lsCustomStatus", ${status.id}, this)'>${status.title}</a></li>'`);
    filterOption.appendTo(filterParent);
  })
  zendingen.forEach(function (item) {
    item.show($('#zendingen'));
  })
  var today = new Date();
  var alreadySaved = false;
  $('#fileSelection').find('.fileSelectionList').eq(0).empty();
  if(!fs.existsSync('./data/zendingen')){
    fs.mkdirSync('./data/zendingen');
  }
  fs.readdirSync('./data/zendingen/').forEach(file => {
    let fileDate = file.replace('.json', '').split('-');
    console.log(new Date(Number(fileDate[2]), Number(fileDate[1]) - 1, Number(fileDate[0]) + 7))
    if(new Date(Number(fileDate[2]), Number(fileDate[1]) - 1, Number(fileDate[0]) + 7) <= today){
      fs.unlinkSync('./data/zendingen/' + file);
    }
    else if (fileDate[0] == today.getDate() && fileDate[1] == (today.getMonth() + 1) && fileDate[2] == today.getFullYear()) {
      alreadySaved = true;
      $(`<li class="fileSelectionOption"><a onclick="loadBackup('${file}')">${file.replace('.json', '')}</a></li>`).appendTo($('#fileSelection').find('.fileSelectionList').eq(0))
    }
    else{
      $(`<li class="fileSelectionOption"><a onclick="loadBackup('${file}')">${file.replace('.json', '')}</a></li>`).appendTo($('#fileSelection').find('.fileSelectionList').eq(0))
    }
  })
  var newBackup = $(`<li class="fileSelectionOption"><a><i>Nieuwe backup</i></a></li>`).appendTo($('#fileSelection').find('.fileSelectionList').eq(0))
  newBackup.click(()=>{
    $('#backupPopup').find('.errormsg').eq(0).css('visibility', "hidden");
    $('#backupPopup').addClass('visible');
  })

  $('#backupPopup').find('.save').eq(0).off('click').click(() => {
    makeBackup();
  })
  if (!alreadySaved) {
    fs.writeFileSync('./data/zendingen/' + today.getDate() + "-" + (today.getMonth() + 1) + "-" + today.getFullYear() + '.json', JSON.stringify(zendingen));
  }
  $('#loading').remove();
}

function redisplayMPInfo(sortingMethod) {

  $('.sortBtn').each(function () {
    $(this).text($(this).text().replace(arrowUp, ''))
    $(this).text($(this).text().replace(arrowDown, ''))
  });

  let tr = $('#zendingen').find('tr');
  if (tr.length > 0) {
    for (let i = 0; i < tr.length; i++) {
      tr[i].remove();
    }
  }

  zendingen.sort(sortingMethod);
  for (let i = 0; i < zendingen.length; i++) {
    zendingen[i].show($('#zendingen'));
  }
  filter();
}

function openPDF(filePath) {
  let win = new electron.remote.BrowserWindow({
    width: 1200,
    height: 800
  })
  pdfWindow.addSupport(win);
  win.loadURL(filePath)
}

function selectParcel(id) {
  let selected = false;
  let i = null;
  selectedParcels.forEach((parcel, index) => {
    if (parcel == id) {
      selected = true;
      i = index;
      break;
    }

  })

  if (selected) {
    if ($('#myparcel').find('tr').length - 1 == selectedParcels.length) {
      $('#myparcel').find(".checkmark").eq(0).removeClass('fa-check-square').addClass("fa-square");
    }
    selectedParcels.splice(i, 1);
    $(`.checkmark${id}`).removeClass("fa-check-square").addClass("fa-square");
  }
  else {
    selectedParcels.push(id);
    $(`.checkmark${id}`).removeClass("fa-square").addClass("fa-check-square");
    if ($('#myparcel').find('tr').length - 1 == selectedParcels.length) {
      $('#myparcel').find(".checkmark").eq(0).removeClass('fa-square').addClass("fa-check-square");
    }
  }
}

function TrackTrace(id) {
  let data = '';
  var options = {
    hostname: mpURL,
    path: `/tracktraces/${id}`,
    method: "GET",
    headers: {
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

  var request = https.request(options, (response) => {
    response.on('data', (d) => {
      data += d;
    })

    response.on('end', () => {
    })
  })

  request.end();
}

function loadBackup(file){
  zendingen = [];
  let tr = $('#zendingen').find('tr');
  if (tr.length > 0) {
    for (let i = 0; i < tr.length; i++) {
      tr[i].remove();
    }
  }

  newZendingen = require('./data/zendingen/' + file);
  newZendingen.forEach((zending, index) => {
    zendingen[index] = new Shipment(zending.id, zending.type, zending.status, zending.kenmerk, zending.barcode, zending.naam, zending.postcode, zending.straat, zending.huisnummer, zending.stad, zending.land, zending.email, zending.telefoon, new Date(zending.datum), zending.lightspeedOrder, zending.lightspeedShipment, zending.lsStatus, zending.lsCustomStatus);
    zendingen[index].show($('#zendingen'));
  })
}

function makeBackup(){
  var name = $('#backupPopup').find('input').val();
  if(name === ''){
    $('#backupPopup').find('.errormsg').eq(0).css('visibility', "visible");
  }
  else{
    fs.writeFileSync('./data/zendingen/' + name + ".json", JSON.stringify(zendingen));
    $('#backupPopup').removeClass('visible');
    $(`<li class="fileSelectionOption"><a onclick="loadBackup('${name}.json')">${name}</a></li>`).prependTo($('#fileSelection').find('.fileSelectionList').eq(0))
  }
}

function selectAllParcels() {
  let rows = $('#myparcel').find('tr');
  parcelLength = selectedParcels.length;
  selectedParcels = [];

  if (rows.length - 1 > parcelLength) {
    for (let i = 0; i < rows.length; i++) {
      if (rows[i].getAttribute('data-id') != null) {
        selectedParcels.push(rows[i].getAttribute("data-id"));
      }
    }

    $('#myparcel').find(".checkmark").removeClass('fa-square').addClass("fa-check-square");
  }
  else {
    $('#myparcel').find(".checkmark").removeClass('fa-check-square').addClass("fa-square");
  }
}

function showEditStatus(zending) {
  var popup = $('#statusPopup');
  popup.find('h2').eq(0).text('Status aanpassen voor ' + zending.kenmerk);
  console.log(zending)
  var options = popup.find('#statusSelection').find('option');
  for (let i = 0; i < options.length; i++) {
    options[i].remove();
  }
  $('<option value=0>Geen Status</option>').appendTo(popup.find('#statusSelection'))

  customStatusesArray.forEach((status) => {
    var option = $(`<option value='${status.id}'>${status.title}</option>`);
    option.appendTo(popup.find('#statusSelection'));
  })

  if (zending.lsCustomStatus === null) {
    popup.find('#statusSelection').val(0);
  }
  else {
    popup.find('#statusSelection').val(zending.lsCustomStatus.id);
  }

  popup.find('.save').eq(0).off('click')

  popup.find('.save').eq(0).click(() => {
    if (popup.find('#statusSelection').val() == null) {
      zending.lightspeedOrder.customStatusId = null;
    }
    else {
      zending.lightspeedOrder.customStatusId = popup.find('#statusSelection').val();
    }
    saveStatus(zending);
    popup.removeClass('visible')
  })

  popup.addClass('visible');
}

async function saveStatus(zending) {
  console.log(zending)
  await lightspeed.updateOrder(zending.lightspeedOrder);
  var targetElement = zending.row.getElementsByTagName('mark')[0];
  var customColor = 'rgba(0,0,0,0); color: white';
  var customTitle = '/'
  customStatusesArray.forEach((element) => {
    if (element.id == zending.lightspeedOrder.customStatusId) {
      zending.lsCustomStatus = {
        id: element.id,
        color: element.color,
        title: element.title
      };
      customColor = element.color;
      customTitle = element.title;
    }
  })
  targetElement.style = 'background-color: ' + customColor + ';';
  targetElement.innerHTML = customTitle;
}

function deleteShipment(id) {
  var data = '';
  var options = {
    hostname: mpURL,
    path: `/shipments/${id}`,
    method: "DELETE",
    headers: {
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

  var request = https.request(options, function (result) {
    result.on('data', (d) => {
      //De tussentijdse data wordt toegevoegd aan een variabele
      data += d;
    });
    result.on("end", () => {
    })
  })
  request.on('error', (e) => {
    console.error(`KON ZENDING MET ID ${id} NIET VERWIJDEREN\n` + e);
  });
  request.end();

  setTimeout(getMyParcelData, 500);
}

function getTrackTrace(barcode, postcode) {
  let win = new electron.remote.BrowserWindow({
    width: 1200,
    height: 800,
    autoHideMenuBar: true,
    icon: './img/icon.png',
  })
  win.loadURL(`https://jouw.postnl.nl/track-and-trace/${barcode}-NL-${postcode}`);
}

function sortDatum() {
  let btn = $('#datumButton');


  if (gesorteerd == "DNO") {
    redisplayMPInfo(datumOudNaarNieuw);
    btn.text(btn.text() + arrowUp);
    gesorteerd = "DON";
  }
  else {
    redisplayMPInfo(datumNieuwNaarOud);
    btn.text(btn.text() + arrowDown);
    gesorteerd = "DNO";
  }
}

function sortNaam() {
  let btn = $('#naamButton');


  if (gesorteerd == "NAL") {
    redisplayMPInfo(naamOmgekeerd);
    btn.text(btn.text() + arrowUp);
    gesorteerd = "NOM";
  }
  else {
    redisplayMPInfo(naamAlfabetisch);
    btn.text(btn.text() + arrowDown);
    gesorteerd = "NAL";
  }
}

function sortStad() {
  let btn = $('#stadButton');


  if (gesorteerd == "SAL") {
    redisplayMPInfo(stadOmgekeerd);
    btn.text(btn.text() + arrowUp);
    gesorteerd = "SOM";
  }
  else {
    redisplayMPInfo(stadAlfabetisch);
    btn.text(btn.text() + arrowDown);
    gesorteerd = "SAL";
  }
}

function sortStatus() {
  let btn = $('#statusButton');


  if (gesorteerd == "SGK") {
    redisplayMPInfo(statusKleinGroot);
    btn.text(btn.text() + arrowUp);
    gesorteerd = "SKG";
  }
  else {
    redisplayMPInfo(statusGrootKlein);
    btn.text(btn.text() + arrowDown);
    gesorteerd = "SGK";
  }
}

function sortType() {
  let btn = $('#typeButton');


  if (gesorteerd == "TGK") {
    redisplayMPInfo(typeKleinGroot);
    btn.text(btn.text() + arrowUp);
    gesorteerd = "TKG";
  }
  else {
    redisplayMPInfo(typeGrootKlein);
    btn.text(btn.text() + arrowDown);
    gesorteerd = "TGK";
  }
}

function datumOudNaarNieuw(a, b) {
  if (a.datum < b.datum) {
    return -1;
  }
  if (a.datum > b.datum) {
    return 1;
  }
  return 0;
}

function datumNieuwNaarOud(a, b) {
  if (a.datum > b.datum) {
    return -1;
  }
  if (a.datum < b.datum) {
    return 1;
  }
  return 0;
}

function naamAlfabetisch(a, b) {
  if (a.naam.split(" ")[a.naam.split(" ").length - 1] < b.naam.split(" ")[b.naam.split(" ").length - 1]) {
    return -1;
  }
  if (a.naam.split(" ")[a.naam.split(" ").length - 1] > b.naam.split(" ")[b.naam.split(" ").length - 1]) {
    return 1;
  }
  return 0;
}

function naamOmgekeerd(a, b) {
  if (a.naam.split(" ")[a.naam.split(" ").length - 1] > b.naam.split(" ")[b.naam.split(" ").length - 1]) {
    return -1;
  }
  if (a.naam.split(" ")[a.naam.split(" ").length - 1] < b.naam.split(" ")[b.naam.split(" ").length - 1]) {
    return 1;
  }
  return 0;
}

function stadAlfabetisch(a, b) {
  if (a.stad < b.stad) {
    return -1;
  }
  if (a.stad > b.stad) {
    return 1;
  }
  return 0;
}

function stadOmgekeerd(a, b) {
  if (a.stad > b.stad) {
    return -1;
  }
  if (a.stad < b.stad) {
    return 1;
  }
  return 0;
}

function statusGrootKlein(a, b) {
  if (a.status < b.status) {
    return -1;
  }
  if (a.status > b.status) {
    return 1;
  }
  return 0;
}

function statusKleinGroot(a, b) {
  if (a.status > b.status) {
    return -1;
  }
  if (a.status < b.status) {
    return 1;
  }
  return 0;
}

function typeGrootKlein(a, b) {
  if (a.type < b.type) {
    return -1;
  }
  if (a.type > b.type) {
    return 1;
  }
  return 0;
}

function typeKleinGroot(a, b) {
  if (a.type > b.type) {
    return -1;
  }
  if (a.type < b.type) {
    return 1;
  }
  return 0;
}
class Shipment {

  constructor(id, type, status, kenmerk, barcode, naam, postcode, straat, huisnummer, stad, land, email, telefoon, datum, lightspeedOrder, lightspeedShipment, lsStatus, lsCustomStatus) {
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
    this.lsStatus = lsStatus;
    this.lsCustomStatus = lsCustomStatus;
    this.row = document.createElement('tr');
  }

  show(parent) {
    this.row.innerHTML = '';
    this.row.setAttribute('data-id', this.id);

    let checkMark = $(`<td><span><a onclick="selectParcel(${this.id})"><i class="fas ${(selectedParcels.includes(this.id)) ? 'fa-check-square' : 'fa-square'} checkmark checkmark${this.id}"></i></a></span></td>`);
    checkMark.appendTo(this.row);

    let type = document.createElement('td');
    switch (this.type) {
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
    status.innerHTML = '<i class="fas fa-box"></i>'
    switch (this.status) {
      case 1:
        status.innerHTML += 'Concept';
        break;
      case 2:
        status.innerHTML += 'Voorgemeld';
        break;
      case 3:
        status.innerHTML += 'Onderweg';
        break;
      case 4:
        status.innerHTML += 'Afgeleverd';
        break;
      case 5:
        status.innerHTML += 'Retour';
        break;
      default:
        status.innerHTML += 'Kon status niet ophalen';
        status.style = 'color: red;';
        break;
    }

    status.innerHTML += '<br><i class="fas fa-rocket"></i>'
    switch (this.lsStatus) {
      case 'new':
        status.innerHTML += 'Nieuw';
        break;
      case 'on_hold':
        status.innerHTML += 'Wachten op vastlegging';
        break;
      case 'processing':
        status.innerHTML += 'Verwerken';
        break;
      case 'processing_awaiting_payment':
        status.innerHTML += 'Wachten op betaling';
        break;
      case 'processing_awaiting_shipment':
        status.innerHTML += 'Klaar voor verzending';
        break;
      case 'processing_awaiting_pickup':
        status.innerHTML += 'Klaar voor afhalen';
        break;
      case 'completed':
        status.innerHTML += 'Afgerond';
        break;
      case 'completed_shipped':
        status.innerHTML += 'Afgerond';
        break;
      case 'completed_picked_up':
        status.innerHTML += 'Afgerond';
        break;
      case 'cancelled':
        status.innerHTML += 'Geannuleerd';
        break;
    }
    if (this.lsCustomStatus !== null) {
      status.innerHTML += `<br><i class="fas fa-info-circle"></i><mark style="background-color: ${this.lsCustomStatus.color};">${this.lsCustomStatus.title}</mark>`
    } else {
      status.innerHTML += '<br><i class="fas fa-info-circle"></i><mark style="background-color: rgba(0,0,0,0); color: white">/</mark>'
    }
    status.innerHTML += `<a class="editBtn" ><i class="fas fa-edit"></i></a>`
    let kenmerk = document.createElement('td');
    kenmerk.innerHTML = this.kenmerk;

    let barcode = document.createElement('td');
    barcode.innerHTML = (this.barcode != '') ? `<a class='barcode' onclick = 'getTrackTrace(\"${this.barcode}\", \"${this.postcode}\")'>${this.barcode}</a>` : '/';

    let name = document.createElement('td');
    name.innerHTML = this.naam;

    let adres = document.createElement('td');
    adres.innerHTML = `${this.straat} ${this.huisnummer}<br>${this.postcode}<br>${this.stad}, ${this.land}`;

    let contact = document.createElement('td');
    contact.innerHTML = `<span><i class="fas fa-envelope"></i></span> ${(this.email !== "") ? `<a style=\"color: #9fda34;\" href=\"mailto:${this.email}\">${this.email}</a>` : "/"}<br><span><i class="fas fa-phone-alt"></i></span> ${(this.telefoon != '') ? this.telefoon : '/'}`;

    let datum = document.createElement('td');
    datum.innerHTML = `${this.datum.getDate()}/${this.datum.getMonth() + 1}/${this.datum.getFullYear()}`;

    let buttons = document.createElement('td');
    buttons.innerHTML = `<span><a id='print${this.id}'><i class='fas fa-file-pdf fa-lg'></i>${(this.status == 1) ? `<a onclick='deleteShipment(${this.id})'><i class='fas fa-trash fa-lg' style='color: red'></i></a>` : ''}</span>`;

    this.row.append(type, status, kenmerk, barcode, name, adres, contact, datum, buttons);
    parent.append(this.row);

    this.row.getElementsByClassName('editBtn')[0].addEventListener("click", () => {
      showEditStatus(this);
    })

    if (this.lightspeedOrder != null) {
      document.getElementById(`print${this.id}`).addEventListener('click', () => {
        lightspeed.getOrderVerzendLabel(this.lightspeedOrder, this.lightspeedShipment, path.resolve('./data'));
        setTimeout(() => { getMyParcelData() }, 500);
      });
    } else {
      document.getElementById(`print${this.id}`).addEventListener('click', () => {
        getPDF(this.id, path.resolve('./data'));
        setTimeout(() => { getMyParcelData() }, 500);
      });
    }
  }
}