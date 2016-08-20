/**
 * 消息发送体(含发送目标查询参数、发送消息类型、发送消息内容)
 * Created by xiaodm on 2016/7/15.
 */
import {MessageType} from "./MessageType";

/**
 * 消息发送体
 */
export class MessageInfo {
    //目标属性名称
    targetProName:string;
    //目标属性值
    targetProValues:any[];
    //是否为RegisterInfo内属性
    isRegisterInfoPro:boolean;
    //消息类型
    messageType:MessageType;
    //消息内容
    message:any;

    constructor(targetProName:string, targetProValues:any[], isRegisterInfoPro:boolean, messageType:MessageType, message:any) {
        this.targetProName = targetProName;
        this.targetProValues = targetProValues;
        this.isRegisterInfoPro = isRegisterInfoPro;
        this.messageType = messageType;
        this.message = message;
    }

    messageJsonString() {
        return JSON.stringify(this);
    }

}