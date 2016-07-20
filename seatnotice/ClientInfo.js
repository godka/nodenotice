"use strict";
/**
 * Created by xiaodm on 2016/7/1.
 */
var ClientInfo = (function () {
    function ClientInfo(name, ip, port, registerInfo) {
        this.name = name;
        this.ip = ip;
        this.port = port;
        this.registerInfo = registerInfo;
    }
    return ClientInfo;
}());
exports.ClientInfo = ClientInfo;
//# sourceMappingURL=ClientInfo.js.map