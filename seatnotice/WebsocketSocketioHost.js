"use strict";
/**
 *  目前未使用socketio的这种方式，连接倒没问题，但c#客户端会出现ping timeout的情况，暂未解决
 *  "ws://127.0.0.1:3000/socket.io/?EIO=2&transport=websocket"
 * Created by xiaodm on 2016/7/1.
 */
var ClientInfo_1 = require("../seatnotice/ClientInfo");
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
            //test messsage
            _io.emit({
                "CallbackId": "123",
                "Hub": "TestHub",
                "Method": "OnGetTestMessage",
                "Args": [{ "MessageId": 11, "MessageName": "nametest1" }]
            });
            socket.on('message', function (message) {
                console.log("Received message: " + message + " - from client " + socket.id);
            });
            socket.on('disconnect', function () {
                //发送下线消息,接受消息时会自动获取发送端ip，所以无需赋值
                var clientInfo = new ClientInfo_1.ClientInfo("", "", "0", "");
                _messageHub.disconnectClient(clientInfo);
                console.log('user disconnected');
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