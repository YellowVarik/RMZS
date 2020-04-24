const fs = require('fs');
const axios = require('axios').default
const Cryptr = require('cryptr');
const crypto = require('crypto')
const path = require("path");

const storage = window.localStorage;
const configPath = path.resolve('./config');

if (!fs.existsSync('./config/config.json') && window.location.pathname.split('/').pop() !== 'keys.html') {
    window.location.href = "./keys.html";
}

if (window.location.pathname.split('/').pop() != 'index.html' && window.location.pathname.split('/').pop() != 'keys.html') {
    if (storage.getItem('mpKey') === null) {
        window.location.href = 'index.html';
    }
}

if (window.location.pathname.split('/').pop() == 'home.html') {
    const config = JSON.parse(fs.readFileSync("./config/config.json"));
    document.getElementById('welkom').innerHTML = 'Welkom, ' + config.name + "!";
}

async function makeAccount() {
    let name = document.getElementById('naamInput').value;
    let uname = document.getElementById('usernameInput').value;
    let password = document.getElementById('passwordInput').value;
    let passwordrepeat = document.getElementById('passwordInputRepeat').value;

    var keyBuffer = new Buffer.from(document.getElementById('mpKeyInput').value);
    var mpKey = keyBuffer.toString("base64");
    let lsKey = document.getElementById('lsKeyInput').value;
    let lsSecret = document.getElementById('lsSecretInput').value;

    var error = false;
    var errormsg = "<br>";

    if (name.length < 1) {
        errormsg += "De naam moet minstens 1 teken lang zijn!<br><br>"
        document.getElementById('naamInput').value = "";
        error = true;
    }
    if (uname.length < 1) {
        errormsg += "De gebruikersnaam moet minstens 1 teken lang zijn!<br><br>"
        document.getElementById('usernameInput').value = "";
        error = true;
    }
    if (password.length < 1) {
        errormsg += "Het wachtwoord moet minstens 1 teken lang zijn!<br><br>"
        document.getElementById('passwordInput').value = "";
        error = true;
    } else if (password !== passwordrepeat) {
        errormsg += "De wachtwoorden zijn niet gelijk!<br><br>"
        document.getElementById('passwordInputRepeat').value = "";
        error = true;
    }

    if (document.getElementById('mpKeyInput').value.length != 40) {
        errormsg += "De MyParcel API key moet 40 tekens lang zijn!<br><br>"
        document.getElementById('mpKeyInput').value = "";
        error = true;
    } else {
        await axios.get("https://api.myparcel.nl/shipments", {
            headers: {
                "Authorization": `base ${mpKey}`,
                "Content-Type": "application/json;charset=utf-8",
                "Pragma": "no-cache",
                "Cache-Control": "no-cache",
                "Upgrade-Insecure-Requests": 1
            }
        }).catch(() => {
            errormsg += 'De MyParcel API Key is onjuist!<br><br>';
            error = true;
            document.getElementById('mpKeyInput').value = '';
        })
    }

    lsKeyChecked = false;

    if (lsKey.length != 32) {
        errormsg += "De Lightspeed API key moet 32 tekens lang zijn!<br><br>"
        document.getElementById('lsKeyInput').value = "";
        error = true;
    } else {
        await axios.get(`https://${lsKey}:${lsSecret}@api.webshopapp.com/nl/orders.json`).catch(() => {
            errormsg += 'De Lightspeed API Key of secret is onjuist!<br><br>';
            error = true;
        });

        lsKeyChecked = true;
    }

    if (lsSecret.length != 32) {
        errormsg += "De Lightspeed API Secret moet 32 tekens lang zijn!<br><br>"
        document.getElementById('lsSecretInput').value = "";
        error = true;
    } else if (!lsKeyChecked) {
        await axios.get(`https://${lsKey}:${lsSecret}@api.webshopapp.com/nl/orders.json`).catch(() => {
            errormsg += 'De Lightspeed API Key of secret is onjuist!<br><br>';
            error = true;
        });
    }

    if (error) {
        document.getElementsByClassName('errormsg')[0].innerHTML = errormsg + "<font style='font-size: 10px;'><b>Klopt dit niet? Neem contact op met de systeembeheerder!</b></font>";
        document.getElementById("popup1").classList.add("visible")
        return
    }

    const pwhash = crypto.createHash('md5').update(password).digest("hex");
    const cryptr = new Cryptr(pwhash);

    let account = { "name": name, "username": uname, "mpKey": cryptr.encrypt(mpKey), "lsKey": cryptr.encrypt(lsKey), "lsSecret": cryptr.encrypt(lsSecret) };

    try {
        if (!fs.existsSync("./config")) {
            fs.mkdirSync("./config");
        }
        fs.writeFileSync('./config/config.json', JSON.stringify(account));
        storage.setItem('mpKey', mpKey);
        storage.setItem('lsKey', lsKey);
        storage.setItem('lsSecret', lsSecret);

        window.location.href = "./home.html";
    } catch (error) {
        console.error(error);
    }
}

