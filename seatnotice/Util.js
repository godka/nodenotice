/**
 * Created by xiaodm on 2016/7/5.
 */
"use strict";
var http = require("http");
var request = require("request");
var Util = (function () {
    function Util() {
    }
    Util.getIPAddress = function () {
        var interfaces = require('os').networkInterfaces();
        for (var devName in interfaces) {
            var iface = interfaces[devName];
            if (!/(loopback|vmware|internal)/gi.test(devName)) {
                for (var i = 0; i < iface.length; i++) {
                    var alias = iface[i];
                    if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal && alias.mac !== '00:00:00:00:00:00')
                        return alias.address;
                }
            }
        }
        return '0.0.0.0';
    };
    Util.getLIPAddresss = function () {
        var ipList = [];
        var interfaces = require('os').networkInterfaces();
        for (var devName in interfaces) {
            var iface = interfaces[devName];
            if (!/(loopback|vmware|internal)/gi.test(devName)) {
                for (var i = 0; i < iface.length; i++) {
                    var alias = iface[i];
                    if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal && alias.mac !== '00:00:00:00:00:00')
                        ipList.push(alias.address);
                }
            }
        }
        return ipList;
    };
    Util.succeed = function (result) {
        var returnBase = { data: null, success: null };
        returnBase.data = result;
        returnBase.success = true;
        return returnBase;
    };
    Util.error = function (errorMsg) {
        var returnBase = { data: null, success: null, error: null };
        returnBase.data = false;
        returnBase.success = false;
        returnBase.error = { code: 99901, message: errorMsg };
        return returnBase;
    };
    Util.postDataByRequest = function (url, data) {
        request.post({ url: url, body: data, json: true, headers: { "content-type": "application/json" } }, function optionalCallback(err, httpResponse, body) {
            if (err) {
                return console.error('upload failed:', err);
            }
            console.log('post successful!  Server responded with:', body);
        });
    };
    Util.postData = function (host, port, path, data) {
        data = JSON.stringify(data);
        var opt = {
            method: "POST",
            host: host,
            port: port,
            path: path,
            headers: {
                "Content-Type": 'application/json',
                "Content-Length": data.length
            }
        };
        var req = http.request(opt, function (serverFeedback) {
            if (serverFeedback.statusCode == 200) {
                serverFeedback.on('data', function (rltdata) {
                    console.log(rltdata);
                });
            }
        });
        req.on("error", function (e) {
            console.log(e);
        });
        req.write(data + "\n");
        req.end();
    };
    return Util;
}());
exports.Util = Util;
//# sourceMappingURL=Util.js.map