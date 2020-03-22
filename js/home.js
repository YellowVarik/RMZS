window.$ = window.jQuery = require('./js/jquery-3.4.1.min.js')
const chartjs = require('chart.js');

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
        var alltime = Math.round((dashboard.totals.paidExcl + Number.EPSILON)*100)/100;

        var weekOmzetLabels = [];
        var weekOmzet = [];

        var thirtydaysOmzetLabels = [];
        var thirtydaysOmzet = [];

        for(var i = 0; i < dashboard.periods.length && i < 7; i++){
            week += dashboard.periods[i].paidExcl;
            weekOmzetLabels[i] = dashboard.periods[i].date;
            weekOmzet[i] = dashboard.periods[i].paidExcl;
        }
        for(var i = 0; i < dashboard.periods.length && i < 30; i++){
            thirtydays += dashboard.periods[i].paidExcl;
            thirtydaysOmzetLabels[i] = dashboard.periods[i].date;
            thirtydaysOmzet[i] = dashboard.periods[i].paidExcl;
        }
        for(var i = 0; i < dashboard.periods.length && i < 90; i++){
            ninetydays += dashboard.periods[i].paidExcl;
        }
        for(var i = 0; i < dashboard.periods.length && i < 365 && dashboard.periods[i].date.split('-')[0] == thisyear; i++){
            year += dashboard.periods[i].paidExcl;
        }

        week = Math.round((week + Number.EPSILON) * 100) / 100;
        thirtydays = Math.round((thirtydays + Number.EPSILON) * 100) / 100;
        ninetydays = Math.round((ninetydays + Number.EPSILON) * 100) / 100;
        year = Math.round((year + Number.EPSILON) * 100) / 100;
        
        document.getElementById('week').innerHTML = "<i class='fas fa-coins'></i> Inkomsten laatste 7 dagen: \u20AC" + week;
        document.getElementById('30days').innerHTML = "<i class='fas fa-coins'></i> Inkomsten laatste 30 dagen: \u20AC" + thirtydays;
        document.getElementById('90days').innerHTML = "<i class='fas fa-coins'></i> Inkomsten laatste 90 dagen: \u20AC" + ninetydays;
        document.getElementById('year').innerHTML = "<i class='fas fa-coins'></i> Inkomsten dit jaar: \u20AC" + year;
        document.getElementById('total').innerHTML = "<i class='fas fa-coins'></i> Totale inkomsten: \u20AC" + alltime;

        makeChart(weekOmzetLabels.reverse(), weekOmzet.reverse());
    }).catch(error => {
        console.error(error);
    })

}

function makeChart(labels, omzet){
    var canvas = document.getElementById('graph3');
    var mychart = new chartjs.Chart(canvas, {
        type: 'line',
        data : {
            labels: labels,
            datasets: [{
                label: 'Omzet',
                data: omzet,
                borderColor: [
                    'rgba(99, 255, 99, 1)'
                ],
            }]
        },
        options: {
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true
                    }
                }]
            }
        }
    })
}