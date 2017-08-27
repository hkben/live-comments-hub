const Remote = require( 'electron' ).remote;
const BrowserWindow = require( 'electron' ).remote.BrowserWindow;
const settings = require( 'electron' ).remote.require( 'electron-settings' );
const ipcRenderer = require( 'electron' ).ipcRenderer;

const facebookToken = document.getElementById( 'facebook-app-token' )
const googleToken = document.getElementById( 'google-api-token' )
const twitchUsername = document.getElementById( 'twitch-username' )
const twitchToken = document.getElementById( 'twitch-token' )
const cancelBtn = document.getElementById( 'cancel' )


const mainWindow = Remote.getCurrentWindow()

function formSubmit()
{
    var data = {};

    if ( facebookToken.value != null ) {
      console.log('hi');
        settings.set( 'token.facebook', facebookToken.value );
    }

    if ( googleToken.value != null ) {
        settings.set( 'token.google', googleToken.value );
    }

    if ( twitchUsername.value != null && twitchToken.value != null ) {

        settings.set( 'token.twitchUsername', twitchUsername.value );
        settings.set( 'token.twitch', twitchToken.value );

    }

    //TODO : Checking?

    mainWindow.close();
    return false;
}


cancelBtn.addEventListener( 'click', function( event ) {
    mainWindow.close();
} )

//Save settings to local file
if ( settings.has( 'token' ) ) {

    if ( settings.has( 'token.facebook' ) ) {
        facebookToken.value = settings.get( 'token.facebook' );
    }

    if ( settings.has( 'token.google' ) ) {
        googleToken.value = settings.get( 'token.google' );
    }

    if ( settings.has( 'token.twitchUsername' ) ) {
        twitchUsername.value = settings.get( 'token.twitchUsername' );
    }

    if ( settings.has( 'token.twitch' ) ) {
        twitchToken.value = settings.get( 'token.twitch' );
    }

}
