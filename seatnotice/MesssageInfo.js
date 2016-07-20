"use strict";
/**
 * 消息发送体
 */
var MessageInfo = (function () {
    function MessageInfo(targetProName, targetProValues, isRegisterInfoPro, messageType, message) {
        this.targetProName = targetProName;
        this.targetProValues = targetProValues;
        this.isRegisterInfoPro = isRegisterInfoPro;
        this.messageType = messageType;
        this.message = message;
    }
    MessageInfo.prototype.messageJsonString = function () {
        return JSON.stringify(this);
    };
    return MessageInfo;
}());
exports.MessageInfo = MessageInfo;
//# sourceMappingURL=MesssageInfo.js.map