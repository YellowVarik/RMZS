const fs = require('fs');

if(!fs.existsSync('./config/config.json') && window.location.pathname.split('/').pop() !== 'keys.html'){
    window.location.href = "./keys.html";
}

function makeAccount(){
    let name = document.getElementById('naamInput').value;
    let uname = document.getElementById('usernameInput').value;
    let password = document.getElementById('passwordInput').value;;
    let mpKey = document.getElementById('mpKeyInput').value;
    let lsKey = document.getElementById('lsKeyInput').value;
    let lsSecret = document.getElementById('lsSecretInput').value;

    var error = false;
    var errormsg = "<br>";

    if(name.length < 1){
        errormsg += "De naam moet minstens 1 teken lang zijn<br><br>"
        document.getElementById('naamInput').value = "";
        error = true;
    }
    if(uname.length < 1){
        errormsg += "De gebruikersnaam moet minstens 1 teken lang zijn<br><br>"
        document.getElementById('usernameInput').value = "";
        error = true;
    }
    if(password.length < 1){
        errormsg += "Het wachtwoord moet minstens 1 teken lang zijn<br><br>"
        document.getElementById('passwordInput').value = "";
        error = true;
    }
    if(mpKey.length < 40){
        errormsg += "De MyParcel API key moet minstens 40 tekens lang zijn<br><br>"
        document.getElementById('mpKeyInput').value = "";
        error = true;
    }
    if(lsKey.length < 32){
        errormsg += "De Lightspeed API key moet minstens 32 teken lang zijn<br><br>"
        document.getElementById('lsKeyInput').value = "";
        error = true;
    }
    if(lsSecret.length < 32){
        errormsg += "De Lightspeed API Secret moet minstens 32 teken lang zijn<br><br>"
        document.getElementById('lsSecretInput').value = "";
        error = true;
    }

    if(error){
        document.getElementsByClassName('errormsg')[0].innerHTML = errormsg;
        document.getElementById("popup1").classList.add("visible")
        return
    }
    

    let account = {"name" : name, "username" : uname, "password" : password, "mpKey" : mpKey, "lsKey" : lsKey, "lsSecret" : lsSecret};

    try{
        fs.writeFileSync('./config/config.json', JSON.stringify(account));
        window.location.href = "./home.html";
    } catch(error){
        console.error(error);
    }
}

function login(){
    let username = document.getElementById("username").value;
    let password = document.getElementById("password").value;

    configFile = fs.readFileSync('./config/config.json');
    configData = JSON.parse(configFile);

    let error = false;
    let errormsg = '<br>';

    if(username != configData.username){
        error = true;
        errormsg += "Gebruikersnaam komt niet overeen!<br>";
    }
    if(password != configData.password){
        error = true;
        errormsg += "Wachtwoord komt niet overeen!<br>";
    }

    if(error){
        document.getElementsByClassName('errormsg')[0].innerHTML = errormsg;
        document.getElementById("popup1").classList.add("visible")
        return
    }

    window.location.href = './home.html';
}