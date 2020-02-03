const { app, BrowserWindow } = require('electron')
const https = require('https')
const fs = require('fs')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win
var mpURL = "api.myparcel.nl";
var mpKey = "914bb634d3cf4a01ba809dd4b121e33f9d2ea50a";

function createWindow () {
  // Create the browser window.
  win = new BrowserWindow({
    width: 800,
    height: 600,
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: true
    }
  })

  win.setTitle('Rood met Zwarte Stippen')

  // and load the index.html of the app.
  win.loadFile('index.html')
  

  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

getMyParcelData();

function getMyParcelData(){
  let keyBuffer = new Buffer.from(mpKey);
  let base64Key = keyBuffer.toString("base64");

  
  var data = "";

  var options = {
    hostname: mpURL,
    path: "/shipments",
    method: "GET",
    headers:{
      "Host": "api.myparcel.nl",
      "Authorization": "base " + base64Key,
      "Content-Type": "application/json;charset=utf-8",
      "Connection": "keep-alive",
      "Pragma": "no-cache",
      "Cache-Control": "no-cache",
      "Upgrade-Insecure-Requests": 1,
      "Accept-Encoding": "gzip, deflate, sdch, br",
      "User-Agent": "CustomApiCall/2"
    }
  }

  var request = https.request(options, function(result){
    result.on('data', (d) => {
      data += d;
    });
    result.on("end", () => {
      console.log(JSON.parse(data).data.shipments);
      fs.writeFile("zendingen.json", data, (e) => {
        if(e) throw e;
        console.log("Data opgeslagen!");
      })
    })
  })
  request.on('error', (e) => {
    console.error(e);
  });
  request.end();
  
  
}