/**
 * 消息发送通道
 * Created by xiaodm on 2016/7/1.
 */
import {ClientInfo} from "./ClientInfo";
import {MessageBody} from "./MessageBody";
import {MessageType} from "./MessageType";
import {Util} from "./Util";
import {Clients} from "./Clients";
import udp = require("dgram");
import portConfig = require("../config.json");

export class MessageFactory {


    /**
     * 广播当前客户端注册信息
     */
    registerClient(clientInfo:ClientInfo) {
        this.sendBroadCastMessage(MessageType.OnlineRegister, clientInfo);
        if (portConfig.EnableNoticeConnectStatusToBusiness) {
            this.sendConnectStatusToBusinessServer(clientInfo,1);
        }
    }


    /**
     * 广播当前客户端下线信息
     */
    disconnectClient(clientInfo:ClientInfo) {
        this.sendBroadCastMessage(MessageType.DisConnect, clientInfo);
    }

    /**
     * 广播当前客户端下线信息
     */
    disconnectClientAndLog(clientInfo:ClientInfo) {
        this.sendBroadCastMessage(MessageType.DisConnect, clientInfo);
        if (portConfig.EnableNoticeConnectStatusToBusiness) {
            this.sendConnectStatusToBusinessServer(clientInfo,0);
        }
    }


    /**
     * 广播当前客户端注册信息
     */
    updateClientInfo(clientInfo:ClientInfo) {
        this.sendBroadCastMessage(MessageType.UpdateClientInfo, clientInfo);
    }


    /**
     * 广播自定义消息
     */
    sendBroadCastMessage(messageType:MessageType, messageContent:any) {
        try {
            let messageInfo:MessageBody = new MessageBody(messageType, messageContent);

            let message:string = messageInfo.messageJsonString();
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

            let otherIps:string[] = this.getOtherBroadcastIps();
            if (otherIps.length > 0) {
                this.sendMessageByIps(otherIps, messageType, messageContent);
            }

        } catch (e) {
            console.log(e);
        }
    }

    /**
     * 发送消息到指定目标
     * @param ips 目标ips
     * @param message 消息体
     */
    sendMessageByIps(ips:string[], messageType:MessageType, messageContent:any) {
        let messageInfo:MessageBody = new MessageBody(messageType, messageContent);
        let message:string = messageInfo.messageJsonString();
        if (message.length < 65000) {
            this.sendMessageByIpsWithUDP(ips, message);
        }
        else {
            this.sendMessageByIpsWithTCP(ips, message);
        }
    }

    /**
     * 发送消息到指定目标
     * @param ips 目标ips
     * @param message 消息体
     */
    sendMessageByIpsWithUDP(ips:string[], message:string) {
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
        } catch (e) {
            console.log(e);
        }
    }


    /**
     * 发送消息到指定目标With TCP
     * @param ips 目标ips
     * @param message 消息体
     */
    sendMessageByIpsWithTCP(ips:string[], message:string) {
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
        } catch (e) {
            console.log(e);
        }
    }


    sendConnectStatusToBusinessServer(clientInfo:ClientInfo, type:number) {
        let bsUrl:string = portConfig.BusinessConnectServerUrl;
        if (!bsUrl) {
            console.log("can not find EnableNoticeConnectStatusToBusiness config from config.json");
            return;
        }
        if (type == 0) {
            //logout
            let currentClientIp = Util.getIPAddress();
            clientInfo.ip = currentClientIp;
            let cInfo = Clients.listClient.filter(function (item) {
                return item.ip == currentClientIp;
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
        Util.postDataByRequest(portConfig.BusinessConnectServerUrl,statusData);
    }

    private getOtherBroadcastIps():string[] {
        let ips = [];
        let configOther:any[] = portConfig.otherBroadcastIps;
        if (configOther && configOther.length > 0) {
            for (var i = 0; i < configOther.length; i++) {
                ips = ips.concat(this.getIpsByLastScope(configOther[i].start, configOther[i].end));
            }
        }
        let otherSpecifiedIps:any[] = portConfig.otherBroadcastSpecifiedIps;
        if (otherSpecifiedIps && otherSpecifiedIps.length > 0) {
            ips = ips.concat(otherSpecifiedIps);
        }
        return ips;
    }

    private getIpsByLastScope(start:string, end:string):string[] {
        let ips = [];
        let startNumber = parseInt(start.substring(start.lastIndexOf(".") + 1));
        let endNumber = parseInt(end.substring(end.lastIndexOf(".") + 1));
        let startFront = start.substring(0, start.lastIndexOf(".") + 1);
        for (var i = startNumber; i < endNumber; i++) {
            if (i == 0 || i == 255) {
                continue;
            }
            let cip = startFront + i.toString();
            ips.push(cip);
        }
        return ips;
    }
}