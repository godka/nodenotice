"use strict";
var MessageType_1 = require("./MessageType");
var Util_1 = require("./Util");
var udp = require("dgram");
var ConnectionManager = (function () {
    function ConnectionManager(messageHub, socketio) {
        //客户端列表
        this.listClient = [];
        this.messageHub = messageHub;
        this.socketio = socketio;
        this.currentClientIp = Util_1.Util.getIPAddress();
    }
    /**
     * 初始化udp消息订阅通道
     */
    ConnectionManager.prototype.initReceive = function () {
        var udpReciver = udp.createSocket('udp4');
        var _this = this;
        udpReciver.bind(16666, function () {
            console.log('服务端启动成功');
        });
        udpReciver.on("error", function (err) {
            console.log("server error:\n" + err.stack);
            udpReciver.close();
        });
        udpReciver.on("message", function (msg, rinfo) {
            _this.processSubscriptMessage(msg, rinfo);
            console.log("server got: " + msg + " from " +
                rinfo.address + ":" + rinfo.port);
        });
        udpReciver.on("listening", function () {
            var address = udpReciver.address();
            console.log("connect server listening " +
                address.address + ":" + address.port);
        });
    };
    /**
     * 订阅消息处理器
     * @param message
     * @param rinfo
     */
    ConnectionManager.prototype.processSubscriptMessage = function (message, rinfo) {
        if (!message || message.length < 1) {
            return;
        }
        var messageInfo = JSON.parse(message);
        if (messageInfo.messageType == MessageType_1.MessageType.OnlineRegister) {
            this.registerClientInfo(messageInfo.message, rinfo);
        }
        if (messageInfo.messageType == MessageType_1.MessageType.DisConnect) {
            this.disconnectClientInfo(rinfo);
        }
        if (messageInfo.messageType == MessageType_1.MessageType.CustomMessage) {
            //1. send message to  biz client 2. save message to file with time（one day per file？）
            console.log("receve CustomMessage:" + messageInfo.message);
        }
    };
    /**
     * 返回所有连接信息
     * @returns {Array<ClientInfo>}
     */
    ConnectionManager.prototype.getAllClient = function () {
        return this.listClient;
    };
    /**
     *  根据属性名和属性值获取目标
     * @param proName  目标属性名字
     * @param proValues 目标属性值集合
     * @param isRegisterInfoPro 是否为自定义的RegisterInfo内属性
     */
    ConnectionManager.prototype.getClientByCondition = function (proName, proValues, isRegisterInfoPro) {
        return this.listClient.filter(function (item) {
            if (isRegisterInfoPro) {
                return proValues.lastIndexOf(item.registerInfo[proName]) > -1;
            }
            else {
                return proValues.lastIndexOf(item[proName]) > -1;
            }
        });
    };
    /**
     *  根据属性名和属性值获取目标ip
     * @param proName  目标属性名字
     * @param proValues 目标属性值集合
     * @param isRegisterInfoPro 是否为自定义的RegisterInfo内属性
     */
    ConnectionManager.prototype.getTagetIps = function (proName, proValues, isRegisterInfoPro) {
        var targets = this.getClientByCondition(proName, proValues, isRegisterInfoPro);
        if (!targets || targets.length < 1)
            return [];
        var ips = targets.map(function (item, index) {
            return item.ip;
        });
        return ips;
    };
    /**
     * 注册客户端
     * @param clientInfo 客户端信息实体
     */
    ConnectionManager.prototype.registerClientInfo = function (clientInfo, rinfo) {
        //  clientInfo.resetIPPort(rinfo.address, rinfo.port)
        clientInfo.ip = rinfo.address;
        clientInfo.port = rinfo.port;
        if (this.listClient.length < 1) {
            this.listClient.push(clientInfo);
        }
        var hasi = -1;
        for (var i = 0; i < this.listClient.length; i++) {
            if (this.listClient[i].ip == clientInfo.ip) {
                hasi = i;
                break;
            }
        }
        if (hasi > -1) {
            this.listClient.splice(hasi, 1, clientInfo);
        }
        this.checkCurrentIp();
        if (clientInfo.ip != this.currentClientIp) {
            //发送当前客户端信息给注册者
            for (var i = 0; i < this.listClient.length; i++) {
                if (this.listClient[i].ip == this.currentClientIp) {
                    // send this.listClient[i]  to  clientInfo.ip
                    var targetIps = [clientInfo.ip];
                    this.messageHub.sendMessageByIps(targetIps, MessageType_1.MessageType.OnlineRegister, this.listClient[i]);
                    break;
                }
            }
            var args = [];
            args.push(JSON.stringify(clientInfo.registerInfo));
            //回调当前客户端方法
            this.socketio.send(JSON.stringify({
                "CallbackId": "123",
                "Hub": "SeatStatusHub",
                "Method": "SeatLoginNotice",
                "Args": args
            }));
        }
        console.log(this.listClient);
    };
    /**
     * 检查当前客户端ip
     */
    ConnectionManager.prototype.checkCurrentIp = function () {
        if (!this.currentClientIp) {
            this.currentClientIp = Util_1.Util.getIPAddress();
        }
    };
    /**
     * 客户端下线
     * @param rinfo
     */
    ConnectionManager.prototype.disconnectClientInfo = function (rinfo) {
        var hasi = [];
        for (var i = 0; i < this.listClient.length; i++) {
            if (this.listClient[i].ip == rinfo.address) {
                hasi.push(i);
            }
        }
        if (hasi.length > 0) {
            for (var i = 0; i < hasi.length; i++) {
                this.listClient.splice(hasi[i], 1);
            }
        }
        if (rinfo.address != this.currentClientIp) {
            //回调当前客户端方法
            this.socketio.send(JSON.stringify({
                "CallbackId": "123",
                "Hub": "SeatStatusHub",
                "Method": "SeatLoginOff",
                "Args": rinfo.address
            }));
        }
    };
    return ConnectionManager;
}());
exports.ConnectionManager = ConnectionManager;
//# sourceMappingURL=ConnectionManager.js.map