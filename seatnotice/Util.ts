/**
 * Created by xiaodm on 2016/7/5.
 */
export class Util {
    static getIPAddress() {
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
    }

    static succeed(result:any) {
        let returnBase = {data: null, success: null};
        returnBase.data = result;
        returnBase.success = true;
        return returnBase;
    }

    static error(errorMsg:string) {
        let returnBase = {data: null, success: null, error: null};
        returnBase.data = false;
        returnBase.success = false;
        returnBase.error = {code: 99901, message: errorMsg};
        return returnBase;
    }
}
