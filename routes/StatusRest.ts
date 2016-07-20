/**
 * 获取状态的rest服务
 * Created by xiaodm on 2016/7/16.
 */

import {ConnectionManager} from "../seatnotice/ConnectionManager";
import express = require("express");

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
            res.json(connManager.getAllClient());
        });

        /**
         * 根据条件获取席位状态数据
         */
        this.router.get('/getClientByCondition/:proName/:proValues/:isRegisterPro', function (req, res) {
            res.json(connManager.getClientByCondition(req.params.proName, req.params.proValues.split(","), req.params.isRegisterPro));
        });
    }
}