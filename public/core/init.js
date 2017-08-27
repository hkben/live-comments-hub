const Remote = require( 'electron' ).remote;
const BrowserWindow = require( 'electron' ).remote.BrowserWindow;
const ipcRenderer = require( 'electron' ).ipcRenderer;

const facebookLive = document.getElementById( 'facebook-live-id' )
const youtubeLive = document.getElementById( 'youtube-live-id' )
const twitchChannel = document.getElementById( 'twitch-channel-id' )
const cancelBtn = document.getElementById( 'cancel' )


const mainWindow = Remote.getCurrentWindow()

function formSubmit()
{
    var data = {};

    if ( facebookLive.value != "" ) {
        data.facebook = facebookLive.value;
    }

    if ( youtubeLive.value != "" ) {
        data.youtube = youtubeLive.value;
    }

    if ( twitchChannel.value != "" ) {
        data.twitch = twitchChannel.value;
    }


    if ( data.facebook || data.youtube || data.twitch ) {

        var json = JSON.stringify( data );

        localStorage.setItem( 'initialization', json );

        ipcRenderer.send( 'initialization', json );

        mainWindow.close();

    }

    return false;
}


cancelBtn.addEventListener( 'click', function( event ) {
    mainWindow.close();
} )


//Save input value to localStorage
if ( localStorage && localStorage.getItem( 'initialization' ) ) {
    var data = JSON.parse( localStorage.getItem( 'initialization' ) );

    facebookLive.value = data.facebook ? data.facebook : "";
    youtubeLive.value = data.youtube ? data.youtube : "";
    twitchChannel.value = data.twitch ? data.twitch : "";

}
