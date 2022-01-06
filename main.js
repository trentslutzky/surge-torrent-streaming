const { app, BrowserWindow, ipcMain } = require('electron');
const { exec } = require('child_process');
const isDev = require('electron-is-dev');

const leetx = require('./leetx');

let mainWindow

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 820,
    height: 1200,
    show: true,
    frame: false,
    title: 'Tesla Companion',
    fullscreenable: false,
    resizable: false,
    transparent: false,
    titleBarStyle: 'customButtonsOnHover',
    webPreferences: {
      backgroundThrottling: false,
      nodeIntegration: true,
      enableRemoteModule: true,
      contextIsolation: false,
      plugins:true,
    }
  })

  mainWindow.loadURL(
      isDev
          ? 'http://localhost:3000'
          : `file://${path.join(__dirname, '../build/index.html')}`
  );

  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.on('before-input-event',(event,input)=>{
    mainWindow.webContents.send('window_input',input)
  })

  mainWindow.webContents.on('did-finish-load',()=>{
    log.info('loaded')
  })
}

ipcMain.on('search',async (event,term)=>{
  const search_results = await leetx.search(term);
  mainWindow.webContents.send('search_results',search_results);
})

ipcMain.on('get_magnet',async (event,search_line)=>{
  const result = await leetx.get_magnet(search_line);
  mainWindow.webContents.send('got_magnet',result);
})

ipcMain.on('start_stream',async(event,stream_path)=>{
  exec(`kitty webtorrent "${stream_path}" --mpv`)
})

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {

    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
