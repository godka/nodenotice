/**
 * 获取状态的rest服务
 * Created by xiaodm on 2016/7/16.
 */
import {ConnectionManager} from "../seatnotice/ConnectionManager";
import express = require("express");
import {Util} from "../seatnotice/Util";

export class StatusRest {

    connManager:ConnectionManager;
    router:any;

    constructor(connManager:ConnectionManager) {

        this.connManager = connManager;
        this.routerConfig(connManager);
    }

    private routerConfig(connManager:ConnectionManager) {
        this.router = express.Router();

        /**
         * 获取所有席位状态数据
         */
        this.router.get('/getAllClient', function (req, res) {
            res.json(Util.succeed(connManager.getAllClient()));
        });

        /**
         * 刷新所有席位状态数据，以广播
         */
        this.router.get('/refreshAllClient', function (req, res) {
            res.json(Util.succeed(connManager.refreshAllClient()));
        });

        /**
         * 根据条件获取席位状态数据
         */
        this.router.get('/getClientByCondition/:proName/:proValues/:isRegisterPro', function (req, res) {
            res.json(Util.succeed(connManager.getClientByCondition(req.params.proName.split(";"), req.params.proValues.split(";"), req.params.isRegisterPro)));
        });


        /**
         * 返回所有连接信息的注册信息registerInfo
         */
        this.router.get('/getAllRegisterInfos', function (req, res) {
            res.json(Util.succeed(connManager.getAllRegisterInfos()));
        });

        /**
         * 根据条件获取席位状态数据
         */
        this.router.get('/getRegisterInfosByCondition/:proName/:proValues/:isRegisterPro', function (req, res) {
            let clients = connManager.getClientByCondition(req.params.proName.split(";"), req.params.proValues.split(";"), req.params.isRegisterPro);
            let registerInfos = clients.map(function (item) {
                return item.registerInfo;
            });
            res.json(Util.succeed(registerInfos));
        });
    }
}