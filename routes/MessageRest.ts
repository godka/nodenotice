/**
 * 消息通道的rest服务
 * Created by xiaodm on 2016/7/16.
 */

import {ClientInfo} from "../seatnotice/ClientInfo";
import {MessageType} from "../seatnotice/MessageType";
import {ConnectionManager} from "../seatnotice/ConnectionManager";
import {MessageFactory} from "../seatnotice/MessageFactory";
import express = require("express");

export class MessageRest {
    messageHub:MessageFactory;
    connManager:ConnectionManager;
    router:any;

    constructor(messageHub:MessageFactory, connManager:ConnectionManager) {
        this.messageHub = messageHub;
        this.connManager = connManager;
        this.routerConfig(messageHub,connManager);
    }


    private routerConfig(messageHub:MessageFactory, connManager:ConnectionManager)
    {
        this.router = express.Router();
        /**
         * 注册biz client信息
         * post body为ClientInfo
         */
        this.router.post('/registerClient', function (req, res) {
            var clientInfo = new ClientInfo(req.body.name, "0", "0", req.body.registerInfo);
            messageHub.registerClient(clientInfo);
            res.json(true);
        });

        /**
         * 注册biz client信息
         * post body为ClientInfo（只需要name和ip）
         */
        this.router.post('/disconectClient', function (req, res) {
            var clientInfo = new ClientInfo(req.body.name, req.body.ip, "0", "");
            messageHub.disconnectClient(clientInfo);
            res.json(true);
        });

        /**
         * 消息发送
         * post body为MessageInfo
         */
        this.router.post('/sendMessage', function (req, res) {
            var targetIps = connManager.getTagetIps(req.body.targetProName, req.body.targetProValues, req.body.isRegisterInfoPro);
            messageHub.sendMessageByIps(targetIps,req.body.messageType,req.body.message);
            res.json(true);
        });
    }
}