/**
 *  目前未使用socketio的这种方式，连接倒没问题，但c#客户端会出现ping timeout的情况，暂未解决
 *  "ws://127.0.0.1:3000/socket.io/?EIO=2&transport=websocket"
 * Created by xiaodm on 2016/7/1.
 */
import {ClientInfo} from "../seatnotice/ClientInfo";
import {MessageFactory} from "../seatnotice/MessageFactory";
import socketio = require('socket.io');
export class WebsocketSocketioHost {
    server:any;
    io:any;
    messageHub:MessageFactory;

    constructor(server:any, messageHub:MessageFactory) {
        this.server = server;
        this.messageHub = messageHub;
    }

    initSocket() {
        this.io = socketio(this.server);
        var _io = this.io;
        var _messageHub = this.messageHub;
        _io.on('connection', function (socket) {
            console.log('user connected');
            socket.on('message', function(message){
                console.log("Received message: " + message + " - from client " + socket.id);
            });
            socket.on('disconnect', function () {
                //发送下线消息,接受消息时会自动获取发送端ip，所以无需赋值
                //var clientInfo = new ClientInfo("", "", "0", "");
                //_messageHub.disconnectClient(clientInfo);
                //console.log('user disconnected');
            });
        });
        return this.io;
    }


    sendMsgToClient(msg:any) {
        this.io.emit(msg);
    }
}