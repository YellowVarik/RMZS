const fs = require('fs');

if(!fs.existsSync('/../config/config.json') && window.location.pathname.split('/').pop() !== 'keys.html'){
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
    var errormsg = "";

    if(name.length < 1){
        errormsg += "De naam moet minstens 1 teken lang zijn<br>"
        error = true;
    }
    if(uname.length < 1){
        errormsg += "De gebruikersnaam moet minstens 1 teken lang zijn<br>"
        error = true;
    }
    if(password.length < 1){
        errormsg += "Het wachtwoord moet minstens 1 teken lang zijn<br>"
        error = true;
    }
    if(mpKey.length < 40){
        errormsg += "De MyParcel API key moet minstens 40 tekens lang zijn<br>"
        error = true;
    }
    if(lsKey.length < 32){
        errormsg += "De Lightspeed API key moet minstens 32 teken lang zijn<br>"
        error = true;
    }
    if(lsSecret.length < 32){
        errormsg += "De Lightspeed API Secret moet minstens 32 teken lang zijn<br>"
        error = true;
    }

    if(error){

    }
    

    let account = {"name" : name, "username" : uname, "password" : password, "mpKey" : mpKey, "lsKey" : lsKey, "lsSecret" : lsSecret};

    try{
        fs.writeFileSync('./config/config.json', JSON.stringify(account));
        window.location.href = "./home.html";
    } catch(error){
        console.error(error);
    }
}