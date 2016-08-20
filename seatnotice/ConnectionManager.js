"use strict";
var MessageType_1 = require("./MessageType");
var Util_1 = require("./Util");
var udp = require("dgram");
var net = require("net");
var portConfig = require("../config.json");
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
        udpReciver.bind(portConfig.broadcastPort, function () {
            console.log('udp start bind port:' + portConfig.broadcastPort);
        });
        udpReciver.on("error", function (err) {
            console.log("server error:\n" + err.stack);
            udpReciver.close();
        });
        udpReciver.on("message", function (msg, rinfo) {
            console.log("server got: " + msg + " from " +
                rinfo.address + ":" + rinfo.port);
            try {
                _this.processSubscriptMessage(msg, rinfo);
            }
            catch (e) {
                console.log(e);
            }
        });
        udpReciver.on("listening", function () {
            var address = udpReciver.address();
            console.log("connect server listening " +
                address.address + ":" + address.port);
        });
    };
    /**
     * 初始化tcp消息接收通道
     */
    ConnectionManager.prototype.initTCPReceive = function () {
        var server = net.createServer();
        var _this = this;
        server.on('connection', function (socket) {
            console.log('got a new tcp connection');
            var fullData = '';
            socket.on('data', function (data) {
                console.log("data length:" + data.length);
                var currentData = data.toString();
                fullData += currentData;
                if (currentData.substring(currentData.length - 1) == "\n") {
                    console.log(' has got full data！');
                    try {
                        _this.processSubscriptMessage(fullData.toString(), null);
                    }
                    catch (e) {
                        console.log(e);
                    }
                    fullData = '';
                }
            });
            socket.on('close', function () {
                console.log('connection closed');
            });
        });
        server.on('error', function (err) {
            console.log('Server error:', err.message);
        });
        server.on('close', function () {
            console.log('Server closed');
        });
        server.listen(portConfig.tcpServerPort);
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
        if (messageInfo.messageType == MessageType_1.MessageType.OnlineRegister
            || messageInfo.messageType == MessageType_1.MessageType.ReplyRegister) {
            this.registerClientInfo(messageInfo, rinfo);
        }
        if (messageInfo.messageType == MessageType_1.MessageType.RequestStatusReply) {
            this.replyCurrentInfo(rinfo);
        }
        if (messageInfo.messageType == MessageType_1.MessageType.UpdateClientInfo) {
            this.updateClientInfo(messageInfo, rinfo);
        }
        if (messageInfo.messageType == MessageType_1.MessageType.DisConnect) {
            this.disconnectClientInfo(rinfo);
        }
        if (messageInfo.messageType == MessageType_1.MessageType.CustomMessage) {
            //1. send message to  biz client 2. save message to file with time（one day per file？）
            var args = [];
            args.push(messageInfo.message.args);
            //回调当前客户端方法
            this.socketio.connections.forEach(function (conn) {
                conn.send(JSON.stringify({
                    "CallbackId": messageInfo.message.callbackId,
                    "Hub": messageInfo.message.hub,
                    "Method": messageInfo.message.method,
                    "Args": args
                }));
            });
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
     * 刷新连接数据,先清空，再发送广播消息，待对方回应
     */
    ConnectionManager.prototype.refreshAllClient = function () {
        this.checkCurrentIp();
        var tempCurrentIp = this.currentClientIp;
        var cInfo = this.listClient.filter(function (item) {
            return item.ip == tempCurrentIp;
        });
        this.listClient = [];
        if (cInfo && cInfo.length > 0) {
            this.listClient.push(cInfo[0]);
        }
        //var clientInfo = new ClientInfo("", "0", "0", "");
        this.messageHub.sendBroadCastMessage(MessageType_1.MessageType.RequestStatusReply, cInfo);
        return true;
    };
    /**
     * 返回所有连接信息的注册信息registerInfo
     * @returns {Array<any>}
     */
    ConnectionManager.prototype.getAllRegisterInfos = function () {
        return this.listClient.map(function (item, index) {
            return item.registerInfo;
        });
    };
    /**
     *  根据属性名和属性值获取目标
     * @param proName  目标属性名字
     * @param proValues 目标属性值集合
     * @param isRegisterInfoPro 是否为自定义的RegisterInfo内属性
     */
    ConnectionManager.prototype.getClientByCondition = function (proNames, proArrayValues, isRegisterInfoPro) {
        return this.listClient.filter(function (item) {
            var match = false;
            for (var i = 0; i < proNames.length; i++) {
                var proValues = proArrayValues[i].split(",");
                if (isRegisterInfoPro) {
                    match = proValues.lastIndexOf(item.registerInfo[proNames[i]]) > -1;
                }
                else {
                    match = proValues.lastIndexOf(item[proNames[i]]) > -1;
                }
                if (!match) {
                    break;
                }
            }
            return match;
        });
    };
    /**
     *  根据属性名和属性值获取目标ip
     * @param proName  目标属性名字
     * @param proValues 目标属性值集合
     * @param isRegisterInfoPro 是否为自定义的RegisterInfo内属性
     */
    ConnectionManager.prototype.getTagetIps = function (proName, proValues, isRegisterInfoPro) {
        var targets = this.getClientByCondition(proName.split(";"), proValues.split(";"), isRegisterInfoPro);
        if (!targets || targets.length < 1)
            return [];
        var ips = targets.map(function (item, index) {
            return item.ip;
        });
        return ips;
    };
    /**
     * 添加客户端信息到集合
     * @param clientInfo
     * @param rinfo
     */
    ConnectionManager.prototype.addClientToList = function (clientInfo, rinfo) {
        if (!clientInfo.isTestClient) {
            clientInfo.ip = rinfo.address;
            clientInfo.port = rinfo.port;
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
        else {
            this.listClient.push(clientInfo);
        }
    };
    /**
     * 修改客户端信息
     * @param clientInfo 客户端信息实体
     */
    ConnectionManager.prototype.updateClientInfo = function (messageInfo, rinfo) {
        var clientInfo = messageInfo.message;
        this.addClientToList(clientInfo, rinfo);
        var args = [];
        args.push(clientInfo);
        //回调当前客户端方法
        this.socketio.connections.forEach(function (conn) {
            conn.send(JSON.stringify({
                "CallbackId": "123",
                "Hub": "SeatStatusHub",
                "Method": "SeatStatusChangeNotice",
                "Args": args
            }));
        });
    };
    /**
     * 注册客户端
     * @param clientInfo 客户端信息实体
     */
    ConnectionManager.prototype.registerClientInfo = function (messageInfo, rinfo) {
        //  clientInfo.resetIPPort(rinfo.address, rinfo.port)
        var clientInfo = messageInfo.message;
        var messageType = messageInfo.messageType;
        this.addClientToList(clientInfo, rinfo);
        this.checkCurrentIp();
        if (clientInfo.ip != this.currentClientIp) {
            if (messageType == MessageType_1.MessageType.OnlineRegister) {
                if (!clientInfo.isTestClient) {
                    //发送当前客户端信息给注册者
                    for (var i = 0; i < this.listClient.length; i++) {
                        if (this.listClient[i].ip == this.currentClientIp) {
                            // send this.listClient[i]  to  clientInfo.ip
                            var targetIps = [clientInfo.ip];
                            this.messageHub.sendMessageByIps(targetIps, MessageType_1.MessageType.ReplyRegister, this.listClient[i]);
                            break;
                        }
                    }
                }
            }
            var args = [];
            args.push(clientInfo);
            //回调当前客户端方法
            this.socketio.connections.forEach(function (conn) {
                conn.send(JSON.stringify({
                    "CallbackId": "123",
                    "Hub": "SeatStatusHub",
                    "Method": "SeatLoginNotice",
                    "Args": args
                }));
            });
        }
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
     * 回复当前客户端信息
     * @param rinfo
     */
    ConnectionManager.prototype.replyCurrentInfo = function (rinfo) {
        this.checkCurrentIp();
        //发送当前客户端信息给注册者
        for (var i = 0; i < this.listClient.length; i++) {
            if (this.listClient[i].ip == this.currentClientIp) {
                // send this.listClient[i]  to  clientInfo.ip
                var targetIps = [rinfo.address];
                this.messageHub.sendMessageByIps(targetIps, MessageType_1.MessageType.ReplyRegister, this.listClient[i]);
                break;
            }
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
            this.socketio.connections.forEach(function (conn) {
                conn.send(JSON.stringify({
                    "CallbackId": "123",
                    "Hub": "SeatStatusHub",
                    "Method": "SeatLoginOff",
                    "Args": [{ "stringext": rinfo.address }]
                }));
            });
        }
    };
    return ConnectionManager;
}());
exports.ConnectionManager = ConnectionManager;
//# sourceMappingURL=ConnectionManager.js.map