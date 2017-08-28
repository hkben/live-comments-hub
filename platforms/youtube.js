const _ = require( 'lodash' );
const request = require( 'request' );
const settings = require( 'electron-settings' );

var api_uri = "https://www.googleapis.com/youtube/v3/";

function methods( videoid ) {

    this.videoid = videoid;

    this.lastMsgId = null;
    this.api_token = settings.get( 'token.google' ); //config
    this.liveStreamingDetails = [];
    this.first_run = true;

    var self = this;

    this.getLiveDetail( function( detailData ) {
        if ( detailData ) {
            self.liveStreamingDetails = detailData;
            // console.log( self.liveStreamingDetails );
        }
    } );

};

methods.prototype.getLiveDetail = function( callback ) {

    //TODO : More checking ?
    if ( this.api_token == null ) {
        return false;
    }

    var qs = {
        id: this.videoid,
        key: this.api_token,
        part: "snippet,liveStreamingDetails"
    }

    request( {
        url: `${api_uri}videos`,
        qs: qs
    }, function( error, response, body ) {

        if ( !body.error ) {

            data = JSON.parse( body );

            if ( data.items[ 0 ] ) {
                return callback( data.items[ 0 ].liveStreamingDetails );
            } else {
                return callback( false );
            }
        }

        return callback( false );
    } );

}



methods.prototype.getComment = function( callback ) {

    //TODO : More checking ?
    if ( this.liveStreamingDetails == null ) {
        return false;
    }

    var data;
    var self = this;

    var qs = {
        liveChatId: this.liveStreamingDetails.activeLiveChatId,
        maxResults: 500,
        part: "id,snippet,authorDetails",
        key: this.api_token
    }

    request( {
        url: `${api_uri}liveChat/messages`,
        qs: qs
    }, function( error, response, body ) {
        if ( !error ) {
            data = JSON.parse( body );

            if ( data ) {
                var result = self.commentsProcess( data )
                return callback( result );
            }
        }
        return callback( false );
    } );
}

methods.prototype.commentsProcess = function( data ) {

    var array = [];
    var newMsgFlag;

    if ( typeof data == 'undefined' || data.error ) {
        return false;
    }

    if ( this.first_run ) {
        var last = _.last( data.items );
        this.lastMsgId = last.id;
        this.first_run = false;
        return false;
    }

    for ( var i in data.items ) {

        var currentItem = data.items[ i ];
        var comment = {};

        comment.id = currentItem.id;

        if ( this.lastMsgId ) {
            if ( comment.id == this.lastMsgId ) {
                newMsgFlag = true;
                continue;
            }
        } else {
            newMsgFlag = true;
        }

        if ( !newMsgFlag ) {
            continue;
        }

        comment.user = currentItem.authorDetails.displayName;
        comment.userImage = currentItem.authorDetails.profileImageUrl;

        comment.userisVerified = currentItem.authorDetails.isVerified;
        comment.userisChatOwner = currentItem.authorDetails.isChatOwner;
        comment.userisChatSponsor = currentItem.authorDetails.isChatSponsor;
        comment.userisChatModerator = currentItem.authorDetails.isChatModerator;


        comment.platform = `youtube`;

        comment.message = currentItem.snippet.displayMessage;
        comment.timestamp = currentItem.snippet.publishedAt;

        comment.type = currentItem.snippet.type;

        if ( comment.type == "superChatEvent" ) {
            comment.amountDisplayString = currentItem.snippet.superChatDetails.amountDisplayString;
            comment.userComment = currentItem.snippet.superChatDetails.userComment;
        }

        array.push( comment );
    }

    //console.log(this.lastMsgId);
    //console.log(array.length);

    if ( currentItem ) {
        this.lastMsgId = currentItem.id;
        return array;
    } else {
        return false;
    }
}

module.exports = function( videoid ) {
    return new methods( videoid );
}
