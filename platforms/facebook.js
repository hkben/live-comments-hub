const _ = require( 'lodash' );
const request = require( 'request' );
const settings = require( 'electron-settings' );

var api_uri = "https://graph.facebook.com/v2.9/";

function methods( videoid ) {

    this.lastMsgId = null;
    this.videoid = videoid;
    this.api_token = settings.get( 'token.facebook' );

};

methods.prototype.getComment = function( callback ) {

    //TODO : More checking ?
    if ( this.api_token == null ) {
        return false;
    }

    var self = this;

    var qs = {
        fields: "message,from,created_time",
        order: "reverse_chronological",
        limit: 100,
        live_filter: "no_filter",
        access_token: this.api_token
    }

    request( {
        url: `${api_uri}${this.videoid}/comments`,
        qs: qs
    }, function( error, response, body ) {



        if ( !body.error ) {
            data = JSON.parse( body );


            if ( data ) {
                var result = self.commentsProcess( data.data )
                return callback( result );
            }

        }

        return callback();

    } );

}

methods.prototype.commentsProcess = function( data ) {

    _.reverse( data );

    var array = [];

    var newMsgFlag;

    if ( typeof data == "undefined" ) {
        return false;
    }

    for ( var i in data ) {

        var currentItem = data[ i ];
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

        if ( newMsgFlag != true ) {
            continue;
        }

        comment.user = currentItem.from.name;
        comment.userImage = `http://graph.facebook.com/${currentItem.from.id}/picture?type=square`;

        comment.platform = `facebook`;

        comment.message = currentItem.message;
        comment.timestamp = currentItem.created_time;

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
