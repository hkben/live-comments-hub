const _ = require( 'lodash' );
const request = require( 'request' );
const settings = require( 'electron-settings' );
const webContents = require('electron').webContents;
const irc = require("irc");

var irc_uri = "irc.chat.twitch.tv";

var instance; //for singleton

function methods( channel ) {

    if ( instance !== undefined ) {
        instance.connention.disconnect();
        instance.api_username = settings.get( 'token.twitchUsername' );
        instance.api_token = settings.get( 'token.twitch' );
        instance.channel = channel;
        return instance;
    }

    this.channel = channel;
    this.connention = null;

    this.api_username = settings.get( 'token.twitchUsername' );
    this.api_token = settings.get( 'token.twitch' );

    // this.connent();

    instance = this;

};

methods.prototype.connent = function() {

    if ( this.api_token == null && this.api_username == null ) {
        return false;
    }

    var self = this;

    var config = {
        channels: [ `#${this.channel}` ],
        username: this.api_username,
        nick: this.api_username.toLowerCase(),
        password: this.api_token,
        sasl: false
    };


    this.connention = new irc.Client( irc_uri, config.nick, config );


    this.connention.addListener( 'error', function( message ) {
        // console.log('error: ', message);
    } );

    // this.connention.addListener( 'ping', function( message ) {
    //     console.log('ping: ', message);
    // } );

    this.connention.addListener( 'raw', function( message ) {

        if ( message.commandType == "normal" ) {
            // console.log( 'raw: ', message );

            // capture 1. username . capture 2. message
            // also checking if PRIVMSG
            var regexp = /(.+)\!.+PRIVMSG.+?:(.+)/g;
            var capture = regexp.exec( message.args[ 0 ] );

            if ( capture ) {
                self.commentsProcess( capture, message.rawCommand );
            }

        }
    } );



    //Start IRC CAP
    this.connention.send( 'CAP REQ', 'twitch.tv/tags' );
}



methods.prototype.commentsProcess = function( messageDetail, rawCommand ) {

    var username = messageDetail[ 1 ];
    var message = messageDetail[ 2 ];

    var rawCommand = rawCommand.replace( '\@', '' );
    rawCommand = rawCommand.split( ";" );

    var msgTag = {};

    for ( key in rawCommand ) {
        var keyValue = rawCommand[ key ].split( "=" );
        msgTag[ keyValue[ 0 ] ] = keyValue[ 1 ];
    }

    if ( msgTag.emotes ) {

        var emotes = parseEmotes( msgTag.emotes );

        var data = {};

        _.forEach( emotes, function( indexGroup, emoteID ) {
            var index = indexGroup[ 0 ];
            var replaceText = message.substring( index[ 0 ], index[ 1 ]+1 );
            data[ emoteID ] = replaceText;
        } );

        _.forEach( data, function( text, emoteID ) {
            var regex = new RegExp(text ,  "g");
            message = message.replace( regex , `<img src="http://static-cdn.jtvnw.net/emoticons/v1/${emoteID}/1.0">` );
        } )
    }


    // badges: 'subscriber/3,bits/1',
    // color: '#0B936D',

    // mod: '0',
    // subscriber: '1',
    // turbo: '0',

    var comments = []

    var comment = {}

    comment.user = username;

    comment.platform = `twitch`;

    // comment.displayName = msgTag[ 'display-name' ];
    // comment.color = msgTag.color;

    comment.message = message;

    comments.push( comment );

    webContents.getAllWebContents()[ 0 ].send( 'update-reply', comments );


}

function parseEmotes( data ) {

    // emotes: '123171:0-11,13-24/1:33-34'

    var emoteData = {};
    var emotes = data.split( "/" );

    for ( var emote_index = 0; emote_index < emotes.length; emote_index++ ) {

        var indexGroup = [];
        var idIndex = emotes[ emote_index ].split( ":" );
        var indexArray = idIndex[ 1 ].split( "," );

        for ( var index = 0; index < indexArray.length; index++ ) {
            indexGroup.push( indexArray[ index ].split( "-" ) );
        }

        emoteData[ idIndex[ 0 ] ] = indexGroup;
    }

    return emoteData;
}

module.exports = function( channel ) {
    return new methods( channel );
}
