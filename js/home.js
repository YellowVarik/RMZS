window.$ = window.jQuery = require('./js/jquery-3.4.1.min.js')
const chartjs = require('chart.js');

const api_key = window.localStorage.getItem('lsKey');
const api_secret = window.localStorage.getItem('lsSecret');
const lsUrl = `https://${api_key}:${api_secret}@api.webshopapp.com/nl`

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

    var thirtydaysLabels = [];
    var thirtydaysData = [];

    for (var i = 0; i < dashboard.periods.length && i < 7; i++) {
        week += dashboard.periods[i].paidExcl;
        weekOmzetLabels[i] = dashboard.periods[i].date;
        weekOmzet[i] = dashboard.periods[i].paidExcl;
    }
    for (var i = 0; i < dashboard.periods.length && i < 30; i++) {
        thirtydays += dashboard.periods[i].paidExcl;
        thirtydaysLabels[i] = dashboard.periods[i].date;
        thirtydaysData[i] = dashboard.periods[i].paidExcl;
    }
    for (var i = 0; i < dashboard.periods.length && i < 90; i++) {
        ninetydays += dashboard.periods[i].paidExcl;
    }
    for (var i = 0; i < dashboard.periods.length && i < 365 && dashboard.periods[i].date.split('-')[0] == thisyear; i++) {
        year += dashboard.periods[i].paidExcl;
    }

    // var x = 0;
    // for(var i = 0; i < thirtydaysOmzet.length; i++){
    //     if(i % (x + 7) == 0){
    //         thirtydaysOmzetLabels[x] = thirtydaysOmzetLabels[x] + " tot " + thirtydaysOmzetLabels[i];
    //         thirtydaysOmzet.splice(x + 1, 6);
    //         thirtydaysOmzetLabels.splice(x + 1, 6);
    //         x++;
    //         i = x;
    //     }else{
    //         thirtydaysOmzet[x] += thirtydaysOmzet[i];
    //     }
    // }

    thirtydaysData.reverse();
    thirtydaysLabels.reverse();
    var newThirtyDaysOmzet = [];
    var newThirtyDaysLabels = [];
    while(thirtydaysData.length){
        var x = thirtydaysData.splice(0, 7);
        var y = thirtydaysLabels.splice(0, 7);
        console.log({x, y})
        if(y.length == 7){
            newThirtyDaysLabels.push(y[0] + ' tot ' + y[6]);
        }else{
            newThirtyDaysLabels.push(y[0] + ' tot ' + y[y.length - 1]);
        }
        newThirtyDaysOmzet.push(x.reduce( (a, b) => a + b, 0));
    }

    week = Math.round((week + Number.EPSILON) * 100) / 100;
    thirtydays = Math.round((thirtydays + Number.EPSILON) * 100) / 100;
    ninetydays = Math.round((ninetydays + Number.EPSILON) * 100) / 100;
    year = Math.round((year + Number.EPSILON) * 100) / 100;

    weekOmzet.reverse();
    weekOmzetLabels.reverse();

    document.getElementById('inkomstenweek').innerHTML = "<i class='fas fa-coins'></i> Inkomsten laatste 7 dagen: \u20AC" + week;
    document.getElementById('inkomsten30days').innerHTML = "<i class='fas fa-coins'></i> Inkomsten laatste 30 dagen: \u20AC" + thirtydays;
    document.getElementById('inkomsten90days').innerHTML = "<i class='fas fa-coins'></i> Inkomsten laatste 90 dagen: \u20AC" + ninetydays;
    document.getElementById('inkomstenyear').innerHTML = "<i class='fas fa-coins'></i> Inkomsten dit jaar: \u20AC" + year;
    document.getElementById('inkomstentotal').innerHTML = "<i class='fas fa-coins'></i> Totale inkomsten: \u20AC" + alltime;

    var chart = makeChart(weekOmzetLabels, weekOmzet, document.getElementById('graph1'), "Omzet");

    document.getElementById('inkomstenweekbtn').addEventListener('click', () => {
        changeChart(chart, weekOmzetLabels, weekOmzet)
    })

    document.getElementById('inkomsten30daysbtn').addEventListener('click', () => {
        changeChart(chart, newThirtyDaysLabels, newThirtyDaysOmzet)
    })

    

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


function makeChart(labels, data, canvas, titel) {
    var chart = new chartjs.Chart(canvas, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: titel,
                data: data,
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

    return chart;
}

function changeChart(chart, labels, data){
    chart.data.labels = labels;
    chart.data.datasets[0].data = data;
    chart.update();
}