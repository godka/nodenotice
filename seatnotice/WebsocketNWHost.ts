/**
 * Created by xiaodm on 2016/7/1.
 */
import {ClientInfo} from "../seatnotice/ClientInfo";
import {MessageFactory} from "../seatnotice/MessageFactory";
import ws = require("nodejs-websocket")
export class WebsocketNWHost {
    server:any;
    io:any;
    messageHub:MessageFactory;

    constructor(server:any, messageHub:MessageFactory) {
        this.messageHub = messageHub;
    }

    initSocket() {
        var _messageHub = this.messageHub;
        var _conn;
        var server = ws.createServer(function (conn) {
            _conn = conn;
            console.log('user connected');
            //send test  text
            var msgObj={
                "CallbackId": "123",
                "Hub": "TestHub",
                "Method": "OnGetTestMessage",
                "Args": [{"MessageId": 11, "MessageName": "nametest1"}]
            };

            conn.send(JSON.stringify(msgObj));
            conn.on("text", function (str) {
                console.log("Received " + str)
                conn.sendText(str.toUpperCase() + "!!!")
            });
            conn.on("close", function (code, reason) {
                //发送下线消息,接受消息时会自动获取发送端ip，所以无需赋值
                var clientInfo = new ClientInfo("", "", "0", "");
                _messageHub.disconnectClient(clientInfo);
                console.log('user disconnected');
            });
            conn.on("error", function (error) {
                console.log(error);
            })
        }).listen(3001,function () {
            console.log('ws server listening on port 3001');
        });

        return _conn;
    }

    sendMsgToClient(msg:any) {
        this.io.emit(msg);
    }
}