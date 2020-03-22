window.$ = window.jQuery = require('./js/jquery-3.4.1.min.js')
const chartjs = require('chart.js');

var config = JSON.parse(fs.readFileSync("./config/config.json"));
var api_key = config.lsKey;
var api_secret = config.lsSecret;
var lsUrl = `https://${api_key}:${api_secret}@api.webshopapp.com/nl`

getDashboard();


async function getDashboard() {
    axios.get(lsUrl + '/dashboard.json').then(result => {
        console.log(result.data);
        getSales(result.data.dashboard);
        getOrders(result.data.dashboard);
        getVisitors(result.data.dashboard);
    }).catch(error => {
        console.error(error);
    })
}

async function getSales(dashboard) {
    var thisyear = new Date().getFullYear();
    var week = 0;
    var thirtydays = 0;
    var ninetydays = 0;
    var year = 0;
    var alltime = Math.round((dashboard.totals.paidExcl + Number.EPSILON) * 100) / 100;

    var weekOmzetLabels = [];
    var weekOmzet = [];

    var thirtydaysOmzetLabels = [];
    var thirtydaysOmzet = [];

    for (var i = 0; i < dashboard.periods.length && i < 7; i++) {
        week += dashboard.periods[i].paidExcl;
        weekOmzetLabels[i] = dashboard.periods[i].date;
        weekOmzet[i] = dashboard.periods[i].paidExcl;
    }
    for (var i = 0; i < dashboard.periods.length && i < 30; i++) {
        thirtydays += dashboard.periods[i].paidExcl;
        thirtydaysOmzetLabels[i] = dashboard.periods[i].date;
        thirtydaysOmzet[i] = dashboard.periods[i].paidExcl;
    }
    for (var i = 0; i < dashboard.periods.length && i < 90; i++) {
        ninetydays += dashboard.periods[i].paidExcl;
    }
    for (var i = 0; i < dashboard.periods.length && i < 365 && dashboard.periods[i].date.split('-')[0] == thisyear; i++) {
        year += dashboard.periods[i].paidExcl;
    }

    week = Math.round((week + Number.EPSILON) * 100) / 100;
    thirtydays = Math.round((thirtydays + Number.EPSILON) * 100) / 100;
    ninetydays = Math.round((ninetydays + Number.EPSILON) * 100) / 100;
    year = Math.round((year + Number.EPSILON) * 100) / 100;

    document.getElementById('inkomstenweek').innerHTML = "<i class='fas fa-coins'></i> Inkomsten laatste 7 dagen: \u20AC" + week;
    document.getElementById('inkomsten30days').innerHTML = "<i class='fas fa-coins'></i> Inkomsten laatste 30 dagen: \u20AC" + thirtydays;
    document.getElementById('inkomsten90days').innerHTML = "<i class='fas fa-coins'></i> Inkomsten laatste 90 dagen: \u20AC" + ninetydays;
    document.getElementById('inkomstenyear').innerHTML = "<i class='fas fa-coins'></i> Inkomsten dit jaar: \u20AC" + year;
    document.getElementById('inkomstentotal').innerHTML = "<i class='fas fa-coins'></i> Totale inkomsten: \u20AC" + alltime;

    makeChart(weekOmzetLabels.reverse(), weekOmzet.reverse(), document.getElementById('graph1'), "Omzet");

}

