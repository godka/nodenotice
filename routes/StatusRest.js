"use strict";
var express = require("express");
var Util_1 = require("../seatnotice/Util");
var StatusRest = (function () {
    function StatusRest(connManager) {
        this.connManager = connManager;
        this.routerConfig(connManager);
    }
    StatusRest.prototype.routerConfig = function (connManager) {
        this.router = express.Router();
        /**
         * 获取所有席位状态数据
         */
        this.router.get('/getAllClient', function (req, res) {
            res.json(Util_1.Util.succeed(connManager.getAllClient()));
        });
        /**
         * 刷新所有席位状态数据，以广播
         */
        this.router.get('/refreshAllClient', function (req, res) {
            res.json(Util_1.Util.succeed(connManager.refreshAllClient()));
        });
        /**
         * 根据条件获取席位状态数据
         */
        this.router.get('/getClientByCondition/:proName/:proValues/:isRegisterPro', function (req, res) {
            res.json(Util_1.Util.succeed(connManager.getClientByCondition(req.params.proName.split(";"), req.params.proValues.split(";"), req.params.isRegisterPro)));
        });
        /**
         * 返回所有连接信息的注册信息registerInfo
         */
        this.router.get('/getAllRegisterInfos', function (req, res) {
            res.json(Util_1.Util.succeed(connManager.getAllRegisterInfos()));
        });
        /**
         * 根据条件获取席位状态数据
         */
        this.router.get('/getRegisterInfosByCondition/:proName/:proValues/:isRegisterPro', function (req, res) {
            var clients = connManager.getClientByCondition(req.params.proName.split(";"), req.params.proValues.split(";"), req.params.isRegisterPro);
            var registerInfos = clients.map(function (item) {
                return item.registerInfo;
            });
            res.json(Util_1.Util.succeed(registerInfos));
        });
    };
    return StatusRest;
}());
exports.StatusRest = StatusRest;
//# sourceMappingURL=StatusRest.js.map