async function login() {
    let username = document.getElementById("username").value;
    let password = document.getElementById("password").value;

    configFile = fs.readFileSync('./config/config.json');
    configData = JSON.parse(configFile);

    let error = false;
    let errormsg = '<br>';

    if (username != configData.username) {
        error = true;
        errormsg = "Gebruikersnaam en/of wachtwoord komt niet overeen!<br><br>";
    }

    const pwhash = crypto.createHash('md5').update(password).digest("hex");
    const cryptr = new Cryptr(pwhash);

    try {
        var decryptedKey = cryptr.decrypt(configData.lsKey)
    } catch{
        errormsg = "Gebruikersnaam en/of wachtwoord komt niet overeen!<br><br>";
        error = true;
    }

    if (error) {
        document.getElementsByClassName('errormsg')[0].innerHTML = errormsg + "<font style='font-size: 10px;'><b>Klopt dit niet? Neem contact op met de systeembeheerder!</b></font>";
        document.getElementById("popup1").classList.add("visible")
        return
    }

    storage.setItem('mpKey', cryptr.decrypt(configData.mpKey));
    storage.setItem('lsKey', cryptr.decrypt(configData.lsKey));
    storage.setItem('lsSecret', cryptr.decrypt(configData.lsSecret));
    window.location.href = './home.html';
}

function deleteAccount() {
    fs.unlinkSync('./config/config.json', (e) => {
        if (e) throw e;
    })
    storage.clear();
    window.location.href = './keys.html';
}

function changeName() {
    const file = require(path.join(configPath, 'config.json'));
    var oldName = file.name;
    var newName = document.getElementById('namechange').value;
    file.name = newName;
    fs.writeFileSync('./config/config.json', JSON.stringify(file));
    document.getElementsByClassName('changemessage')[0].innerHTML = `Uw naam is veranderd van \"${oldName}\" naar \"${newName}\"`;
    document.getElementById('popupchange').classList.add('visible');
    var inputs = document.getElementsByTagName('input')
    for (var i = 0; i < inputs.length; i++) {
        inputs[i].value = '';
    }
}

function changeUsername() {
    const file = require(path.join(configPath, 'config.json'));
    var error = false;
    var oldUsername = file.username;
    var newUsername = document.getElementById('usernamechange').value;
    var password = document.getElementById('unamepassword').value
    var pwhash = crypto.createHash('md5').update(password).digest("hex");
    var cryptr = new Cryptr(pwhash);

    try {
        var decryptedKey = cryptr.decrypt(file.lsKey)
    } catch{
        errormsg = "Het wachtwoord is niet correct!<br><br>";
        error = true;
    }
    if (error) {
        document.getElementsByClassName('errormsg')[0].innerHTML = errormsg + "<font style='font-size: 10px;'><b>Klopt dit niet? Neem contact op met de systeembeheerder!</b></font>";
        document.getElementById("popuppassword").classList.add("visible")
        return
    }
    file.username = newUsername;
    fs.writeFileSync('./config/config.json', JSON.stringify(file));
    document.getElementsByClassName('changemessage')[0].innerHTML = `Uw gebruikersnaam is veranderd van \"${oldUsername}\" naar \"${newUsername}\"`;
    document.getElementById('popupchange').classList.add('visible');
    var inputs = document.getElementsByTagName('input')
    for (var i = 0; i < inputs.length; i++) {
        inputs[i].value = '';
    }
}

function changePassword() {
    const file = require(path.join(configPath, 'config.json'));
    var oldPassword = document.getElementById('passwordchangeold').value;
    var newPassword = document.getElementById('passwordchangenew').value;
    var newPasswordRepeat = document.getElementById('passwordchangenewrepeat').value;

    var error = false;
    var errormsg = '';

    var pwhash = crypto.createHash('md5').update(oldPassword).digest("hex");
    var cryptr = new Cryptr(pwhash);

    try {
        var decryptedKey = cryptr.decrypt(file.lsKey)
    } catch{
        errormsg = "Het oude wachtwoord is niet correct!<br><br>";
        error = true;
    }

    if (newPassword.length < 1) {
        error = true;
        errormsg += 'Het nieuwe wachtwoord moet minstens 1 teken lang zijn!<br><br>'
    }

    if (newPassword !== newPasswordRepeat) {
        error = true;
        errormsg += 'De nieuwe wachtwoorden zijn niet gelijk!<br><br>'
    }

    if (error) {
        document.getElementsByClassName('errormsg')[0].innerHTML = errormsg + "<font style='font-size: 10px;'><b>Klopt dit niet? Neem contact op met de systeembeheerder!</b></font>";
        document.getElementById("popuppassword").classList.add("visible")
        return
    }
    else {
        pwhash = crypto.createHash('md5').update(newPassword).digest("hex");
        cryptr = new Cryptr(pwhash);
        file.mpKey = cryptr.encrypt(storage.getItem('mpKey'));
        file.lsKey = cryptr.encrypt(storage.getItem('lsKey'));
        file.lsSecret = cryptr.encrypt(storage.getItem('lsSecret'));
        fs.writeFileSync('./config/config.json', JSON.stringify(file));
        document.getElementsByClassName('changemessage')[0].innerHTML = 'Uw wachtwoord is aangepast!';
        document.getElementById('popupchange').classList.add('visible');
        var inputs = document.getElementsByTagName('input')
        for (var i = 0; i < inputs.length; i++) {
            inputs[i].value = '';
        }
    }


}

