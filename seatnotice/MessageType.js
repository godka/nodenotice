"use strict";
/**
 * Created by xiaodm on 2016/7/13.
 */
(function (MessageType) {
    /**
     * 上线注册
     */
    MessageType[MessageType["OnlineRegister"] = 0] = "OnlineRegister";
    /**
     * 回复注册
     */
    MessageType[MessageType["ReplyRegister"] = 1] = "ReplyRegister";
    /**
     * 下线
     */
    MessageType[MessageType["DisConnect"] = 2] = "DisConnect";
    /**
     * 修改属性
     */
    MessageType[MessageType["UpdateClientInfo"] = 3] = "UpdateClientInfo";
    /**
     * 自定义消息发送
     */
    MessageType[MessageType["CustomMessage"] = 4] = "CustomMessage";
    /**
     * 请求响应状态数据
     */
    MessageType[MessageType["RequestStatusReply"] = 5] = "RequestStatusReply";
})(exports.MessageType || (exports.MessageType = {}));
var MessageType = exports.MessageType;
//# sourceMappingURL=MessageType.js.map