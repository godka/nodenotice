/**
 * 消息接收处理器，持有连接
 * Created by xiaodm on 2016/7/1.
 */
import {MessageFactory} from "./MessageFactory";
import {ClientInfo} from "./ClientInfo";
import {MessageBody} from "./MessageBody";
import {MessageType} from "./MessageType";
import {Util} from "./Util";
import udp = require("dgram");
import net = require("net");

import portConfig = require("../config.json");

export class ConnectionManager {

    //客户端列表
    listClient:Array<ClientInfo> = [];

    udpClient:any;
    //消息处理器
    messageHub:MessageFactory;

    //当前客户端的ip
    currentClientIp:string;

    //socketio对象
    socketio:any;

    constructor(messageHub:MessageFactory, socketio:any) {
        this.messageHub = messageHub;
        this.socketio = socketio;
        this.currentClientIp = Util.getIPAddress();
    }

    /**
     * 初始化udp消息订阅通道
     */
    initReceive() {

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
            } catch (e) {
                console.log(e);
            }
        });
        udpReciver.on("listening", function () {
            var address = udpReciver.address();
            console.log("connect server listening " +
                address.address + ":" + address.port);
        });
    }

    /**
     * 初始化tcp消息接收通道
     */
    initTCPReceive() {
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
                    } catch (e) {
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
    }


    /**
     * 订阅消息处理器
     * @param message
     * @param rinfo
     */
    processSubscriptMessage(message:string, rinfo:any) {
        if (!message || message.length < 1) {
            return;
        }
        let messageInfo:MessageBody = JSON.parse(message);
        if (messageInfo.messageType == MessageType.OnlineRegister
            || messageInfo.messageType == MessageType.ReplyRegister) {
            this.registerClientInfo(messageInfo, rinfo);
        }
        if (messageInfo.messageType == MessageType.RequestStatusReply) {
            this.replyCurrentInfo(rinfo);
        }
        if (messageInfo.messageType == MessageType.UpdateClientInfo) {
            this.updateClientInfo(messageInfo, rinfo);
        }
        if (messageInfo.messageType == MessageType.DisConnect) {
            this.disconnectClientInfo(rinfo);
        }
        if (messageInfo.messageType == MessageType.CustomMessage) {
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
            console.log("receve CustomMessage:" + messageInfo.message)
        }
    }

    /**
     * 返回所有连接信息
     * @returns {Array<ClientInfo>}
     */
    getAllClient():Array<ClientInfo> {
        return this.listClient;
    }

    /**
     * 刷新连接数据,先清空，再发送广播消息，待对方回应
     */
    refreshAllClient() {
        this.checkCurrentIp();
        let tempCurrentIp = this.currentClientIp;
        let cInfo = this.listClient.filter(function (item) {
            return item.ip == tempCurrentIp;
        });
        this.listClient = [];
        if (cInfo && cInfo.length > 0) {
            this.listClient.push(cInfo[0]);
        }
        //var clientInfo = new ClientInfo("", "0", "0", "");
        this.messageHub.sendBroadCastMessage(MessageType.RequestStatusReply, cInfo);
        return true;
    }

    /**
     * 返回所有连接信息的注册信息registerInfo
     * @returns {Array<any>}
     */
    getAllRegisterInfos():Array<any> {
        return this.listClient.map(function (item, index) {
            return item.registerInfo;
        });
    }


    /**
     *  根据属性名和属性值获取目标
     * @param proName  目标属性名字
     * @param proValues 目标属性值集合
     * @param isRegisterInfoPro 是否为自定义的RegisterInfo内属性
     */
    getClientByCondition(proNames:string[], proArrayValues:any[], isRegisterInfoPro:boolean):Array<ClientInfo> {

        return this.listClient.filter(function (item) {
            let match = false;
            for (var i = 0; i < proNames.length; i++) {
                let proValues = proArrayValues[i].split(",");
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
    }

    /**
     *  根据属性名和属性值获取目标ip
     * @param proName  目标属性名字
     * @param proValues 目标属性值集合
     * @param isRegisterInfoPro 是否为自定义的RegisterInfo内属性
     */
    getTagetIps(proName:string, proValues:string, isRegisterInfoPro:boolean):string[] {

        let targets = this.getClientByCondition(proName.split(";"), proValues.split(";"), isRegisterInfoPro);
        if (!targets || targets.length < 1)
            return [];
        let ips:string[] = targets.map(function (item, index) {
            return item.ip;
        });
        return ips;
    }


    /**
     * 添加客户端信息到集合
     * @param clientInfo
     * @param rinfo
     */
    private  addClientToList(clientInfo:ClientInfo, rinfo:any) {
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
    }


    /**
     * 修改客户端信息
     * @param clientInfo 客户端信息实体
     */
    private updateClientInfo(messageInfo:MessageBody, rinfo:any) {
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
    }

    /**
     * 注册客户端
     * @param clientInfo 客户端信息实体
     */
    private registerClientInfo(messageInfo:MessageBody, rinfo:any) {
        //  clientInfo.resetIPPort(rinfo.address, rinfo.port)
        var clientInfo = messageInfo.message;
        var messageType = messageInfo.messageType;

        this.addClientToList(clientInfo, rinfo);

        this.checkCurrentIp();
        if (clientInfo.ip != this.currentClientIp) {
            if (messageType == MessageType.OnlineRegister) {
                if(!clientInfo.isTestClient) {
                    //发送当前客户端信息给注册者
                    for (var i = 0; i < this.listClient.length; i++) {
                        if (this.listClient[i].ip == this.currentClientIp) {
                            // send this.listClient[i]  to  clientInfo.ip
                            var targetIps = [clientInfo.ip];
                            this.messageHub.sendMessageByIps(targetIps, MessageType.ReplyRegister, this.listClient[i]);
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
    }


    /**
     * 检查当前客户端ip
     */
    private checkCurrentIp() {
        if (!this.currentClientIp) {
            this.currentClientIp = Util.getIPAddress();
        }
    }

    /**
     * 回复当前客户端信息
     * @param rinfo
     */
    private  replyCurrentInfo(rinfo:any) {
        this.checkCurrentIp();

        //发送当前客户端信息给注册者
        for (var i = 0; i < this.listClient.length; i++) {
            if (this.listClient[i].ip == this.currentClientIp) {
                // send this.listClient[i]  to  clientInfo.ip
                var targetIps = [rinfo.address];
                this.messageHub.sendMessageByIps(targetIps, MessageType.ReplyRegister, this.listClient[i]);
                break;
            }

        }
    }

    /**
     * 客户端下线
     * @param rinfo
     */
    private  disconnectClientInfo(rinfo:any) {
        var hasi = [];
        for (var i = 0; i < this.listClient.length; i++) {
            if (this.listClient[i].ip == rinfo.address) {
                hasi.push(i)
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
                    "Args": [{"stringext": rinfo.address}]
                }));
            });
        }
    }
}