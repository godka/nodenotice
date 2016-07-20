/**
 * 获取状态的rest服务
 * Created by xiaodm on 2016/7/16.
 */
"use strict";
var express = require("express");
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
            res.json(connManager.getAllClient());
        });
        /**
         * 根据条件获取席位状态数据
         */
        this.router.get('/getClientByCondition/:proName/:proValues/:isRegisterPro', function (req, res) {
            res.json(connManager.getClientByCondition(req.params.proName, req.params.proValues.split(","), req.params.isRegisterPro));
        });
    };
    return StatusRest;
}());
exports.StatusRest = StatusRest;
//# sourceMappingURL=StatusRest.js.map