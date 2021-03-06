"use strict";
var MessageBody_1 = require("./MessageBody");
var MessageType_1 = require("./MessageType");
var Util_1 = require("./Util");
var Clients_1 = require("./Clients");
var udp = require("dgram");
var portConfig = require("../config.json");
var MessageFactory = (function () {
    function MessageFactory() {
    }
    /**
     * 广播当前客户端注册信息
     */
    MessageFactory.prototype.registerClient = function (clientInfo) {
        this.sendBroadCastMessage(MessageType_1.MessageType.OnlineRegister, clientInfo);
        if (portConfig.EnableNoticeConnectStatusToBusiness) {
            this.sendConnectStatusToBusinessServer(clientInfo, 1);
        }
    };
    /**
     * 广播当前客户端下线信息
     */
    MessageFactory.prototype.disconnectClient = function (clientInfo) {
        this.sendBroadCastMessage(MessageType_1.MessageType.DisConnect, clientInfo);
    };
    /**
     * 广播当前客户端下线信息
     */
    MessageFactory.prototype.disconnectClientAndLog = function (clientInfo) {
        this.sendBroadCastMessage(MessageType_1.MessageType.DisConnect, clientInfo);
        if (portConfig.EnableNoticeConnectStatusToBusiness) {
            this.sendConnectStatusToBusinessServer(clientInfo, 0);
        }
    };
    /**
     * 广播当前客户端注册信息
     */
    MessageFactory.prototype.updateClientInfo = function (clientInfo) {
        this.sendBroadCastMessage(MessageType_1.MessageType.UpdateClientInfo, clientInfo);
    };
    /**
     * 广播自定义消息
     */
    MessageFactory.prototype.sendBroadCastMessage = function (messageType, messageContent) {
        try {
            var messageInfo = new MessageBody_1.MessageBody(messageType, messageContent);
            var message = messageInfo.messageJsonString();
            var msgBuffer = new Buffer(message, "UTF-8");
            var udpClient = udp.createSocket('udp4');
            udpClient.bind(function () {
                udpClient.setBroadcast(true);
            });
            console.log("msgBuffer.length:" + msgBuffer.length);
            if (!portConfig.noBroadcastCurrentNetworkSegment) {
                udpClient.send(msgBuffer, 0, msgBuffer.length, portConfig.broadcastPort, portConfig.broadcastIp, function (err, bytes) {
                    if (err) {
                        console.log(err);
                    }
                });
            }
            var otherIps = this.getOtherBroadcastIps();
            if (otherIps.length > 0) {
                this.sendMessageByIps(otherIps, messageType, messageContent);
            }
        }
        catch (e) {
            console.log(e);
        }
    };
    /**
     * 发送消息到指定目标
     * @param ips 目标ips
     * @param message 消息体
     */
    MessageFactory.prototype.sendMessageByIps = function (ips, messageType, messageContent) {
        var messageInfo = new MessageBody_1.MessageBody(messageType, messageContent);
        var message = messageInfo.messageJsonString();
        if (message.length < 65000) {
            this.sendMessageByIpsWithUDP(ips, message);
        }
        else {
            this.sendMessageByIpsWithTCP(ips, message);
        }
    };
    /**
     * 发送消息到指定目标
     * @param ips 目标ips
     * @param message 消息体
     */
    MessageFactory.prototype.sendMessageByIpsWithUDP = function (ips, message) {
        try {
            var msgBuffer = new Buffer(message, "UTF-8");
            var udpClient = udp.createSocket('udp4');
            for (var i = 0; i < ips.length; i++) {
                udpClient.send(msgBuffer, 0, msgBuffer.length, portConfig.broadcastPort, ips[i], function (err, bytes) {
                    if (err) {
                        console.log(err);
                    }
                });
            }
        }
        catch (e) {
            console.log(e);
        }
    };
    /**
     * 发送消息到指定目标With TCP
     * @param ips 目标ips
     * @param message 消息体
     */
    MessageFactory.prototype.sendMessageByIpsWithTCP = function (ips, message) {
        try {
            var net = require('net');
            for (var i = 0; i < ips.length; i++) {
                var client = new net.Socket();
                //端口号 + 服务器的IP
                client.connect(portConfig.tcpServerPort, ips[i], function () {
                    console.log('connect to  server');
                });
                client.write(message);
                //使用换行符做为结束符号
                client.write("\n");
                client.end();
            }
        }
        catch (e) {
            console.log(e);
        }
    };
    MessageFactory.prototype.sendConnectStatusToBusinessServer = function (clientInfo, type) {
        var bsUrl = portConfig.BusinessConnectServerUrl;
        if (!bsUrl) {
            console.log("can not find EnableNoticeConnectStatusToBusiness config from config.json");
            return;
        }
        if (type == 0) {
            //logout
            var currentClientIp_1 = Util_1.Util.getIPAddress();
            clientInfo.ip = currentClientIp_1;
            var cInfo = Clients_1.Clients.listClient.filter(function (item) {
                return item.ip == currentClientIp_1;
            });
            if (cInfo && cInfo.length > 0) {
                clientInfo = cInfo[0];
            }
        }
        // the best way  is only send registerInfo to business, but now hard code below:::
        var statusData = {
            personInfoId: clientInfo.registerInfo.orgPersonId,
            personInfoName: clientInfo.registerInfo.orgPersonName,
            type: type,
            centerCode: clientInfo.registerInfo.centerCode,
            roleId: clientInfo.registerInfo.roleId,
            seatId: clientInfo.registerInfo.seatId
        };
        //Util.postData(host, port, path, statusData);
        Util_1.Util.postDataByRequest(portConfig.BusinessConnectServerUrl, statusData);
    };
    MessageFactory.prototype.getOtherBroadcastIps = function () {
        var ips = [];
        var configOther = portConfig.otherBroadcastIps;
        if (configOther && configOther.length > 0) {
            for (var i = 0; i < configOther.length; i++) {
                ips = ips.concat(this.getIpsByLastScope(configOther[i].start, configOther[i].end));
            }
        }
        var otherSpecifiedIps = portConfig.otherBroadcastSpecifiedIps;
        if (otherSpecifiedIps && otherSpecifiedIps.length > 0) {
            ips = ips.concat(otherSpecifiedIps);
        }
        return ips;
    };
    MessageFactory.prototype.getIpsByLastScope = function (start, end) {
        var ips = [];
        var startNumber = parseInt(start.substring(start.lastIndexOf(".") + 1));
        var endNumber = parseInt(end.substring(end.lastIndexOf(".") + 1));
        var startFront = start.substring(0, start.lastIndexOf(".") + 1);
        for (var i = startNumber; i < endNumber; i++) {
            if (i == 0 || i == 255) {
                continue;
            }
            var cip = startFront + i.toString();
            ips.push(cip);
        }
        return ips;
    };
    return MessageFactory;
}());
exports.MessageFactory = MessageFactory;
//# sourceMappingURL=MessageFactory.js.map