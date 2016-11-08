/**
 * 消息通道的rest服务
 * Created by xiaodm on 2016/7/16.
 */
"use strict";
var ClientInfo_1 = require("../seatnotice/ClientInfo");
var Util_1 = require("../seatnotice/Util");
var Clients_1 = require("../seatnotice/Clients");
var express = require("express");
var MessageRest = (function () {
    function MessageRest(messageHub, connManager, socketIns) {
        this.messageHub = messageHub;
        this.connManager = connManager;
        this.socketIns = socketIns;
        this.routerConfig(messageHub, connManager, socketIns);
    }
    MessageRest.prototype.routerConfig = function (messageHub, connManager, socketIns) {
        this.router = express.Router();
        /**
         * 注册biz client信息
         * post body为ClientInfo
         */
        this.router.post('/registerClient', function (req, res) {
            //clean all clients before register
            Clients_1.Clients.listClient = [];
            if (!req.body.ip) {
                req.body.ip = Util_1.Util.getIPAddress();
            }
            var clientInfo = new ClientInfo_1.ClientInfo(req.body.name, req.body.ip, req.body.port, req.body.registerInfo, req.body.isTestClient);
            messageHub.registerClient(clientInfo);
            res.json(Util_1.Util.succeed(true));
        });
        /**
         * 注册biz client信息
         * post body为ClientInfo
         */
        this.router.post('/updateRegisterInfo', function (req, res) {
            if (!req.body.ip) {
                req.body.ip = Util_1.Util.getIPAddress();
            }
            var clientInfo = new ClientInfo_1.ClientInfo(req.body.name, req.body.ip, req.body.port, req.body.registerInfo, req.body.isTestClient);
            messageHub.updateClientInfo(clientInfo);
            res.json(Util_1.Util.succeed(true));
        });
        /**
         * 注册biz client信息
         * post body为ClientInfo（只需要name和ip）
         */
        this.router.post('/disconectClient', function (req, res) {
            var clientInfo = new ClientInfo_1.ClientInfo(req.body.name, req.body.ip, "0", "");
            messageHub.disconnectClient(clientInfo);
            res.json(Util_1.Util.succeed(true));
        });
        /**
         * 消息发送
         * post body为MessageInfo
         */
        this.router.post('/sendMessage', function (req, res) {
            var targetIps = connManager.getTagetIps(req.body.targetProName, req.body.targetProValues, req.body.isRegisterInfoPro);
            messageHub.sendMessageByIps(targetIps, req.body.messageType, req.body.message);
            res.json(Util_1.Util.succeed(true));
        });
        /**
         * 消息发送
         * post body为MessageInfo
         */
        this.router.post('/sendMessageToPhone', function (req, res) {
            //var targetIps = connManager.getTagetIps(req.body.targetProName, req.body.targetProValues, req.body.isRegisterInfoPro);
            //  messageHub.sendMessageByIps(targetIps,req.body.messageType,req.body.message);
            console.log("ip:" + getRemoteIp(req));
            try {
                var phoneSocket = socketIns.connections.filter(function (item) {
                    return item.deviceNumber == req.body.extandInfo.deviceNumber;
                });
                //回调phone客户端方法
                if (phoneSocket && phoneSocket.length > 0) {
                    /* phoneSocket[0].send(JSON.stringify({
                     "from": req.body.from,
                     "messageType": req.body.messageType,
                     "message": req.body.message,
                     "fileName": req.body.fileName
                     }));*/
                    phoneSocket.forEach(function (phone) {
                        phone.send(JSON.stringify(req.body));
                    });
                }
            }
            catch (e) {
                console.log(e);
                res.json(Util_1.Util.succeed(false));
            }
            res.json(Util_1.Util.succeed(true));
        });
        var getRemoteIp = function (req) {
            return req.headers['x-forwarded-for'] ||
                req.connection.remoteAddress ||
                req.socket.remoteAddress ||
                req.connection.socket.remoteAddress;
        };
    };
    return MessageRest;
}());
exports.MessageRest = MessageRest;
//# sourceMappingURL=MessageRest.js.map