"use strict";
/**
 * Created by xiaodm on 2016/7/1.
 */
var PhoneConnInfo = (function () {
    function PhoneConnInfo(deviceNumber, connKey, name, registerInfo) {
        this.deviceNumber = deviceNumber;
        this.connKey = connKey;
        this.name = name;
        this.registerInfo = registerInfo;
    }
    return PhoneConnInfo;
}());
exports.PhoneConnInfo = PhoneConnInfo;
//# sourceMappingURL=PhoneConnInfo.js.map