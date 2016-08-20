"use strict";
var socketio = require('socket.io');
var WebsocketSocketioHost = (function () {
    function WebsocketSocketioHost(server, messageHub) {
        this.server = server;
        this.messageHub = messageHub;
    }
    WebsocketSocketioHost.prototype.initSocket = function () {
        this.io = socketio(this.server);
        var _io = this.io;
        var _messageHub = this.messageHub;
        _io.on('connection', function (socket) {
            console.log('user connected');
            socket.on('message', function (message) {
                console.log("Received message: " + message + " - from client " + socket.id);
            });
            socket.on('disconnect', function () {
                //发送下线消息,接受消息时会自动获取发送端ip，所以无需赋值
                //var clientInfo = new ClientInfo("", "", "0", "");
                //_messageHub.disconnectClient(clientInfo);
                //console.log('user disconnected');
            });
        });
        return this.io;
    };
    WebsocketSocketioHost.prototype.sendMsgToClient = function (msg) {
        this.io.emit(msg);
    };
    return WebsocketSocketioHost;
}());
exports.WebsocketSocketioHost = WebsocketSocketioHost;
//# sourceMappingURL=WebsocketSocketioHost.js.map