const electron = require( 'electron' )
const app = electron.app
const BrowserWindow = electron.BrowserWindow
const Tray = electron.Tray
const Menu = electron.Menu
const settings = require( 'electron-settings' );

const path = require( 'path' )
const url = require( 'url' )

var mainWindow
var settingsWindow
var initWindow
var tray

const template = [ {
    role: 'help',
    submenu: [ {
        label: 'Learn More',
        click() {
            //require( 'electron' ).shell.openExternal( 'https://electron.atom.io' )
        }
    }, {
        role: 'toggledevtools'
    } ]
}, {
    label: 'Settings',
    click: function( item, BrowserWindow ) {
        createSettingsWindow();
    },
}, {
    label: 'Clear Message',
    accelerator: "CmdOrCtrl+r",
    click: function( item, BrowserWindow ) {
        mainWindow.webContents.send( 'commentclear' );
    }
}, {
    label: 'Always-On-Top',
    type: 'checkbox',
    accelerator: "CmdOrCtrl+t",
    checked: false,
    click: function( item, BrowserWindow ) {
        mainWindow.setAlwaysOnTop( item.checked );
    }
}, {
    label: 'Click-through',
    type: 'checkbox',
    accelerator: "CmdOrCtrl+f",
    checked: false,
    click: function( item, BrowserWindow ) {
        mainWindow.setIgnoreMouseEvents( item.checked );
        //console.log( `Active ${item.checked}` )
    }
}, {
    label: 'Initialization',
    accelerator: "CmdOrCtrl+i",
    click: function( item, BrowserWindow ) {
        createInitWindow();
    }
},
{
    role: 'quit',
    label: 'Quit App'
} ]


function createInitWindow() {
    // Create the browser window.
    initWindow = new BrowserWindow( {
        width: 400,
        height: 500,
        frame: true,
        resizable: false,
        autoHideMenuBar: true,
    } )

    initWindow.loadURL( url.format( {
        pathname: path.join( __dirname, 'public/core/init.html' ),
        protocol: 'file:',
        slashes: true
    } ) )

    initWindow.on( 'closed', function() {
        initWindow = null
    } )

}

function createSettingsWindow() {
    settingsWindow = new BrowserWindow( {
        width: 400,
        height: 500,
        frame: true,
        resizable: false,
        autoHideMenuBar: true,
    } )

    settingsWindow.loadURL( url.format( {
        pathname: path.join( __dirname, 'public/core/settings.html' ),
        protocol: 'file:',
        slashes: true
    } ) )

    settingsWindow.on( 'closed', function() {
        settingsWindow = null
    } )
}


function createWindow() {
    mainWindow = new BrowserWindow( {
        width: 400,
        height: 600,
        transparent: true,
        frame: false,
        //webPreferences: {
        //preload: path.join(__dirname, 'public/preload.js'),
        //}
    } )

    mainWindow.setSkipTaskbar( true );

    mainWindow.loadURL( url.format( {
        pathname: path.join( __dirname, 'public/index.html' ),
        protocol: 'file:',
        slashes: true,
    } ) )


    mainWindow.on( 'closed', function() {
        mainWindow = null
    } )

    tray = new Tray( path.join( __dirname, 'icon.ico' ) )

    const contextMenu = Menu.buildFromTemplate( template )

    Menu.setApplicationMenu( contextMenu )
    tray.setContextMenu( contextMenu )

    tray.on( 'click', function() {
        mainWindow.show()
        mainWindow.focus()
    } )
}

app.on( 'ready', createWindow )

app.on( 'window-all-closed', function() {
    //tray.displayBalloon({	content: 'Your App is Still Runing Here!'	})

    if ( process.platform !== 'darwin' ) {
        app.quit()
    }
} )

app.on( 'activate', function() {
    if ( mainWindow === null ) {
        createWindow()
    }
} )

const Process = require( './process' )
