const _ = require('lodash');

const ipcMain = require('electron').ipcMain;
const webContents = require('electron').webContents;

var Youtube;
var Facebook;

function methods() {
	this.messageHub = [];
};

/*
methods.prototype.addMsgToMessageHub = function ( comments ) {
	this.messageHub =  _.concat( this.messageHub, comments );
}

methods.prototype.sendMessageToRender = function ( ) {

// this part sorts timestamp of the msg before send to render
	event.sender.send('asynchronous-reply', comments);
}
*/

var self = this;

ipcMain.on('initialization', function (event, arg) {

	//console.log( arg ); //json

	let platfrom = JSON.parse(arg);

	if( platfrom.youtube.length > 0){
		// console.log("youtube started");
		Youtube = require('./platforms/youtube')( platfrom.youtube );
	}

	if( platfrom.facebook.length > 0 ){
		// console.log("facebook started");
		Facebook = require('./platforms/facebook')( platfrom.facebook );
	}


	//send response to mainbrowser
	webContents.getAllWebContents()[0].send('initialization-response');
	webContents.getAllWebContents()[0].focus();

});


ipcMain.on('update-requet', function (event, arg) {


	if (typeof Youtube != 'undefined') {

		Youtube.getComment(function (comments) {
			//console.log(comments);
			//console.log( comments.length);
			event.sender.send('update-reply', comments);
		});

	}

	if (typeof Facebook != 'undefined') {

		Facebook.getComment(function (comments) {
			//console.log(comments);
			//console.log( comments.length);
			event.sender.send('update-reply', comments);
		});

	}

});


module.exports = function () {
	return new methods();
}
