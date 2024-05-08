// This is free and unencumbered software released into the public domain.
// See LICENSE for details

const { app, BrowserWindow, Menu } = require('electron');
const log = require('electron-log');
const { autoUpdater } = require("electron-updater");

const versionMap = {
  'Client1': '0.0.5',
  'Client2': '0.0.4' 
};

autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = 'info';
log.info('App starting...');

let template = [];
if (process.platform === 'darwin') {
  // OS X
  const name = app.getName();
  template.unshift({
    label: name,
    submenu: [
      { label: 'About ' + name, role: 'about' },
      { label: 'Quit', accelerator: 'Command+Q', click() { app.quit(); } },
    ]
  });
}

let win;

function sendStatusToWindow(text) {
  log.info(text);
  if (win && win.webContents) {
    win.webContents.send('message', text);
  }
}

function createDefaultWindow() {
  win = new BrowserWindow({
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });
  win.webContents.openDevTools();
  win.on('closed', () => {
    win = null;
  });
  win.loadURL(`file://${__dirname}/version.html#v${app.getVersion()}`);
  return win;
}

autoUpdater.on('checking-for-update', () => {
  sendStatusToWindow('Checking for update...');
});
autoUpdater.on('update-available', (info) => {
  sendStatusToWindow('Update available.');
});
autoUpdater.on('update-not-available', (info) => {
  sendStatusToWindow('Update not available.');
});
autoUpdater.on('error', (err) => {
  sendStatusToWindow('Error in auto-updater. ' + err);
});
autoUpdater.on('download-progress', (progressObj) => {
  let log_message = "Download speed: " + progressObj.bytesPerSecond;
  log_message += ' - Downloaded ' + progressObj.percent + '%';
  log_message += ' (' + progressObj.transferred + "/" + progressObj.total + ')';
  sendStatusToWindow(log_message);
});
autoUpdater.on('update-downloaded', (info) => {
  sendStatusToWindow('Update downloaded');
});

function getClientId() {
  // Implement actual logic to determine the client ID
  // This function should dynamically fetch or calculate the client ID
  return 'Client1';  // Placeholder for client ID
}

app.on('ready', function() {
  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
  createDefaultWindow();

  const clientId = getClientId();
  const targetVersion = versionMap[clientId];
  if (targetVersion) {
    const feedUrl = `https://github.com/yalp780/electron-updater-example-1/download/${targetVersion}`;
    autoUpdater.setFeedURL({ url: feedUrl });
    log.info(`Configured to download version ${targetVersion} for client ${clientId}`);
    autoUpdater.checkForUpdatesAndNotify();
  } else {
    sendStatusToWindow('No suitable update available for this client ID.');
  }
});

app.on('window-all-closed', () => {
  app.quit();
});
