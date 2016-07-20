/**
 * 消息通道的rest服务
 * Created by xiaodm on 2016/7/16.
 */
"use strict";
var ClientInfo_1 = require("../seatnotice/ClientInfo");
var express = require("express");
var MessageRest = (function () {
    function MessageRest(messageHub, connManager) {
        this.messageHub = messageHub;
        this.connManager = connManager;
        this.routerConfig(messageHub, connManager);
    }
    MessageRest.prototype.routerConfig = function (messageHub, connManager) {
        this.router = express.Router();
        /**
         * 注册biz client信息
         * post body为ClientInfo
         */
        this.router.post('/registerClient', function (req, res) {
            var clientInfo = new ClientInfo_1.ClientInfo(req.body.name, "0", "0", req.body.registerInfo);
            messageHub.registerClient(clientInfo);
            res.json(true);
        });
        /**
         * 注册biz client信息
         * post body为ClientInfo（只需要name和ip）
         */
        this.router.post('/disconectClient', function (req, res) {
            var clientInfo = new ClientInfo_1.ClientInfo(req.body.name, req.body.ip, "0", "");
            messageHub.disconnectClient(clientInfo);
            res.json(true);
        });
        /**
         * 消息发送
         * post body为MessageInfo
         */
        this.router.post('/sendMessage', function (req, res) {
            var targetIps = connManager.getTagetIps(req.body.targetProName, req.body.targetProValues, req.body.isRegisterInfoPro);
            messageHub.sendMessageByIps(targetIps, req.body.messageType, req.body.message);
            res.json(true);
        });
    };
    return MessageRest;
}());
exports.MessageRest = MessageRest;
//# sourceMappingURL=MessageRest.js.map