async function getOrders(dashboard){
    var thisyear = new Date().getFullYear();
    var week = 0;
    var thirtydays = 0;
    var ninetydays = 0;
    var year = 0;
    var alltime = Math.round((dashboard.totals.orders + Number.EPSILON) * 100) / 100;

    var weekOmzetLabels = [];
    var weekOmzet = [];

    var thirtydaysOmzetLabels = [];
    var thirtydaysOmzet = [];

    for (var i = 0; i < dashboard.periods.length && i < 7; i++) {
        week += dashboard.periods[i].orders;
        weekOmzetLabels[i] = dashboard.periods[i].date;
        weekOmzet[i] = dashboard.periods[i].orders;
    }
    for (var i = 0; i < dashboard.periods.length && i < 30; i++) {
        thirtydays += dashboard.periods[i].orders;
        thirtydaysOmzetLabels[i] = dashboard.periods[i].date;
        thirtydaysOmzet[i] = dashboard.periods[i].orders;
    }
    for (var i = 0; i < dashboard.periods.length && i < 90; i++) {
        ninetydays += dashboard.periods[i].orders;
    }
    for (var i = 0; i < dashboard.periods.length && i < 365 && dashboard.periods[i].date.split('-')[0] == thisyear; i++) {
        year += dashboard.periods[i].orders;
    }

    week = Math.round((week + Number.EPSILON) * 100) / 100;
    thirtydays = Math.round((thirtydays + Number.EPSILON) * 100) / 100;
    ninetydays = Math.round((ninetydays + Number.EPSILON) * 100) / 100;
    year = Math.round((year + Number.EPSILON) * 100) / 100;

    document.getElementById('ordersweek').innerHTML = "<i class='fas fa-box'></i> Orders laatste 7 dagen: " + week;
    document.getElementById('orders30days').innerHTML = "<i class='fas fa-box'></i> Orders laatste 30 dagen: " + thirtydays;
    document.getElementById('orders90days').innerHTML = "<i class='fas fa-box'></i> Orders laatste 90 dagen: " + ninetydays;
    document.getElementById('ordersyear').innerHTML = "<i class='fas fa-box'></i> Orders dit jaar: " + year;
    document.getElementById('orderstotal').innerHTML = "<i class='fas fa-box'></i> Totale Orders: " + alltime;

    makeChart(weekOmzetLabels.reverse(), weekOmzet.reverse(), document.getElementById('graph2'), 'Bestellingen');
}


async function getVisitors(dashboard){
    var thisyear = new Date().getFullYear();
    var week = 0;
    var thirtydays = 0;
    var ninetydays = 0;
    var year = 0;
    var alltime = Math.round((dashboard.totals.visitors + Number.EPSILON) * 100) / 100;

    var weekLabels = [];
    var weekData = [];

    var thirtydaysLabels = [];
    var thirtydaysData = [];

    for (var i = 0; i < dashboard.periods.length && i < 7; i++) {
        week += dashboard.periods[i].visitors;
        weekLabels[i] = dashboard.periods[i].date;
        weekData[i] = dashboard.periods[i].visitors;
    }
    for (var i = 0; i < dashboard.periods.length && i < 30; i++) {
        thirtydays += dashboard.periods[i].visitors;
        thirtydaysLabels[i] = dashboard.periods[i].date;
        thirtydaysData[i] = dashboard.periods[i].visitors;
    }
    for (var i = 0; i < dashboard.periods.length && i < 90; i++) {
        ninetydays += dashboard.periods[i].visitors;
    }
    for (var i = 0; i < dashboard.periods.length && i < 365 && dashboard.periods[i].date.split('-')[0] == thisyear; i++) {
        year += dashboard.periods[i].visitors;
    }

    week = Math.round((week + Number.EPSILON) * 100) / 100;
    thirtydays = Math.round((thirtydays + Number.EPSILON) * 100) / 100;
    ninetydays = Math.round((ninetydays + Number.EPSILON) * 100) / 100;
    year = Math.round((year + Number.EPSILON) * 100) / 100;

    document.getElementById('visitorsweek').innerHTML = "<i class='fas fa-users'></i> Bezoekers laatste 7 dagen: " + week;
    document.getElementById('visitors30days').innerHTML = "<i class='fas fa-users'></i> Bezoekers laatste 30 dagen: " + thirtydays;
    document.getElementById('visitors90days').innerHTML = "<i class='fas fa-users'></i> Bezoekers laatste 90 dagen: " + ninetydays;
    document.getElementById('visitorsyear').innerHTML = "<i class='fas fa-users'></i> Bezoekers dit jaar: " + year;
    document.getElementById('visitorstotal').innerHTML = "<i class='fas fa-users'></i> Totale Bezoekers: " + alltime;
    
    makeChart(thirtydaysLabels.reverse(), thirtydaysData.reverse(), document.getElementById('graph3'), "Bezoekers");
}


function makeChart(labels, omzet, canvas, titel) {
    var mychart = new chartjs.Chart(canvas, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: titel,
                data: omzet,
                borderColor: [
                    '#9fda34'
                ],
            }]
        },
        options: {
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true,
                        precision: 0
                    }
                }]
            }
        }
    })
}