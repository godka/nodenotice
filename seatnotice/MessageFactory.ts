/**
 * 消息发送通道
 * Created by xiaodm on 2016/7/1.
 */
import {ClientInfo} from "./ClientInfo";
import {MessageBody} from "./MessageBody";
import {MessageType} from "./MessageType";

import udp = require("dgram");

export class MessageFactory {

    //客户端列表
    listClient:Array<ClientInfo> = [];

    udpClient:any;


    /**
     * 广播当前客户端注册信息
     */
    registerClient(clientInfo:ClientInfo) {
        this.sendBroadCastMessage(MessageType.OnlineRegister, clientInfo);
    }


    /**
     * 广播当前客户端下线信息
     */
    disconnectClient(clientInfo:ClientInfo) {
        this.sendBroadCastMessage(MessageType.DisConnect, clientInfo);
    }

    /**
     * 广播自定义消息
     */
    sendBroadCastMessage(messageType:MessageType, messageContent:any) {

        let messageInfo:MessageBody = new MessageBody(messageType, messageContent);

        let message:string = messageInfo.messageJsonString();

        var udpClient = udp.createSocket('udp4');
        udpClient.bind(function () {
            udpClient.setBroadcast(true);
        });
        udpClient.send(message, 0, message.length, 16666, '255.255.255.255', function (err, bytes) {
            if (err) {
                console.log(err);
            }
        });
    }


    /**
     * 发送消息到指定目标
     * @param ips 目标ips
     * @param message 消息体
     */
    sendMessageByIps(ips:string[], messageType:MessageType, messageContent:any) {
        let messageInfo:MessageBody = new MessageBody(messageType, messageContent);

        let message:string = messageInfo.messageJsonString();

        var udpClient = udp.createSocket('udp4');

        for (var i = 0; i < ips.length; i++) {
            udpClient.send(message, 0, message.length, 16666, ips[i], function (err, bytes) {
                if (err) {
                    console.log(err);
                }
            });
        }
    }
}