const fs = require('fs');
const axios = require('axios').default
const Cryptr = require('cryptr');
const crypto = require('crypto')

const storage = window.localStorage;

console.log(storage.getItem('mpKey'), storage.getItem('lsKey'), storage.getItem('lsSecret'))

if (!fs.existsSync('./config/config.json') && window.location.pathname.split('/').pop() !== 'keys.html') {
    window.location.href = "./keys.html";
}

if (window.location.pathname.split('/').pop() == 'home.html') {
    const config = JSON.parse(fs.readFileSync("./config/config.json"));
    document.getElementById('welkom').innerHTML = 'Welkom, ' + config.name + "!";
}

async function makeAccount() {
    let name = document.getElementById('naamInput').value;
    let uname = document.getElementById('usernameInput').value;
    let password = document.getElementById('passwordInput').value;

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
    } else{
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
    } else if (!lsKeyChecked){
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

    await axios.get(`https://${cryptr.decrypt(configData.lsKey)}:${cryptr.decrypt(configData.lsSecret)}@api.webshopapp.com/nl/orders.json`).catch(() => {
        errormsg = "Gebruikersnaam en/of wachtwoord komt niet overeen!<br><br>";
        error = true;
    });

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

    window.location.href = './keys.html';
}

function checkLSKey(key, secret) {
    if (key == '' || secret == '') {
        return false;
    }

}