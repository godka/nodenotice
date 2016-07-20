"use strict";
/**
 * Created by xiaodm on 2016/7/1.
 */
var ClientInfo_1 = require("../seatnotice/ClientInfo");
var ws = require("nodejs-websocket");
var WebsocketNWHost = (function () {
    function WebsocketNWHost(server, messageHub) {
        this.messageHub = messageHub;
    }
    WebsocketNWHost.prototype.initSocket = function () {
        var _messageHub = this.messageHub;
        var _conn;
        var server = ws.createServer(function (conn) {
            _conn = conn;
            console.log('user connected');
            //send test  text
            var msgObj = {
                "CallbackId": "123",
                "Hub": "TestHub",
                "Method": "OnGetTestMessage",
                "Args": [{ "MessageId": 11, "MessageName": "nametest1" }]
            };
            conn.send(JSON.stringify(msgObj));
            conn.on("text", function (str) {
                console.log("Received " + str);
                conn.sendText(str.toUpperCase() + "!!!");
            });
            conn.on("close", function (code, reason) {
                //发送下线消息,接受消息时会自动获取发送端ip，所以无需赋值
                var clientInfo = new ClientInfo_1.ClientInfo("", "", "0", "");
                _messageHub.disconnectClient(clientInfo);
                console.log('user disconnected');
            });
            conn.on("error", function (error) {
                console.log(error);
            });
        }).listen(3001, function () {
            console.log('ws server listening on port 3001');
        });
        return _conn;
    };
    WebsocketNWHost.prototype.sendMsgToClient = function (msg) {
        this.io.emit(msg);
    };
    return WebsocketNWHost;
}());
exports.WebsocketNWHost = WebsocketNWHost;
//# sourceMappingURL=WebsocketNWHost.js.map