const fs = require('fs');

if(!fs.existsSync('/../config/config.json')){
    window.location.href = "/../keys.html";
}