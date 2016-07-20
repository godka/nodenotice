/**
 * Created by xiaodm on 2016/7/5.
 */
import {MessageType} from "./MessageType";

export class MessageBody {
    messageType:MessageType;
    message:any;

    constructor(messageType:MessageType, message:any) {
        this.messageType = messageType;
        this.message = message;
    }

    messageJsonString() {
        return JSON.stringify(this);
    }
}