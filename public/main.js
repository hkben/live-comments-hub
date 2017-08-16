const _ = require( 'lodash' );
const BrowserWindow = require( 'electron' ).remote.BrowserWindow
const ipcRenderer = require( 'electron' ).ipcRenderer;
const settings = require( 'electron-settings' );

const scrollBtn = document.getElementById( 'scrollBtn' )

var pendingArray = [];

var autoScroll; //TODO: make this configurable
var scrollPos;
var interval;

var userHasScrolled = false;

const vue_comment = new Vue( {
    el: '#table',
    data: {
        comments: []
    }
} );

window.onscroll = function( e ) {
    //Displaying Scroll to Bottom Button when user scroll
    if ( document.body.scrollTop - scrollPos < -100 ) {
        autoScroll = false;
        scrollBtn.style.display = 'block';
    }
}

scrollBtn.addEventListener( 'click', function( event ) {
    autoScroll = true;
    window.scrollTo( 0, document.body.scrollHeight );
    scrollBtn.style.display = 'none';
} )


ipcRenderer.on( 'commentclear', function( event, result ) {
    vue_comment.comments = [];
} );

ipcRenderer.on( 'update-reply', function( event, result ) {

    var comments_array = result;
    for ( var key in comments_array ) {

        // comments_array[ key ].fromNow = moment( comments_array[ key ].timestamp ).fromNow();

        pendingArray.push( comments_array[ key ] );
        //TODO: Sort function
    }
} );


ipcRenderer.on( 'initialization-response', function( event, result ) {

    clearInterval(interval);

    setTimeout( function() {
        //Adding class to change the background-color
        document.body.className = "active";
    }, 2000 );

    interval = setInterval( function() {
        ipcRenderer.send( 'update-requet' );
    }, 1000 );

    displayMsg();
} );


function scroll() {

    if ( document.body.scrollHeight > window.innerHeight ) {
        if ( !autoScroll ) {
            scrollBtn.style.display = 'block';
        } else {
            window.scrollTo( 0, document.body.scrollHeight );
            scrollPos = document.body.scrollTop;
        }
    }

}

//Giving some delay bewteen Message
function displayMsg() {

    //Removing Oldest Message
    if ( vue_comment.comments.length > 400 ) { //TODO: Make it configurable
        vue_comment.comments.splice( 0, 1 );
    }

    if ( pendingArray.length == 0 ) {
        scroll();
        setTimeout( displayMsg, 200 );
        return false;
    }

    vue_comment.comments.push( pendingArray[ 0 ] );
    pendingArray.splice( 0, 1 );

    scroll();
    setTimeout( displayMsg, 200 );
}
