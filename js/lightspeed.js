const { PDFDocument, rgb } = require('pdf-lib');
const fontkit = require('@pdf-lib/fontkit')

const api_key = window.localStorage.getItem('lsKey');
const api_secret = window.localStorage.getItem('lsSecret');

var fontRegular = __dirname + '/../fonts/Roboto-Regular.ttf';
var fontBold = __dirname + '/../fonts/Roboto-Bold.ttf'

var shipments, orders, products, customStatuses;

var lsUrl = `https://${api_key}:${api_secret}@api.webshopapp.com/nl`

module.exports = {
    getLightspeedData: async function () {
        await axios.get(`${lsUrl}/orders.json`).then(response => {
            orders = response.data.orders
        }).catch(error => {
            console.log(error);
        });

        await axios.get(`${lsUrl}/shipments.json`).then(response => {
            shipments = response.data.shipments
        }).catch(error => {
            console.log(error);
        });

        await axios.get(`${lsUrl}/products.json`).then(response => {
            products = response.data.products
        }).catch(error => {
            console.log(error);
        });

        await axios.get(`${lsUrl}/orders/customstatuses.json`).then(response => {
            customStatuses = response.data.customStatuses;
        }).catch(error => {
            console.log(error);
        })
        console.log ({shipments, orders, products, customStatuses});
        return { shipments, orders, products, customStatuses };
    },

    getOrderVerzendLabel: async function (order, shipment, datapath) {
        var shipmentId;
        var ordersArr = [];
        var shipmentsArr = [];
        var labelsArr = [];
        if (order instanceof Array) {
            for (var i = 0; i < order.length; i++) {
                await axios.get(`https://api.myparcel.nl/shipments?q=${order[i].number}`, {
                    headers: {
                        "Authorization": `base ${base64Key}`,
                        "Content-Type": "application/json;charset=utf-8",
                        "Pragma": "no-cache",
                        "Cache-Control": "no-cache",
                        "Upgrade-Insecure-Requests": 1,
                    }
                }).then(response => {
                    shipmentId = response.data.data.shipments[0].id
                })

                var options = {
                    hostname: 'api.myparcel.nl',
                    path: `/shipment_labels/${shipmentId}`,
                    method: "GET",
                    encoding: null,
                    headers: {
                        "Host": 'api.myparcel.nl',
                        "Authorization": `base ${base64Key}`,
                        "Content-Type": "application/pdf",
                        "Upgrade-Insecure-Requests": 1,
                        "User-Agent": "CustomApiCall/2",
                        "Accept": "application/pdf",
                    }
                }
                if (!fs.existsSync("../data")) {
                    fs.mkdirSync("../data");
                }
                let pdfFile = fs.createWriteStream(path.join(datapath ,`verzendLabel${order[i].number}.pdf`));
                let data = '';
                var request = await https.request(options, function (result) {
                    result.on('data', (d) => {
                        data += d;
                        pdfFile.write(d);
                    })

                    result.on("end", () => {
                        pdfFile.end();
                    })
                })

                request.on('error', (e) => {
                    console.error("KON LABEL NIET OPHALEN \n" + e);
                });
                request.end();
                
                ordersArr[i] = order[i];
                shipmentsArr[i] = shipment[i];
                labelsArr[i] = path.join(datapath,`verzendLabel${order[i].number}.pdf`);
            }
            
                

            setTimeout(() => {makePakbon(ordersArr, shipmentsArr, labelsArr, datapath);}, 100);
        } else {
            await axios.get(`https://api.myparcel.nl/shipments?q=${order.number}`, {
                headers: {
                    "Authorization": `base ${base64Key}`,
                    "Content-Type": "application/json;charset=utf-8",
                    "Pragma": "no-cache",
                    "Cache-Control": "no-cache",
                    "Upgrade-Insecure-Requests": 1,
                }
            }).then(response => {
                shipmentId = response.data.data.shipments[0].id
            }).catch(function (error) {
            })

            var options = {
                hostname: 'api.myparcel.nl',
                path: `/shipment_labels/${shipmentId}`,
                method: "GET",
                encoding: null,
                headers: {
                    "Host": 'api.myparcel.nl',
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
            var pdfFile = fs.createWriteStream(path.join(datapath ,`verzendLabel${order.number}.pdf`))
            var data = '';
            var request = await https.request(options, function (result) {
                result.on('data', (d) => {
                    data += d;
                    pdfFile.write(d);
                })

                result.on("end", () => {
                    pdfFile.end();
                    ordersArr[0] = order;
                    shipmentsArr[0] = shipment;
                    labelsArr[0] = path.join(datapath ,`verzendLabel${order.number}.pdf`);
                    makePakbon(ordersArr, shipmentsArr, labelsArr, datapath);
                })
            })

            request.on('error', (e) => {
                console.error("KON LABEL NIET OPHALEN \n" + e);
            });
            request.end();
        }
    },

    updateCustomStatus: async function(order){
        axios.put(`${lsUrl}/orders/${order.id}.json`, {
            "order": {
                "customStatusId": `${order.customStatusId}`
            }
        },{
            headers: {
                "Content-Type": "application/json"
            }
        }).then(response => {
            console.log(response.data)
        })
    }
}

async function makePakbon(orders, shipments, verzendLabelUrls, datapath) {
    const doc = await PDFDocument.create();
    doc.registerFontkit(fontkit);

    const regular = await doc.embedFont(fs.readFileSync(fontRegular));
    const bold = await doc.embedFont(fs.readFileSync(fontBold))
    const logo = await doc.embedPng(fs.readFileSync(__dirname + '/../img/logo.png'));
    const logoDims = logo.scale(0.3);

    const textSize = 9;
    const regularTextHeight = regular.heightAtSize(textSize);
    const boldTextHeight = bold.heightAtSize(textSize);
    const gapSize = 10;
    const pakbonTextSize = 16;
    const pakbonTextHeight = regular.heightAtSize(pakbonTextSize);
    for (var i = 0; i < orders.length; i++) {
        var page = doc.addPage();
        var verzendLabelDocument = await PDFDocument.load(fs.readFileSync(verzendLabelUrls[i]));

        var verzendLabel = await doc.embedPage(verzendLabelDocument.getPages()[0], {
            left: 420,
            bottom: 297.64,
            right: 841.89,
            top: 595.28
        })

        var { width, height } = page.getSize();

        //----Links----
        var verzendMethodeTitelText = 'Verzendmethode';
        page.drawText(verzendMethodeTitelText, {
            x: 20,
            y: height - 3 * pakbonTextHeight - 50,
            size: textSize,
            font: bold,
            color: rgb(0, 0, 0)
        })

        var verzendMethodeText = `${orders[i].shipmentTitle}${(orders[i].shipmentPriceIncl != '0') ? " - \u20AC " + orders[i].shipmentPriceIncl : ''}`;
        page.drawText(verzendMethodeText, {
            x: 20,
            y: height - 3 * pakbonTextHeight - boldTextHeight - 50,
            size: textSize,
            font: regular,
            color: rgb(0, 0, 0)
        })

        var betaalMethodeTitelText = 'Betaalmethode';
        page.drawText(betaalMethodeTitelText, {
            x: 20,
            y: height - 3 * pakbonTextHeight - boldTextHeight - regularTextHeight - gapSize - 50,
            size: textSize,
            font: bold,
            color: rgb(0, 0, 0)
        })

        var betaalMethodeText = orders[i].paymentTitle;
        page.drawText(betaalMethodeText, {
            x: 20,
            y: height - 3 * pakbonTextHeight - 2 * boldTextHeight - regularTextHeight - gapSize - 50,
            size: textSize,
            font: regular,
            color: rgb(0, 0, 0)
        })


        //----Rechts----
        var pakbonText = 'Pakbon';
        var pakbonTextWidth = regular.widthOfTextAtSize(pakbonText, pakbonTextSize);

        page.drawText(pakbonText, {
            x: width - pakbonTextWidth - 20,
            y: height - pakbonTextHeight - 45,
            size: pakbonTextSize,
            font: regular,
            color: rgb(0, 0, 0)
        })

        var orderText = `Order ${orders[i].number}`;
        var orderTextWidth = regular.widthOfTextAtSize(orderText, pakbonTextSize);

        page.drawText(orderText, {
            x: width - orderTextWidth - 20,
            y: height - 2 * pakbonTextHeight - 45,
            size: pakbonTextSize,
            font: regular,
            color: rgb(0, 0, 0)
        })


        var bedrijfsGegevensText = 'Bedrijfsgegevens';
        var bedrijfsGegevensTextWidth = bold.widthOfTextAtSize(bedrijfsGegevensText, textSize);

        page.drawText(bedrijfsGegevensText, {
            x: width - bedrijfsGegevensTextWidth - 20,
            y: height - 3 * pakbonTextHeight - 50,
            size: textSize,
            font: bold,
            color: rgb(0, 0, 0)
        })

        var bedrijfsNaamText = 'RMZS Development';
        var bedrijfsNaamTextWidth = regular.widthOfTextAtSize(bedrijfsNaamText, textSize);

        page.drawText(bedrijfsNaamText, {
            x: width - bedrijfsNaamTextWidth - 20,
            y: height - 3 * pakbonTextHeight - boldTextHeight - 50,
            size: textSize,
            font: regular,
            color: rgb(0, 0, 0)
        })

        var bedrijfsEmailText = '103047@lingecollege.nl';
        var bedrijfsEmailTextWidth = regular.widthOfTextAtSize(bedrijfsEmailText, textSize);

        page.drawText(bedrijfsEmailText, {
            x: width - bedrijfsEmailTextWidth - 20,
            y: height - 3 * pakbonTextHeight - boldTextHeight - regularTextHeight - 50,
            size: textSize,
            font: regular,
            color: rgb(0, 0, 0)
        })

        var bedrijfTelefoonText = 'Tel +31634895100';
        var bedrijfTelefoonTextWidth = regular.widthOfTextAtSize(bedrijfTelefoonText, textSize);

        page.drawText(bedrijfTelefoonText, {
            x: width - bedrijfTelefoonTextWidth - 20,
            y: height - 3 * pakbonTextHeight - boldTextHeight - 2 * regularTextHeight - gapSize - 50,
            size: textSize,
            font: regular,
            color: rgb(0, 0, 0)
        })

        //----ZendingInfo----
        var verzendingNummerTitelText = 'Verzending nummer'
        page.drawText(verzendingNummerTitelText, {
            x: 20,
            y: height - 3 * pakbonTextHeight - boldTextHeight - 3 * regularTextHeight - 2 * gapSize - 50,
            size: textSize,
            font: bold,
            color: rgb(0, 0, 0)
        })

        var verzendingNummerText = shipments[i].number;
        page.drawText(verzendingNummerText, {
            x: 20,
            y: height - 3 * pakbonTextHeight - 2 * boldTextHeight - 3 * regularTextHeight - 2 * gapSize - 50,
            size: textSize,
            font: regular,
            color: rgb(0, 0, 0)
        })

        var orderNummerTitelText = 'Ordernummer';
        page.drawText(orderNummerTitelText, {
            x: 20 + ((width - 40) / 4),
            y: height - 3 * pakbonTextHeight - boldTextHeight - 3 * regularTextHeight - 2 * gapSize - 50,
            size: textSize,
            font: bold,
            color: rgb(0, 0, 0)
        })

        var orderNummerText = orders[i].number;
        page.drawText(orderNummerText, {
            x: 20 + ((width - 40) / 4),
            y: height - 3 * pakbonTextHeight - 2 * boldTextHeight - 3 * regularTextHeight - 2 * gapSize - 50,
            size: textSize,
            font: regular,
            color: rgb(0, 0, 0)
        })

        var klantNummerTitelText = 'Klantnummer';
        page.drawText(klantNummerTitelText, {
            x: 20 + 2 * ((width - 40) / 4),
            y: height - 3 * pakbonTextHeight - boldTextHeight - 3 * regularTextHeight - 2 * gapSize - 50,
            size: textSize,
            font: bold,
            color: rgb(0, 0, 0)
        })

        var klantNummerText = orders[i].customer.resource.id.toString();
        page.drawText(klantNummerText, {
            x: 20 + 2 * ((width - 40) / 4),
            y: height - 3 * pakbonTextHeight - 2 * boldTextHeight - 3 * regularTextHeight - 2 * gapSize - 50,
            size: textSize,
            font: regular,
            color: rgb(0, 0, 0)
        })

        var bestelDatumTitelText = 'Besteldatum';
        page.drawText(bestelDatumTitelText, {
            x: 20 + 3 * ((width - 40) / 4),
            y: height - 3 * pakbonTextHeight - boldTextHeight - 3 * regularTextHeight - 2 * gapSize - 50,
            size: textSize,
            font: bold,
            color: rgb(0, 0, 0)
        })

        var orderDate = new Date(Date.parse(orders[i].createdAt));
        var orderWeekDay;
        switch (orderDate.getDay()) {
            case 0:
                orderWeekDay = 'Zondag';
                break;
            case 1:
                orderWeekDay = 'Maandag';
                break;
            case 2:
                orderWeekDay = 'Dinsdag';
                break;
            case 3:
                orderWeekDay = 'Woensdag';
                break;
            case 4:
                orderWeekDay = 'Donderdag';
                break;
            case 5:
                orderWeekDay = 'Vrijdag';
                break;
            case 6:
                orderWeekDay = 'Zaterdag';
                break;
        }
        var orderDay = orderDate.getDate();
        var orderMonth;
        switch (orderDate.getMonth()) {
            case 0:
                orderMonth = 'Januari';
                break;
            case 1:
                orderMonth = 'Februari';
                break;
            case 2:
                orderMonth = 'Maart';
                break;
            case 3:
                orderMonth = 'April';
                break;
            case 4:
                orderMonth = 'Mei';
                break;
            case 5:
                orderMonth = 'Juni';
                break;
            case 6:
                orderMonth = 'Juli';
                break;
            case 7:
                orderMonth = 'Augustus';
                break;
            case 8:
                orderMonth = 'September';
                break;
            case 9:
                orderMonth = 'Oktober';
                break;
            case 10:
                orderMonth = 'November';
                break;
            case 11:
                orderMonth = 'December';
                break;
        }
        var orderYear = orderDate.getFullYear();
        var bestelDatumText = `${orderWeekDay} ${orderDay} ${orderMonth} ${orderYear}`;
        page.drawText(bestelDatumText, {
            x: 20 + 3 * ((width - 40) / 4),
            y: height - 3 * pakbonTextHeight - 2 * boldTextHeight - 3 * regularTextHeight - 2 * gapSize - 50,
            size: textSize,
            font: regular,
            color: rgb(0, 0, 0)
        })

        //----TabelHeader----
        page.drawRectangle({
            x: 20,
            y: height - 3 * pakbonTextHeight - 2 * boldTextHeight - 4 * regularTextHeight - 3 * gapSize - 55,
            width: width - 40,
            height: regularTextHeight + 5,
            color: rgb(0.4, 0.4, 0.4)
        })

        var omschrijvingTitelText = 'Omschrijving';
        page.drawText(omschrijvingTitelText, {
            x: 22,
            y: height - 3 * pakbonTextHeight - 2 * boldTextHeight - 4 * regularTextHeight - 3 * gapSize - 50,
            size: textSize,
            font: regular,
            color: rgb(1, 1, 1)
        })

        var ArtikelCodeTitelText = 'Artikelcode';
        page.drawText(ArtikelCodeTitelText, {
            x: width / 2 + 20,
            y: height - 3 * pakbonTextHeight - 2 * boldTextHeight - 4 * regularTextHeight - 3 * gapSize - 50,
            size: textSize,
            font: regular,
            color: rgb(1, 1, 1)
        })

        var SKUTitelText = 'SKU';
        page.drawText(SKUTitelText, {
            x: width / 2 + 100,
            y: height - 3 * pakbonTextHeight - 2 * boldTextHeight - 4 * regularTextHeight - 3 * gapSize - 50,
            size: textSize,
            font: regular,
            color: rgb(1, 1, 1)
        })

        var HSTitelText = 'HS';
        page.drawText(HSTitelText, {
            x: width / 2 + 150,
            y: height - 3 * pakbonTextHeight - 2 * boldTextHeight - 4 * regularTextHeight - 3 * gapSize - 50,
            size: textSize,
            font: regular,
            color: rgb(1, 1, 1)
        })

        var aantalTitelText = 'Aantal';
        page.drawText(aantalTitelText, {
            x: width / 2 + 200,
            y: height - 3 * pakbonTextHeight - 2 * boldTextHeight - 4 * regularTextHeight - 3 * gapSize - 50,
            size: textSize,
            font: regular,
            color: rgb(1, 1, 1)
        })

        //----TabelContent----

        var orderProducts;
        await axios.get(`${lsUrl}/${orders[i].products.resource.url}.json`).then(response => {
            orderProducts = response.data.orderProducts;
        }).catch(error => {
            console.log(error);
        });

        for (var x = 0; x < orderProducts.length; x++) {

            page.drawRectangle({
                x: 20,
                y: height - 3 * pakbonTextHeight - 2 * boldTextHeight - 4 * regularTextHeight - 3 * gapSize - 55 - 1 * (x + 1) * (regularTextHeight + 5),
                width: width - 40,
                height: regularTextHeight + 5,
                color: rgb(0.9, 0.9, 0.9)
            })

            page.drawRectangle({
                x: 22,
                y: height - 3 * pakbonTextHeight - 2 * boldTextHeight - 4 * regularTextHeight - 3 * gapSize - 50 - 2 - 1 * (x + 1) * (regularTextHeight + 5),
                width: boldTextHeight,
                height: boldTextHeight,
                color: rgb(1, 1, 1),
                borderColor: rgb(0, 0, 0),
                borderWidth: 1
            })
        }

        for (var x = 0; x < orderProducts.length; x++) {

            var omschrijvingText = orderProducts[x].productTitle;
            page.drawText(omschrijvingText, {
                x: 25 + boldTextHeight,
                y: height - 3 * pakbonTextHeight - 2 * boldTextHeight - 4 * regularTextHeight - 3 * gapSize - 50 - 1 * (x + 1) * (regularTextHeight + 5),
                size: textSize,
                font: bold,
                color: rgb(0, 0, 0)
            })

            var ArtikelCodetext = orderProducts[x].articleCode;
            page.drawText(ArtikelCodetext, {
                x: width / 2 + 20,
                y: height - 3 * pakbonTextHeight - 2 * boldTextHeight - 4 * regularTextHeight - 3 * gapSize - 50 - 1 * (x + 1) * (regularTextHeight + 5),
                size: textSize,
                font: regular,
                color: rgb(0, 0, 0)
            })

            var aantalText = `${orderProducts[x].quantityOrdered}x`;
            page.drawText(aantalText, {
                x: width / 2 + 200,
                y: height - 3 * pakbonTextHeight - 2 * boldTextHeight - 4 * regularTextHeight - 3 * gapSize - 50 - 1 * (x + 1) * (regularTextHeight + 5),
                size: textSize,
                font: regular,
                color: rgb(0, 0, 0)
            })
        }

        var offset = orderProducts.length;

        //----Klantgegevens----
        //----VerzendAdres----
        var verzendAdresTitelText = 'Verzendadres:'
        page.drawText(verzendAdresTitelText, {
            x: 20,
            y: height - 3 * pakbonTextHeight - 3 * boldTextHeight - 5 * regularTextHeight - 3 * gapSize - 50 - 1 * offset * (2 * gapSize + 5),
            size: textSize,
            font: bold,
            color: rgb(0, 0, 0)
        })

        var verzendAdresNaamText = orders[i].addressShippingName;
        page.drawText(verzendAdresNaamText, {
            x: 20,
            y: height - 3 * pakbonTextHeight - 4 * boldTextHeight - 5 * regularTextHeight - 3 * gapSize - 50 - 1 * offset * (2 * gapSize + 5),
            size: textSize,
            font: regular,
            color: rgb(0, 0, 0)
        })

        var verzendAdresStraatText = orders[i].addressShippingStreet;
        page.drawText(verzendAdresStraatText, {
            x: 20,
            y: height - 3 * pakbonTextHeight - 4 * boldTextHeight - 6 * regularTextHeight - 3 * gapSize - 50 - 1 * offset * (2 * gapSize + 5),
            size: textSize,
            font: regular,
            color: rgb(0, 0, 0)
        })

        var verzendAdresHuisnummerText = orders[i].addressShippingNumber;
        page.drawText(verzendAdresHuisnummerText, {
            x: 20,
            y: height - 3 * pakbonTextHeight - 4 * boldTextHeight - 7 * regularTextHeight - 3 * gapSize - 50 - 1 * offset * (2 * gapSize + 5),
            size: textSize,
            font: regular,
            color: rgb(0, 0, 0)
        })

        var verzendAdresPostcodeText = orders[i].addressShippingZipcode + ' ' + orders[i].addressShippingCity;
        page.drawText(verzendAdresPostcodeText, {
            x: 20,
            y: height - 3 * pakbonTextHeight - 4 * boldTextHeight - 8 * regularTextHeight - 3 * gapSize - 50 - 1 * offset * (2 * gapSize + 5),
            size: textSize,
            font: regular,
            color: rgb(0, 0, 0)
        })

        var verzendAdresLandText = orders[i].addressShippingCountry.title;
        page.drawText(verzendAdresLandText, {
            x: 20,
            y: height - 3 * pakbonTextHeight - 4 * boldTextHeight - 9 * regularTextHeight - 3 * gapSize - 50 - 1 * offset * (2 * gapSize + 5),
            size: textSize,
            font: regular,
            color: rgb(0, 0, 0)
        })

        //----FactuurAdres----
        var FactuurAdresTitelText = 'Factuuradres';
        page.drawText(FactuurAdresTitelText, {
            x: (width - 40) / 3,
            y: height - 3 * pakbonTextHeight - 3 * boldTextHeight - 5 * regularTextHeight - 3 * gapSize - 50 - 1 * offset * (2 * gapSize + 5),
            size: textSize,
            font: bold,
            color: rgb(0, 0, 0)
        })

        var factuurAdresNaamText = orders[i].addressBillingName;
        page.drawText(factuurAdresNaamText, {
            x: (width - 40) / 3,
            y: height - 3 * pakbonTextHeight - 4 * boldTextHeight - 5 * regularTextHeight - 3 * gapSize - 50 - 1 * offset * (2 * gapSize + 5),
            size: textSize,
            font: regular,
            color: rgb(0, 0, 0)
        })

        var factuurAdresStraatText = orders[i].addressBillingStreet;
        page.drawText(verzendAdresStraatText, {
            x: (width - 40) / 3,
            y: height - 3 * pakbonTextHeight - 4 * boldTextHeight - 6 * regularTextHeight - 3 * gapSize - 50 - 1 * offset * (2 * gapSize + 5),
            size: textSize,
            font: regular,
            color: rgb(0, 0, 0)
        })

        var factuurAdresHuisnummerText = orders[i].addressBillingNumber;
        page.drawText(factuurAdresHuisnummerText, {
            x: (width - 40) / 3,
            y: height - 3 * pakbonTextHeight - 4 * boldTextHeight - 7 * regularTextHeight - 3 * gapSize - 50 - 1 * offset * (2 * gapSize + 5),
            size: textSize,
            font: regular,
            color: rgb(0, 0, 0)
        })

        var factuurAdresPostcodeText = orders[i].addressBillingZipcode + ' ' + orders[i].addressBillingCity;
        page.drawText(factuurAdresPostcodeText, {
            x: (width - 40) / 3,
            y: height - 3 * pakbonTextHeight - 4 * boldTextHeight - 8 * regularTextHeight - 3 * gapSize - 50 - 1 * offset * (2 * gapSize + 5),
            size: textSize,
            font: regular,
            color: rgb(0, 0, 0)
        })

        var factuurAdresLandText = orders[i].addressBillingCountry.title;
        page.drawText(factuurAdresLandText, {
            x: (width - 40) / 3,
            y: height - 3 * pakbonTextHeight - 4 * boldTextHeight - 9 * regularTextHeight - 3 * gapSize - 50 - 1 * offset * (2 * gapSize + 5),
            size: textSize,
            font: regular,
            color: rgb(0, 0, 0)
        })

        //----Opmerkingen----
        var opmerkingenTitelText = 'Opmerkingen';
        page.drawText(opmerkingenTitelText, {
            x: (width - 40) / 3 * 2,
            y: height - 3 * pakbonTextHeight - 3 * boldTextHeight - 5 * regularTextHeight - 3 * gapSize - 50 - 1 * offset * (2 * gapSize + 5),
            size: textSize,
            font: bold,
            color: rgb(0, 0, 0)
        })

        var opmerkingenText = (orders[i].comment != "")?orders[i].comment:"Geen opmerkingen";
        var textLimit = 40;
        var opmerkingenTextArray = opmerkingenText.split(' ');
        for (var z = 0; z + 1 < opmerkingenTextArray.length; z++){
            while(z < opmerkingenTextArray.length - 1 && opmerkingenTextArray[z].length + opmerkingenTextArray[z + 1].length + 1 < textLimit){
                opmerkingenTextArray[z] += " " + opmerkingenTextArray[z + 1];
                opmerkingenTextArray.splice((z + 1), 1);
            }
        }

        if(opmerkingenTextArray[0].length > textLimit){
            opmerkingenTextArray =  opmerkingenText.match(/.{1,35}/g);
        }
        opmerkingenText = "";
        for(var y = 0; y < opmerkingenTextArray.length; y++){
            opmerkingenText += opmerkingenTextArray[y] + '\n'
        }
        page.drawText(opmerkingenText, {
            x: (width - 40) / 3 * 2,
            y: height - 3 * pakbonTextHeight - 4 * boldTextHeight - 5 * regularTextHeight - 3 * gapSize - 50 - 1 * offset * (2 * gapSize + 5),
            size: textSize,
            font: regular,
            color: rgb(0, 0, 0),
            lineHeight: 10
        })
        //----Sticker----
        page.drawRectangle({
            x: 28.3466,
            y: 28.3466,
            width: 425.2,
            height: 283.4666,
            borderColor: rgb(0, 0, 0),
            borderWidth: 1
        })



        page.drawPage(verzendLabel, {
            x: 25,
            y: 25
        })

        //----Plaatjes----

        page.drawImage(logo, {
            x: 10,
            y: height - logoDims.height - 50,
            width: logoDims.width,
            height: logoDims.height
        })
    }

    var file = fs.createWriteStream(path.resolve(datapath + `pakbon.pdf`));
    var buffer = await doc.save();
    file.write(buffer);
    openPDF(datapath + `pakbon.pdf`)
}