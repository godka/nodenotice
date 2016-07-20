"use strict";
/**
 * Created by xiaodm on 2016/7/5.
 */
var Util = (function () {
    function Util() {
    }
    Util.getIPAddress = function () {
        var interfaces = require('os').networkInterfaces();
        for (var devName in interfaces) {
            var iface = interfaces[devName];
            for (var i = 0; i < iface.length; i++) {
                var alias = iface[i];
                if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal)
                    return alias.address;
            }
        }
        return '0.0.0.0';
    };
    return Util;
}());
exports.Util = Util;
//# sourceMappingURL=Util.js.map