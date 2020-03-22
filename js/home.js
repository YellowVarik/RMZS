window.$ = window.jQuery = require('./js/jquery-3.4.1.min.js')

var config = JSON.parse(fs.readFileSync("./config/config.json"));
var api_key = config.lsKey;
var api_secret = config.lsSecret;
var lsUrl = `https://${api_key}:${api_secret}@api.webshopapp.com/nl`

getSales();

async function getSales(){
    await axios.get(lsUrl + '/dashboard.json').then(result => {
        console.log(result.data);
        var thisyear = new Date().getFullYear();
        var dashboard = result.data.dashboard;
        var week = 0;
        var thirtydays = 0;
        var ninetydays = 0;
        var year = 0;
        var alltime = dashboard.totals.salesIncl;
        for(var i = 0; i < dashboard.periods.length && i < 7; i++){
            week += dashboard.periods[i].salesIncl;
        }
        for(var i = 0; i < dashboard.periods.length && i < 30; i++){
            thirtydays += dashboard.periods[i].salesIncl;
        }
        for(var i = 0; i < dashboard.periods.length && i < 90; i++){
            ninetydays += dashboard.periods[i].salesIncl;
        }
        for(var i = 0; i < dashboard.periods.length && i < 365 && dashboard.periods[i].date.split('-')[0] == thisyear; i++){
            year += dashboard.periods[i].salesIncl;
        }
        
        document.getElementById('week').innerHTML = "<i class='fas fa-coins'></i> Inkomsten laatste 7 dagen: \u20AC" + week;
        document.getElementById('30days').innerHTML = "<i class='fas fa-coins'></i> Inkomsten laatste 30 dagen: \u20AC" + thirtydays;
        document.getElementById('90days').innerHTML = "<i class='fas fa-coins'></i> Inkomsten laatste 90 dagen: \u20AC" + ninetydays;
        document.getElementById('year').innerHTML = "<i class='fas fa-coins'></i> Inkomsten dit jaar: \u20AC" + year;
        document.getElementById('total').innerHTML = "<i class='fas fa-coins'></i> Totale inkomsten: \u20AC" + alltime;
    }).catch(error => {
        console.error(error);
    })

}