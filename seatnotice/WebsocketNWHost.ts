/**
 * Created by xiaodm on 2016/7/1.
 */
import {ClientInfo} from "../seatnotice/ClientInfo";
import {MessageFactory} from "../seatnotice/MessageFactory";
import {PhoneConnInfo} from "../seatnotice/PhoneConnInfo";
import ws = require("nodejs-websocket");
import portConfig = require("../config.json");

export class WebsocketNWHost {
    server:any;
    io:any;
    messageHub:MessageFactory;

    //移动客户端列表
    listPhone:Array<PhoneConnInfo> = [];

    constructor(server:any, messageHub:MessageFactory) {
        this.messageHub = messageHub;
    }

    initSocket() {
        var _messageHub = this.messageHub;
        var _this = this;
        var server = ws.createServer(function (conn) {
            console.log('user connected');
            conn.on("text", function (dataStr) {

                console.log("Received length" + dataStr.length);

                var data = JSON.parse(dataStr);
                if (data.deviceNumber && data.isFromPhone) {
                    //register phone info
                    this.deviceNumber = data.deviceNumber;
                    this.isFromPhone = data.isFromPhone;
                    var phoneInfo = new PhoneConnInfo(data.deviceNumber, this.key, data.name, "");
                    _this.addDeviceToPhoneList(phoneInfo);
                    return;
                }
                //phone message process
                var ips = data.targetProValues.split(",");
                _messageHub.sendMessageByIps(ips, data.messageType, data.message);
                // console.log("Received " + str);
            });
            conn.on("close", function (code, reason) {
                //发送下线消息,接受消息时会自动获取发送端ip，所以无需赋值
                var clientInfo = new ClientInfo("", "", "0", "");
                _messageHub.disconnectClientAndLog(clientInfo);
                console.log('user disconnected');
            });
            conn.on("error", function (error) {
                console.log(error);
            })
        }).listen(portConfig.websocketPort, function () {
            console.log('ws server listening on port 3001');
        });

        server.on("close", function () {
            var clientInfo = new ClientInfo("", "", "0", "");
            _messageHub.disconnectClientAndLog(clientInfo);
        });

        process.on("exit", function (code) {
            var clientInfo = new ClientInfo("", "", "0", "");
            _messageHub.disconnectClientAndLog(clientInfo);
        });

        return server;
    }


    /**
     * 添加注册信息
     * @param data
     */
    private addDeviceToPhoneList(phoneInfo:PhoneConnInfo) {
        var hasi = -1;
        for (var i = 0; i < this.listPhone.length; i++) {
            if (this.listPhone[i].deviceNumber == phoneInfo.deviceNumber) {
                hasi = i;
                break;
            }
        }
        if (hasi > -1) {
            this.listPhone.splice(hasi, 1, phoneInfo);
        }
        else {
            this.listPhone.push(phoneInfo);
        }
    }
}