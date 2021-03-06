require
const { app, BrowserWindow, Menu } = require('electron')
const fs = require('fs')
const log = require('electron-log')
const path = require('path');
const contextMenu = require('electron-context-menu');
// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.

const myDocs = app.getPath("documents");

if (!fs.existsSync(path.join(myDocs, "RMZS"))) {
  fs.mkdirSync(path.join(myDocs, "RMZS"));
}

contextMenu({
  showInspectElement: false,
  showCopyImage: false,
  labels: {
    copy: 'Kopiëren',
    cut: 'Knippen',
    searchWithGoogle: 'Zoeken met Google',
    paste: 'Plakken'
  }
})


const rmzsFolder = path.join(myDocs, "RMZS");
const configFolder = path.join(rmzsFolder, 'config');
const backupsFolder = path.join(rmzsFolder, 'backups');
const pakbonnenFolder = path.join(rmzsFolder, 'pakbonnen');

global.folders = {
  main: rmzsFolder,
  config: configFolder,
  backups: backupsFolder,
  pakbonnen: pakbonnenFolder
}

if (!fs.existsSync(configFolder)) {
  fs.mkdirSync(configFolder);
}

if (!fs.existsSync(backupsFolder)) {
  fs.mkdirSync(backupsFolder);
}

if (!fs.existsSync(pakbonnenFolder)) {
  fs.mkdirSync(pakbonnenFolder);
}

let win;

function createWindow() {
  // Create the browser window.
  win = new BrowserWindow({
    width: 800,
    height: 600,
    autoHideMenuBar: true,
    icon: './img/icon.png',
    webPreferences: {
      nodeIntegration: true,
      plugins: true
    }
  })

  win.setTitle('Rood met Zwarte Stippen')

  win.maximize();

  // and load the index.html of the app.
  win.loadFile('index.html')


  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null
  })

  win.on('before-quit', () => {
    win.webContents.executeJavaScript('localStorage.clear();')
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
  createWindow();
})

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    win.webContents.executeJavaScript('localStorage.clear();')
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