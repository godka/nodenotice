"use strict";
/**
 * Created by xiaodm on 2016/7/1.
 */
var ClientInfo_1 = require("../seatnotice/ClientInfo");
var PhoneConnInfo_1 = require("../seatnotice/PhoneConnInfo");
var ws = require("nodejs-websocket");
var portConfig = require("../config.json");
var WebsocketNWHost = (function () {
    function WebsocketNWHost(server, messageHub) {
        //移动客户端列表
        this.listPhone = [];
        this.messageHub = messageHub;
    }
    WebsocketNWHost.prototype.initSocket = function () {
        var _messageHub = this.messageHub;
        var _this = this;
        var server = ws.createServer(function (conn) {
            console.log('user connected');
            conn.on("text", function (dataStr) {
                console.log("Received length" + dataStr.length);
                var data = JSON.parse(dataStr);
                if (data.deviceNumber && data.isFromPhone) {
                    //register phone info
                    this.deviceNumber = data.deviceNumber;
                    this.isFromPhone = data.isFromPhone;
                    var phoneInfo = new PhoneConnInfo_1.PhoneConnInfo(data.deviceNumber, this.key, data.name, "");
                    _this.addDeviceToPhoneList(phoneInfo);
                    return;
                }
                //phone message process
                var ips = data.targetProValues.split(",");
                _messageHub.sendMessageByIps(ips, data.messageType, data.message);
                // console.log("Received " + str);
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
        }).listen(portConfig.websocketPort, function () {
            console.log('ws server listening on port 3001');
        });
        server.on("close", function () {
            var clientInfo = new ClientInfo_1.ClientInfo("", "", "0", "");
            _messageHub.disconnectClient(clientInfo);
        });
        process.on("exit", function (code) {
            var clientInfo = new ClientInfo_1.ClientInfo("", "", "0", "");
            _messageHub.disconnectClient(clientInfo);
        });
        return server;
    };
    /**
     * 添加注册信息
     * @param data
     */
    WebsocketNWHost.prototype.addDeviceToPhoneList = function (phoneInfo) {
        var hasi = -1;
        for (var i = 0; i < this.listPhone.length; i++) {
            if (this.listPhone[i].deviceNumber == phoneInfo.deviceNumber) {
                hasi = i;
                break;
            }
        }
        if (hasi > -1) {
            this.listPhone.splice(hasi, 1, phoneInfo);
        }
        else {
            this.listPhone.push(phoneInfo);
        }
    };
    return WebsocketNWHost;
}());
exports.WebsocketNWHost = WebsocketNWHost;
//# sourceMappingURL=WebsocketNWHost.js.map