async function changempkey() {
    const file = require(path.join(configPath, 'config.json'));
    var errormsg = '';
    var error = false;
    var mpKeyBuffer = new Buffer.from(document.getElementById('myparcelkeychange').value);
    var mpKey = mpKeyBuffer.toString('base64')


    if (document.getElementById('myparcelkeychange').value.length != 40) {
        errormsg += "De MyParcel API key moet 40 tekens lang zijn!<br><br>"
        error = true;
    } else {
        await axios.get("https://api.myparcel.nl/shipments", {
            headers: {
                "Authorization": `base ${mpKey}`
            }
        }).catch(() => {
            errormsg += 'De MyParcel API Key is onjuist!<br><br>';
            error = true;
        })

    }


    var password = document.getElementById('myparcelpassword').value;


    var pwhash = crypto.createHash('md5').update(password).digest("hex");
    var cryptr = new Cryptr(pwhash);

    try {
        var decryptedKey = cryptr.decrypt(file.lsKey)
    } catch{
        errormsg += "Het wachtwoord is niet correct!<br><br>";
        error = true;
    }


    if (error) {
        document.getElementsByClassName('errormsg')[0].innerHTML = errormsg + "<font style='font-size: 10px;'><b>Klopt dit niet? Neem contact op met de systeembeheerder!</b></font>";
        document.getElementById("popuppassword").classList.add("visible")
        return
    }

    file.mpKey = cryptr.encrypt(mpKey);
    storage.setItem('mpKey', mpKey);
    fs.writeFileSync('./config/config.json', JSON.stringify(file));
    document.getElementsByClassName('changemessage')[0].innerHTML = 'Uw MyParcel API Key is aangepast!';
    document.getElementById('popupchange').classList.add('visible');
    var inputs = document.getElementsByTagName('input')
    for (var i = 0; i < inputs.length; i++) {
        inputs[i].value = '';
    }
}

async function changelskey() {
    const file = require(path.join(configPath, 'config.json'));
    var errormsg = '';
    var error = false;
    var lsKey = document.getElementById('lightspeedkeychange').value;
    var lsSecret = document.getElementById('lightspeedsecretchange').value;


    var password = document.getElementById('lspassword').value;


    if (document.getElementById('lightspeedkeychange').value.length != 32 || document.getElementById('lightspeedkeychange').value.length != 32) {
        errormsg += "De Key en Secret moeten 40 tekens lang zijn!<br><br>"
        error = true;
    } else {
        await axios.get(`https://${lsKey}:${lsSecret}@api.webshopapp.com/nl/orders.json`).catch(() => {
            errormsg += 'De Lightspeed API Key of secret is onjuist!<br><br>';
            error = true;
        });

    }


    var pwhash = crypto.createHash('md5').update(password).digest("hex");
    var cryptr = new Cryptr(pwhash);

    try {
        var decryptedKey = cryptr.decrypt(file.lsKey)
    } catch{
        errormsg += "Het wachtwoord is niet correct!<br><br>";
        error = true;
    }


    if (error) {
        document.getElementsByClassName('errormsg')[0].innerHTML = errormsg + "<font style='font-size: 10px;'><b>Klopt dit niet? Neem contact op met de systeembeheerder!</b></font>";
        document.getElementById("popuppassword").classList.add("visible")
        return
    }

    file.lsKey = cryptr.encrypt(lsKey);
    file.lsSecret = cryptr.encrypt(lsSecret);
    storage.setItem('lsKey', lsKey);
    storage.setItem('lsSecret', lsSecret);
    fs.writeFileSync('./config/config.json', JSON.stringify(file));
    document.getElementsByClassName('changemessage')[0].innerHTML = 'Uw Lightspeed API Key en Secret zijn aangepast!';
    document.getElementById('popupchange').classList.add('visible');
    var inputs = document.getElementsByTagName('input')
    for (var i = 0; i < inputs.length; i++) {
        inputs[i].value = '';
    }
}