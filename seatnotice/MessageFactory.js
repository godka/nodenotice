"use strict";
var MessageBody_1 = require("./MessageBody");
var MessageType_1 = require("./MessageType");
var udp = require("dgram");
var MessageFactory = (function () {
    function MessageFactory() {
        //客户端列表
        this.listClient = [];
    }
    /**
     * 广播当前客户端注册信息
     */
    MessageFactory.prototype.registerClient = function (clientInfo) {
        this.sendBroadCastMessage(MessageType_1.MessageType.OnlineRegister, clientInfo);
    };
    /**
     * 广播当前客户端下线信息
     */
    MessageFactory.prototype.disconnectClient = function (clientInfo) {
        this.sendBroadCastMessage(MessageType_1.MessageType.DisConnect, clientInfo);
    };
    /**
     * 广播自定义消息
     */
    MessageFactory.prototype.sendBroadCastMessage = function (messageType, messageContent) {
        var messageInfo = new MessageBody_1.MessageBody(messageType, messageContent);
        var message = messageInfo.messageJsonString();
        var udpClient = udp.createSocket('udp4');
        udpClient.bind(function () {
            udpClient.setBroadcast(true);
        });
        udpClient.send(message, 0, message.length, 16666, '255.255.255.255', function (err, bytes) {
            if (err) {
                console.log(err);
            }
        });
    };
    /**
     * 发送消息到指定目标
     * @param ips 目标ips
     * @param message 消息体
     */
    MessageFactory.prototype.sendMessageByIps = function (ips, messageType, messageContent) {
        var messageInfo = new MessageBody_1.MessageBody(messageType, messageContent);
        var message = messageInfo.messageJsonString();
        var udpClient = udp.createSocket('udp4');
        for (var i = 0; i < ips.length; i++) {
            udpClient.send(message, 0, message.length, 16666, ips[i], function (err, bytes) {
                if (err) {
                    console.log(err);
                }
            });
        }
    };
    return MessageFactory;
}());
exports.MessageFactory = MessageFactory;
//# sourceMappingURL=MessageFactory.js.map