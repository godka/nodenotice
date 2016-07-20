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
     * 下线
     */
    MessageType[MessageType["DisConnect"] = 1] = "DisConnect";
    /**
     * 修改属性
     */
    MessageType[MessageType["UpdateProperty"] = 2] = "UpdateProperty";
    /**
     * 自定义消息发送
     */
    MessageType[MessageType["CustomMessage"] = 3] = "CustomMessage";
})(exports.MessageType || (exports.MessageType = {}));
var MessageType = exports.MessageType;
//# sourceMappingURL=MessageType.js.map