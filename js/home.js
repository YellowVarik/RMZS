window.$ = window.jQuery = require('./js/jquery-3.4.1.min.js')
const chartjs = require('chart.js');

const api_key = window.localStorage.getItem('lsKey');
const api_secret = window.localStorage.getItem('lsSecret');
const lsUrl = `https://${api_key}:${api_secret}@api.webshopapp.com/nl`

getDashboard();


async function getDashboard() {
    axios.get(lsUrl + '/dashboard.json?date_min=2013-01-01', {
    }).then(result => {
        console.log(result.data.dashboard)
        result.data.dashboard.periods.reverse();
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

    var weekLabels = [];
    var weekData = [];

    var thirtydaysLabels = [];
    var thirtydaysData = [];

    var ninetydaysData = [];
    var ninetydaysLabels = [];

    var yearData = [];
    var yearLabels = [];

    var alltimeData = [];
    var alltimeLabels = [];

    for (var i = (dashboard.periods.length >= 7) ? dashboard.periods.length - 7 : 0; i < dashboard.periods.length; i++) {
        week += dashboard.periods[i].paidExcl;
        weekLabels.push(dashboard.periods[i].date);
        weekData.push(dashboard.periods[i].paidExcl);
    }
    for (var i = (dashboard.periods.length >= 28 + new Date().getDay() + 1) ? dashboard.periods.length - (28 + new Date().getDay() + 1) : 0; i < dashboard.periods.length; i++) {
        thirtydays += dashboard.periods[i].paidExcl;
        thirtydaysLabels.push(dashboard.periods[i].date);
        thirtydaysData.push(dashboard.periods[i].paidExcl);
    }
    for (var i = (dashboard.periods.length >= 63 + new Date().getDay() + 1) ? dashboard.periods.length - (63 + new Date().getDay() + 1) : 0; i < dashboard.periods.length; i++) {
        ninetydays += dashboard.periods[i].paidExcl;
        ninetydaysLabels.push(dashboard.periods[i].date);
        ninetydaysData.push(dashboard.periods[i].paidExcl);
    }
    for (var i = (dashboard.periods.length >= 365) ? dashboard.periods.length - 365 : 0; i < dashboard.periods.length; i++) {
        if (dashboard.periods[i].date.split('-')[0] == thisyear) {
            year += dashboard.periods[i].paidExcl;
            yearLabels.push(dashboard.periods[i].date);
            yearData.push(dashboard.periods[i].paidExcl);
        }
    }

    for (var i = 0; i < dashboard.periods.length; i++) {
        alltimeLabels.push(dashboard.periods[i].date);
        alltimeData.push(dashboard.periods[i].paidExcl);
    }

    console.log(alltimeData,alltimeLabels)

    var newthirtydays = reduceToWeeks(thirtydaysData, thirtydaysLabels);
    var newninetydays = reduceToWeeks(ninetydaysData, ninetydaysLabels);
    var newyear = reduceToMonths(yearData, yearLabels);
    var newalltime = reduceToMonths(alltimeData, alltimeLabels);

    week = Math.round((week + Number.EPSILON) * 100) / 100;
    thirtydays = Math.round((thirtydays + Number.EPSILON) * 100) / 100;
    ninetydays = Math.round((ninetydays + Number.EPSILON) * 100) / 100;
    year = Math.round((year + Number.EPSILON) * 100) / 100;

    document.getElementById('inkomstenweek').innerHTML = "<i class='fas fa-coins'></i> Inkomsten laatste 7 dagen: \u20AC" + week;
    document.getElementById('inkomsten30days').innerHTML = "<i class='fas fa-coins'></i> Inkomsten laatste 30 dagen: \u20AC" + thirtydays;
    document.getElementById('inkomsten90days').innerHTML = "<i class='fas fa-coins'></i> Inkomsten laatste 90 dagen: \u20AC" + ninetydays;
    document.getElementById('inkomstenyear').innerHTML = "<i class='fas fa-coins'></i> Inkomsten dit jaar: \u20AC" + year;
    document.getElementById('inkomstentotal').innerHTML = "<i class='fas fa-coins'></i> Totale inkomsten: \u20AC" + alltime;

    var chart = makeChart(weekLabels, weekData, document.getElementById('graph1'), "Omzet");

    document.getElementById('inkomstenweekbtn').addEventListener('click', () => {
        changeChart(chart, weekLabels, weekData)
    })

    document.getElementById('inkomsten30daysbtn').addEventListener('click', () => {
        changeChart(chart, newthirtydays.labels, newthirtydays.data)
    })

    document.getElementById('inkomsten90daysbtn').addEventListener('click', () => {
        changeChart(chart, newninetydays.labels, newninetydays.data)
    })

    document.getElementById('inkomstenyearbtn').addEventListener('click', () => {
        console.log(newyear)
        changeChart(chart, newyear.labels, newyear.data)
    })

    document.getElementById('inkomstenalltimebtn').addEventListener('click', () => {
        changeChart(chart, newalltime.labels, newalltime.data)
    })


}

async function getOrders(dashboard) {
    var thisyear = new Date().getFullYear();
    var week = 0;
    var thirtydays = 0;
    var ninetydays = 0;
    var year = 0;
    var alltime = Math.round((dashboard.totals.orders + Number.EPSILON) * 100) / 100;

    var weekLabels = [];
    var weekData = [];

    var thirtydaysLabels = [];
    var thirtydaysData = [];

    var ninetydaysData = [];
    var ninetydaysLabels = [];

    var yearData = [];
    var yearLabels = [];

    var alltimeData = [];
    var alltimeLabels = [];

    for (var i = (dashboard.periods.length >= 7) ? dashboard.periods.length - 7 : 0; i < dashboard.periods.length; i++) {
        week += dashboard.periods[i].orders;
        weekLabels.push(dashboard.periods[i].date);
        weekData.push(dashboard.periods[i].orders);
    }
    for (var i = (dashboard.periods.length >= 28 + new Date().getDay() + 1) ? dashboard.periods.length - (28 + new Date().getDay() + 1) : 0; i < dashboard.periods.length; i++) {
        thirtydays += dashboard.periods[i].orders;
        thirtydaysLabels.push(dashboard.periods[i].date);
        thirtydaysData.push(dashboard.periods[i].orders);
    }
    for (var i = (dashboard.periods.length >= 63 + new Date().getDay() + 1) ? dashboard.periods.length - (63 + new Date().getDay() + 1) : 0; i < dashboard.periods.length; i++) {
        ninetydays += dashboard.periods[i].orders;
        ninetydaysLabels.push(dashboard.periods[i].date);
        ninetydaysData.push(dashboard.periods[i].orders);
    }
    for (var i = (dashboard.periods.length >= 365) ? dashboard.periods.length - 365 : 0; i < dashboard.periods.length; i++) {
        if (dashboard.periods[i].date.split('-')[0] == thisyear) {
            year += dashboard.periods[i].orders;
            yearLabels.push(dashboard.periods[i].date);
            yearData.push(dashboard.periods[i].orders);
        }
    }

    for (var i = 0; i < dashboard.periods.length; i++) {
        alltimeLabels.push(dashboard.periods[i].date);
        alltimeData.push(dashboard.periods[i].orders);
    }

    var newthirtydays = reduceToWeeks(thirtydaysData, thirtydaysLabels);
    var newninetydays = reduceToWeeks(ninetydaysData, ninetydaysLabels);
    var newyear = reduceToMonths(yearData, yearLabels);
    var newalltime = reduceToMonths(alltimeData, alltimeLabels);

    week = Math.round((week + Number.EPSILON) * 100) / 100;
    thirtydays = Math.round((thirtydays + Number.EPSILON) * 100) / 100;
    ninetydays = Math.round((ninetydays + Number.EPSILON) * 100) / 100;
    year = Math.round((year + Number.EPSILON) * 100) / 100;

    document.getElementById('ordersweek').innerHTML = "<i class='fas fa-box'></i> Orders laatste 7 dagen: " + week;
    document.getElementById('orders30days').innerHTML = "<i class='fas fa-box'></i> Orders laatste 30 dagen: " + thirtydays;
    document.getElementById('orders90days').innerHTML = "<i class='fas fa-box'></i> Orders laatste 90 dagen:" + ninetydays;
    document.getElementById('ordersyear').innerHTML = "<i class='fas fa-box'></i> Orders dit jaar: " + year;
    document.getElementById('orderstotal').innerHTML = "<i class='fas fa-box'></i> Totale orders: " + alltime;

    var chart = makeChart(weekLabels, weekData, document.getElementById('graph2'), "Orders");

    document.getElementById('ordersweekbtn').addEventListener('click', () => {
        changeChart(chart, weekLabels, weekData)
    })

    document.getElementById('orders30daysbtn').addEventListener('click', () => {
        changeChart(chart, newthirtydays.labels, newthirtydays.data)
    })

    document.getElementById('orders90daysbtn').addEventListener('click', () => {
        changeChart(chart, newninetydays.labels, newninetydays.data)
    })

    document.getElementById('ordersyearbtn').addEventListener('click', () => {
        changeChart(chart, newyear.labels, newyear.data)
    })

    document.getElementById('ordersalltimebtn').addEventListener('click', () => {
        changeChart(chart, newalltime.labels, newalltime.data)
    })


}


async function getVisitors(dashboard) {
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

    var ninetydaysData = [];
    var ninetydaysLabels = [];

    var yearData = [];
    var yearLabels = [];

    var alltimeData = [];
    var alltimeLabels = [];

    for (var i = (dashboard.periods.length >= 7) ? dashboard.periods.length - 7 : 0; i < dashboard.periods.length; i++) {
        week += dashboard.periods[i].visitors;
        weekLabels.push(dashboard.periods[i].date);
        weekData.push(dashboard.periods[i].visitors);
    }
    for (var i = (dashboard.periods.length >= 28 + new Date().getDay() + 1) ? dashboard.periods.length - (28 + new Date().getDay() + 1) : 0; i < dashboard.periods.length; i++) {
        thirtydays += dashboard.periods[i].visitors;
        thirtydaysLabels.push(dashboard.periods[i].date);
        thirtydaysData.push(dashboard.periods[i].visitors);
    }
    for (var i = (dashboard.periods.length >= 63 + new Date().getDay() + 1) ? dashboard.periods.length - (63 + new Date().getDay() + 1) : 0; i < dashboard.periods.length; i++) {
        ninetydays += dashboard.periods[i].visitors;
        ninetydaysLabels.push(dashboard.periods[i].date);
        ninetydaysData.push(dashboard.periods[i].visitors);
    }
    for (var i = (dashboard.periods.length >= 365) ? dashboard.periods.length - 365 : 0; i < dashboard.periods.length; i++) {
        if (dashboard.periods[i].date.split('-')[0] == thisyear) {
            year += dashboard.periods[i].visitors;
            yearLabels.push(dashboard.periods[i].date);
            yearData.push(dashboard.periods[i].visitors);
        }
    }

    for (var i = 0; i < dashboard.periods.length; i++) {
        alltimeLabels.push(dashboard.periods[i].date);
        alltimeData.push(dashboard.periods[i].visitors);
    }

    var newthirtydays = reduceToWeeks(thirtydaysData, thirtydaysLabels);
    var newninetydays = reduceToWeeks(ninetydaysData, ninetydaysLabels);
    var newyear = reduceToMonths(yearData, yearLabels);
    var newalltime = reduceToMonths(alltimeData, alltimeLabels);

    week = Math.round((week + Number.EPSILON) * 100) / 100;
    thirtydays = Math.round((thirtydays + Number.EPSILON) * 100) / 100;
    ninetydays = Math.round((ninetydays + Number.EPSILON) * 100) / 100;
    year = Math.round((year + Number.EPSILON) * 100) / 100;

    document.getElementById('visitorsweek').innerHTML = "<i class='fas fa-users'></i> Bezoekers laatste 7 dagen: " + week;
    document.getElementById('visitors30days').innerHTML = "<i class='fas fa-users'></i> Bezoekers laatste 30 dagen: " + thirtydays;
    document.getElementById('visitors90days').innerHTML = "<i class='fas fa-users'></i> Bezoekers laatste 90 dagen: " + ninetydays;
    document.getElementById('visitorsyear').innerHTML = "<i class='fas fa-users'></i> Bezoekers dit jaar: " + year;
    document.getElementById('visitorstotal').innerHTML = "<i class='fas fa-users'></i> Totale bezoekers: " + alltime;

    var chart = makeChart(weekLabels, weekData, document.getElementById('graph3'), "Bezoekers");

    document.getElementById('visitorsweekbtn').addEventListener('click', () => {
        changeChart(chart, weekLabels, weekData)
    })

    document.getElementById('visitors30daysbtn').addEventListener('click', () => {
        changeChart(chart, newthirtydays.labels, newthirtydays.data)
    })

    document.getElementById('visitors90daysbtn').addEventListener('click', () => {
        changeChart(chart, newninetydays.labels, newninetydays.data)
    })

    document.getElementById('visitorsyearbtn').addEventListener('click', () => {
        changeChart(chart, newyear.labels, newyear.data)
    })

    document.getElementById('visitorsalltimebtn').addEventListener('click', () => {
        changeChart(chart, newalltime.labels, newalltime.data)
    })


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

function changeChart(chart, labels, data) {
    chart.data.labels = labels;
    chart.data.datasets[0].data = data;
    chart.update();
}


function reduceToWeeks(data, labels) {
    var newData = [];
    var newLabels = [];

    console.log(data, labels)

    while (data.length) {
        var x = data.splice(0, 7);
        var y = labels.splice(0, 7);
        console.log(x, y)
        newLabels.push(getWeekNumber(new Date(y[0])));
        newData.push(x.reduce((a, b) => a + b, 0));
    }
    return { data: newData, labels: newLabels };
}

function reduceToMonths(data, labels) {
    var newData = [];
    var newLabels = [];

    while (data.length) {
        let [year, month, day] = labels[0].split('-');
        let daysInCurrentMonth = new Date(year, month, 0).getDate();
        var x = data.splice(0, daysInCurrentMonth - (Number(day) - 1));
        var y = labels.splice(0, daysInCurrentMonth - (Number(day) - 1));
        newLabels.push(month+"-"+year);
        newData.push(x.reduce((a, b) => a + b, 0));
    }
    return { data: newData, labels: newLabels };
}

function getWeekNumber(d) {
    // Copy date so don't modify original
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    // Set to nearest Thursday: current date + 4 - current day number
    // Make Sunday's day number 7
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay()||7));
    // Get first day of year
    var yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
    // Calculate full weeks to nearest Thursday
    var weekNo = Math.ceil(( ( (d - yearStart) / 86400000) + 1)/7);
    // Return array of year and week number
    return "Week " + weekNo;
}