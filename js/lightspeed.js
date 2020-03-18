const axios = require('axios').default
const {PDFDocument, StandardFonts, rgb} = require('pdf-lib');
const fontkit = require('@pdf-lib/fontkit')

var api_key = "cc5959f83335efb4b42184c9031889f4";
var api_secret = "402de22a12e9b4a65e71c4309b55f548"

var fontRegular = './fonts/Roboto-Regular.ttf';
var fontBold = './fonts/Roboto-Bold.ttf'
var fontBarcode = './fonts/code39.ttf'

var lsUrl = `https://${api_key}:${api_secret}@api.webshopapp.com/nl`


getLightspeedData();
function getLightspeedData() {
    axios.get(`${lsUrl}/shipments.json`).then(response => {
        console.log(response.data)
        makePDF();
    }).catch(error => {
        console.log(error);
    });
}

async function makePDF(){
    const doc = await PDFDocument.create();
    doc.registerFontkit(fontkit);

    const regular = await doc.embedFont(fs.readFileSync(fontRegular));
    const code39 = await doc.embedFont(fs.readFileSync(fontBarcode));
    const bold = await doc.embedFont(fs.readFileSync(fontBold))
    const banner = await doc.embedPng(fs.readFileSync('./img/banner.png'));
    const logo = await doc.embedPng(fs.readFileSync('./img/logo.png'));

    const bannerDims = banner.scale(0.25);
    const logoDims = logo.scale(0.3);

    const page = doc.addPage();

    const {width, height} = page.getSize();

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
        y: height - 3*pakbonTextHeight - 50,
        size: textSize,
        font: bold,
        color: rgb(0,0,0)
    })

    var verzendMethodeText = 'Pakketdienst - \u20AC5,00';
    page.drawText(verzendMethodeText, {
        x: 20,
        y: height - 3*pakbonTextHeight - boldTextHeight - 50,
        size: textSize,
        font: regular,
        color: rgb(0,0,0)
    })

    var betaalMethodeTitelText = 'Betaalmethode';
    page.drawText(betaalMethodeTitelText, {
        x: 20,
        y: height - 3*pakbonTextHeight - boldTextHeight - regularTextHeight - gapSize - 50,
        size: textSize,
        font: bold,
        color: rgb(0,0,0)
    })

    var betaalMethodeText = 'Paytest';
    page.drawText(betaalMethodeText, {
        x: 20,
        y: height - 3*pakbonTextHeight - 2*boldTextHeight - regularTextHeight - gapSize - 50,
        size: textSize,
        font: regular,
        color: rgb(0,0,0)
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

    var orderText = 'Order ORD00003';
    var orderTextWidth = regular.widthOfTextAtSize(orderText, pakbonTextSize);

    page.drawText(orderText, {
        x: width - orderTextWidth - 20,
        y: height - 2*pakbonTextHeight - 45,
        size: pakbonTextSize,
        font: regular,
        color: rgb(0,0,0)
    })


    var bedrijfsGegevensText = 'Bedrijfsgegevens';
    var bedrijfsGegevensTextWidth = bold.widthOfTextAtSize(bedrijfsGegevensText, textSize);

    page.drawText(bedrijfsGegevensText, {
        x: width - bedrijfsGegevensTextWidth - 20,
        y: height - 3*pakbonTextHeight - 50,
        size: textSize,
        font: bold,
        color: rgb(0,0,0)
    })
    
    var bedrijfsNaamText = 'RMZS Development';
    var bedrijfsNaamTextWidth = regular.widthOfTextAtSize(bedrijfsNaamText, textSize);

    page.drawText(bedrijfsNaamText, {
        x: width - bedrijfsNaamTextWidth - 20,
        y: height - 3*pakbonTextHeight - boldTextHeight - 50,
        size: textSize,
        font: regular,
        color: rgb(0,0,0)
    })

    var bedrijfsEmailText = '103047@lingecollege.nl';
    var bedrijfsEmailTextWidth = regular.widthOfTextAtSize(bedrijfsEmailText, textSize);

    page.drawText(bedrijfsEmailText, {
        x: width - bedrijfsEmailTextWidth - 20,
        y: height - 3*pakbonTextHeight - boldTextHeight - regularTextHeight - 50,
        size: textSize,
        font: regular,
        color: rgb(0,0,0)
    })

    var bedrijfTelefoonText = 'Tel +31634895100';
    var bedrijfTelefoonTextWidth = regular.widthOfTextAtSize(bedrijfTelefoonText, textSize);

    page.drawText(bedrijfTelefoonText, {
        x: width - bedrijfTelefoonTextWidth - 20,
        y: height - 3*pakbonTextHeight - boldTextHeight - 2*regularTextHeight - gapSize - 50,
        size: textSize,
        font: regular,
        color: rgb(0,0,0)
    })

    //----ZendingInfo----
    var verzendingNummerTitelText = 'Verzending nummer'
    page.drawText(verzendingNummerTitelText, {
        x: 20,
        y: height - 3*pakbonTextHeight - boldTextHeight - 3*regularTextHeight - 2*gapSize - 50,
        size: textSize,
        font: bold,
        color: rgb(0,0,0)
    })

    var verzendingNummerText = 'SHIP00003';
    page.drawText(verzendingNummerText, {
        x: 20,
        y: height - 3*pakbonTextHeight - 2*boldTextHeight - 3*regularTextHeight - 2*gapSize - 50,
        size: textSize,
        font: regular,
        color: rgb(0,0,0)
    })

    var orderNummerTitelText = 'Ordernummer';
    page.drawText(orderNummerTitelText, {
        x: 20 + ((width - 40)/4),
        y: height - 3*pakbonTextHeight - boldTextHeight - 3*regularTextHeight - 2*gapSize - 50,
        size: textSize,
        font: bold,
        color: rgb(0,0,0)
    })

    var orderNummerText = 'ORD00003';
    page.drawText(orderNummerText, {
        x: 20 + ((width - 40)/4),
        y: height - 3*pakbonTextHeight - 2*boldTextHeight - 3*regularTextHeight - 2*gapSize - 50,
        size: textSize,
        font: regular,
        color: rgb(0,0,0)
    })

    var klantNummerTitelText = 'Klantnummer';
    page.drawText(klantNummerTitelText, {
        x: 20 + 2*((width - 40)/4),
        y: height - 3*pakbonTextHeight - boldTextHeight - 3*regularTextHeight - 2*gapSize - 50,
        size: textSize,
        font: bold,
        color: rgb(0,0,0)
    })

    var klantNummerText = '113180714';
    page.drawText(klantNummerText, {
        x: 20 + 2*((width - 40)/4),
        y: height - 3*pakbonTextHeight - 2*boldTextHeight - 3*regularTextHeight - 2*gapSize - 50,
        size: textSize,
        font: regular,
        color: rgb(0,0,0)
    })

    var bestelDatumTitelText = 'Besteldatum';
    page.drawText(bestelDatumTitelText, {
        x: 20 + 3*((width - 40)/4),
        y: height - 3*pakbonTextHeight - boldTextHeight - 3*regularTextHeight - 2*gapSize - 50,
        size: textSize,
        font: bold,
        color: rgb(0,0,0)
    })

    var bestelDatumText = 'Woensdag 18 Maart 2020';
    page.drawText(bestelDatumText, {
        x: 20 + 3*((width - 40)/4),
        y: height - 3*pakbonTextHeight - 2*boldTextHeight - 3*regularTextHeight - 2*gapSize - 50,
        size: textSize,
        font: regular,
        color: rgb(0,0,0)
    })


    //----Plaatjes----
    page.drawImage(banner, {
        x: 0,
        y: 0,
        width: bannerDims.width,
        height: bannerDims.height
    })

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