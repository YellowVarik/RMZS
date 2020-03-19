const axios = require('axios').default
const { PDFDocument, rgb } = require('pdf-lib');
const fontkit = require('@pdf-lib/fontkit')

var api_key = "cc5959f83335efb4b42184c9031889f4";
var api_secret = "402de22a12e9b4a65e71c4309b55f548"

var fontRegular = './fonts/Roboto-Regular.ttf';
var fontBold = './fonts/Roboto-Bold.ttf'

var shipments, orders, products;

var lsUrl = `https://${api_key}:${api_secret}@api.webshopapp.com/nl`
var mpURL = "https://api.myparcel.nl";

getLightspeedData()

async function getLightspeedData() {
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

    getOrderVerzendLabel(orders[2].number)

    console.log({ shipments, orders, products });
    return (shipments, orders, products);
}

async function makePakbon(order, shipment, verzendLabelUrl) {


    const doc = await PDFDocument.create();
    doc.registerFontkit(fontkit);

    const regular = await doc.embedFont(fs.readFileSync(fontRegular));
    const bold = await doc.embedFont(fs.readFileSync(fontBold))
    const logo = await doc.embedPng(fs.readFileSync('./img/logo.png'));
    const verzendLabelDocument = await PDFDocument.load(fs.readFileSync(verzendLabelUrl));

    const verzendLabel = await doc.embedPage(verzendLabelDocument.getPages()[0], {
        left: 420,
        bottom: 297.64,
        right: 841.89,
        top: 595.28
    })

    const logoDims = logo.scale(0.3);

    const page = doc.addPage();

    const { width, height } = page.getSize();
    console.log(page.getSize())

    const textSize = 9;
    const regularTextHeight = regular.heightAtSize(textSize);
    const boldTextHeight = bold.heightAtSize(textSize);

    const gapSize = 10;

    const pakbonTextSize = 16;
    const pakbonTextHeight = regular.heightAtSize(pakbonTextSize);

    //----Links----
    var verzendMethodeTitelText = 'Verzendmethode';
    page.drawText(verzendMethodeTitelText, {
        x: 20,
        y: height - 3 * pakbonTextHeight - 50,
        size: textSize,
        font: bold,
        color: rgb(0, 0, 0)
    })

    var verzendMethodeText = `${order.shipmentTitle}${(order.shipmentPriceIncl !== '') ? "- \u20AC " + order.shipmentPriceIncl : ''}`;
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

    var betaalMethodeText = order.paymentTitle;
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

    var orderText = `Order ${order.number}`;
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

    var verzendingNummerText = shipment.number;
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

    var orderNummerText = order.number;
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

    var klantNummerText = order.customer.resource.id.toString();
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

    var orderDate = new Date(Date.parse(order.createdAt));
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
    await axios.get(`${lsUrl}/${order.products.resource.url}.json`).then(response => {
        console.log(response.data)
        orderProducts = response.data.orderProducts;
    }).catch(error => {
        console.log(error);
    });
    console.log(orderProducts)

    for (i = 0; i < orderProducts.length; i++) {

        page.drawRectangle({
            x: 20,
            y: height - 3 * pakbonTextHeight - 2 * boldTextHeight - 4 * regularTextHeight - 3 * gapSize - 55 - 1 * (i + 1) * (regularTextHeight + 5),
            width: width - 40,
            height: regularTextHeight + 5,
            color: rgb(0.9, 0.9, 0.9)
        })

        page.drawRectangle({
            x: 22,
            y: height - 3 * pakbonTextHeight - 2 * boldTextHeight - 4 * regularTextHeight - 3 * gapSize - 50 - 1 * (i + 1) * (regularTextHeight + 7),
            width: boldTextHeight,
            height: boldTextHeight,
            color: rgb(1, 1, 1),
            borderColor: rgb(0, 0, 0),
            borderWidth: 1
        })
    }

    for (i = 0; i < orderProducts.length; i++) {

        var omschrijvingText = orderProducts[i].productTitle;
        page.drawText(omschrijvingText, {
            x: 25 + boldTextHeight,
            y: height - 3 * pakbonTextHeight - 2 * boldTextHeight - 4 * regularTextHeight - 3 * gapSize - 50 - 1 * (i + 1) * (regularTextHeight + 5),
            size: textSize,
            font: bold,
            color: rgb(0, 0, 0)
        })

        var ArtikelCodetext = orderProducts[i].articleCode;
        page.drawText(ArtikelCodetext, {
            x: width / 2 + 20,
            y: height - 3 * pakbonTextHeight - 2 * boldTextHeight - 4 * regularTextHeight - 3 * gapSize - 50 - 1 * (i + 1) * (regularTextHeight + 5),
            size: textSize,
            font: regular,
            color: rgb(0, 0, 0)
        })

        var aantalText = `${orderProducts[i].quantityOrdered}x`;
        page.drawText(aantalText, {
            x: width / 2 + 200,
            y: height - 3 * pakbonTextHeight - 2 * boldTextHeight - 4 * regularTextHeight - 3 * gapSize - 50 - 1 * (i + 1) * (regularTextHeight + 5),
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

    var verzendAdresNaamText = order.addressShippingName;
    page.drawText(verzendAdresNaamText, {
        x: 20,
        y: height - 3 * pakbonTextHeight - 4 * boldTextHeight - 5 * regularTextHeight - 3 * gapSize - 50 - 1 * offset * (2 * gapSize + 5),
        size: textSize,
        font: regular,
        color: rgb(0, 0, 0)
    })

    var verzendAdresStraatText = order.addressShippingStreet;
    page.drawText(verzendAdresStraatText, {
        x: 20,
        y: height - 3 * pakbonTextHeight - 4 * boldTextHeight - 6 * regularTextHeight - 3 * gapSize - 50 - 1 * offset * (2 * gapSize + 5),
        size: textSize,
        font: regular,
        color: rgb(0, 0, 0)
    })

    var verzendAdresHuisnummerText = order.addressShippingNumber;
    page.drawText(verzendAdresHuisnummerText, {
        x: 20,
        y: height - 3 * pakbonTextHeight - 4 * boldTextHeight - 7 * regularTextHeight - 3 * gapSize - 50 - 1 * offset * (2 * gapSize + 5),
        size: textSize,
        font: regular,
        color: rgb(0, 0, 0)
    })

    var verzendAdresPostcodeText = order.addressShippingZipcode + ' ' + order.adressShippingCity;
    page.drawText(verzendAdresPostcodeText, {
        x: 20,
        y: height - 3 * pakbonTextHeight - 4 * boldTextHeight - 8 * regularTextHeight - 3 * gapSize - 50 - 1 * offset * (2 * gapSize + 5),
        size: textSize,
        font: regular,
        color: rgb(0, 0, 0)
    })

    var verzendAdresLandText = order.addressShippingCountry.title;
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
        x: (width - 40) / 2,
        y: height - 3 * pakbonTextHeight - 3 * boldTextHeight - 5 * regularTextHeight - 3 * gapSize - 50 - 1 * offset * (2 * gapSize + 5),
        size: textSize,
        font: bold,
        color: rgb(0, 0, 0)
    })

    var factuurAdresNaamText = order.addressBillingName;
    page.drawText(factuurAdresNaamText, {
        x: (width - 40) / 2,
        y: height - 3 * pakbonTextHeight - 4 * boldTextHeight - 5 * regularTextHeight - 3 * gapSize - 50 - 1 * offset * (2 * gapSize + 5),
        size: textSize,
        font: regular,
        color: rgb(0, 0, 0)
    })

    var factuurAdresStraatText = order.addressBillingStreet;
    page.drawText(verzendAdresStraatText, {
        x: (width - 40) / 2,
        y: height - 3 * pakbonTextHeight - 4 * boldTextHeight - 6 * regularTextHeight - 3 * gapSize - 50 - 1 * offset * (2 * gapSize + 5),
        size: textSize,
        font: regular,
        color: rgb(0, 0, 0)
    })

    var factuurAdresHuisnummerText = order.addressBillingNumber;
    page.drawText(factuurAdresHuisnummerText, {
        x: (width - 40) / 2,
        y: height - 3 * pakbonTextHeight - 4 * boldTextHeight - 7 * regularTextHeight - 3 * gapSize - 50 - 1 * offset * (2 * gapSize + 5),
        size: textSize,
        font: regular,
        color: rgb(0, 0, 0)
    })

    var factuurAdresPostcodeText = order.addressBillingZipcode + ' ' + order.addressBillingCity;
    page.drawText(factuurAdresPostcodeText, {
        x: (width - 40) / 2,
        y: height - 3 * pakbonTextHeight - 4 * boldTextHeight - 8 * regularTextHeight - 3 * gapSize - 50 - 1 * offset * (2 * gapSize + 5),
        size: textSize,
        font: regular,
        color: rgb(0, 0, 0)
    })

    var factuurAdresLandText = order.addressBillingCountry.title;
    page.drawText(factuurAdresLandText, {
        x: (width - 40) / 2,
        y: height - 3 * pakbonTextHeight - 4 * boldTextHeight - 9 * regularTextHeight - 3 * gapSize - 50 - 1 * offset * (2 * gapSize + 5),
        size: textSize,
        font: regular,
        color: rgb(0, 0, 0)
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

    file = fs.createWriteStream(__dirname + '/data/test.pdf');
    buffer = await doc.save();
    file.write(buffer);
    openPDF(__dirname + '/data/test.pdf')
}

async function getOrderVerzendLabel(orderNumber){
    var shipmentId;
    await axios.get(mpURL + `/shipments?q=${orderNumber}`, {
        headers: {
            "Authorization": `base ${base64Key}`,
            "Content-Type": "application/json;charset=utf-8",
            "Pragma": "no-cache",
            "Cache-Control": "no-cache",
            "Upgrade-Insecure-Requests": 1,
        }
    }).then(response => {
        console.log(response.data)
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
    if (!fs.existsSync("./data")) {
        fs.mkdirSync("./data");
    }
    var pdfFile = fs.createWriteStream(`./data/verzendLabel${orderNumber}.pdf`)
    var data = '';
    var request = await https.request(options, function (result) {
        result.on('data', (d) => {
            data += d;
            pdfFile.write(d);
        })

        result.on("end", () => {
            pdfFile.end();
            makePakbon(orders[2], shipments[2], `./data/verzendLabel${orderNumber}.pdf`);
        })
    })

    request.on('error', (e) => {
        console.error("KON LABEL NIET OPHALEN \n" + e);
    });
    request.end();
}