const {
  app,
  BrowserWindow
} = require('electron');
let fs = require('fs')
var ipc = require('electron').ipcMain;
const { exec } = require('child_process');

if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
  app.quit();
}

let mainWindow;
let currVid=-1;
let vidarr = JSON.parse(fs.readFileSync('./videos.json')).data
fs.writeFileSync('nuxtstat.json', "true");
let user = {"status": "newUser"}
var chx;

const createWindow = () => {
  mainWindow = new BrowserWindow({show: false, webPreferences: {nodeIntegration: true}});
  mainWindow.setMenu(null)
  mainWindow.maximize();
  mainWindow.show();
  mainWindow.loadURL(`file://${__dirname}/index.html`);
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
};

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

ipc.on('syncGetVid', (event, arg) => {
  if(currVid<vidarr.length && currVid!=-1)
    event.returnValue = vidarr[currVid]
  else
    event.returnValue = {number: currVid}
})

ipc.on('syncGetVidArr', (event, arg) => {
  event.returnValue = vidarr
})

ipc.on('syncStartRec', (event, arg) => {
  status = arg;
  startRec();
  event.returnValue = arg;
})

ipc.on('syncWaitRec', (event, arg) => {
  status = arg;
  stopRec();
  event.returnValue = arg;
})

ipc.on('syncStopRec', (event, arg) => {
  status = arg;
  event.returnValue = arg;
})

ipc.on('syncGetUserStat', (event, arg) => {
  event.returnValue = user;
})

ipc.on("syncSetUserData", (event, arg) => {
  user = arg;
  fs.writeFileSync('user.json', JSON.stringify(user));
  event.returnValue = user;
})

ipc.on("syncChangeFileName", (event, arg) => {
  user = arg;
  user.filename = user.fname+user.mname+user.lname+currVid+".csv";
  fs.writeFileSync('user.json', JSON.stringify(user));
  event.returnValue = user;
})

ipc.on("syncStartFeatureExtraction", (event, arg) => {
  user = arg;
  let command = 'python3 testextraction.py '+user.filename;
  chx = exec(command, (error, stdout, stderr) => {
    if (error) {
      return;
    }
  });
  event.returnValue = user;
})

function startRec(){
  currVid+=1;
  fs.writeFileSync('nuxtstat.json', "true");
  chx = exec('python3 data_python.py', (error, stdout, stderr) => {
    if (error) {
      return;
    }
  });
}

function stopRec(){
  fs.writeFileSync('nuxtstat.json', "false");
}