/**
 * 消息通道的rest服务
 * Created by xiaodm on 2016/7/16.
 */

import {ClientInfo} from "../seatnotice/ClientInfo";
import {MessageType} from "../seatnotice/MessageType";
import {ConnectionManager} from "../seatnotice/ConnectionManager";
import {MessageFactory} from "../seatnotice/MessageFactory";
import {Util} from "../seatnotice/Util";
import express = require("express");


export class MessageRest {
    messageHub:MessageFactory;
    connManager:ConnectionManager;
    router:any;

    socketIns:any;

    constructor(messageHub:MessageFactory, connManager:ConnectionManager, socketIns:any) {
        this.messageHub = messageHub;
        this.connManager = connManager;
        this.socketIns = socketIns;
        this.routerConfig(messageHub, connManager, socketIns);
    }


    private routerConfig(messageHub:MessageFactory, connManager:ConnectionManager, socketIns:any) {
        this.router = express.Router();
        /**
         * 注册biz client信息
         * post body为ClientInfo
         */
        this.router.post('/registerClient', function (req, res) {
            var clientInfo = new ClientInfo(req.body.name,  req.body.ip, req.body.port, req.body.registerInfo,req.body.isTestClient);
            messageHub.registerClient(clientInfo);
            res.json(Util.succeed(true));
        });

        /**
         * 注册biz client信息
         * post body为ClientInfo
         */
        this.router.post('/updateRegisterInfo', function (req, res) {
            var clientInfo = new ClientInfo(req.body.name, req.body.ip, req.body.port, req.body.registerInfo,req.body.isTestClient);
            messageHub.updateClientInfo(clientInfo);
            res.json(Util.succeed(true));
        });

        /**
         * 注册biz client信息
         * post body为ClientInfo（只需要name和ip）
         */
        this.router.post('/disconectClient', function (req, res) {
            var clientInfo = new ClientInfo(req.body.name, req.body.ip, "0", "");
            messageHub.disconnectClient(clientInfo);
            res.json(Util.succeed(true));
        });

        /**
         * 消息发送
         * post body为MessageInfo
         */
        this.router.post('/sendMessage', function (req, res) {
            var targetIps = connManager.getTagetIps(req.body.targetProName, req.body.targetProValues, req.body.isRegisterInfoPro);
            messageHub.sendMessageByIps(targetIps, req.body.messageType, req.body.message);
            res.json(Util.succeed(true));
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
                let phoneSocket = socketIns.connections.filter(function (item) {
                    return item.deviceNumber == req.body.deviceNumber;
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
            } catch (e) {
                console.log(e);
                res.json(Util.succeed(false));
            }
            res.json(Util.succeed(true));
        });

        var getRemoteIp = function (req) {
            return req.headers['x-forwarded-for'] ||
                req.connection.remoteAddress ||
                req.socket.remoteAddress ||
                req.connection.socket.remoteAddress;
        };
    }
}