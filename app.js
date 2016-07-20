(function () {
    'use strict';

    var express = require('express');
    var path = require('path');
    var logger = require('morgan');
    var cookieParser = require('cookie-parser');
    var bodyParser = require('body-parser');

    var app = express();
    var server = require('http').createServer(app);

    // view engine setup
    app.set('views', path.join(__dirname, 'views'));
    app.engine('html', require('ejs').renderFile);
    app.set('view engine', 'html');

    app.use(logger('dev'));
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({
        extended: true
    }));
    app.use(cookieParser());

    app.all('*', function (req, res, next) {
        res.header("Access-Control-Allow-Origin", "*");
        res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
        res.header("Access-Control-Allow-Headers", "X-Requested-With,X-Powered-By,Content-Type");
        if (req.method === 'OPTIONS') {
            res.status(200).end();
        } else {
            next();
        }
    });

    initSeatNotice(app);

    app.set('port', process.env.PORT || 3000);

    server.listen(app.get('port'), function () {
        console.log('Express server listening on port ' + server.address().port);
    });

    /**
     *  初始化席位通知组件
     * @param app express
     */
    function initSeatNotice(app) {
        var statusService = require('./routes/StatusRest');
        var messageService = require('./routes/MessageRest');

        var messageHub = initMessageHub();

        var wsio=initWsHub(messageHub);

        var connManager = initStatusConnection(messageHub,wsio);
        var statusIns = new statusService.StatusRest(connManager);
        var messageIns = new messageService.MessageRest(messageHub, connManager);

        app.use('/status', statusIns.router);
        app.use('/message', messageIns.router);

    }

    /**
     * 实例化连接管理器
     * @returns {ConnectionManager|*}
     */
    function initStatusConnection(messageHub,wsio) {
        var client = require("./seatnotice/ConnectionManager.js");
        var conn = new client.ConnectionManager(messageHub,wsio);
        conn.initReceive();
        return conn;
    }

    /**
     * 实例化消息管理器
     * @returns {MessageFactory|*}
     */
    function initMessageHub() {
        var mFactory = require("./seatnotice/MessageFactory.js");
        return new mFactory.MessageFactory();
    }


    /**
     * 初始化socketio对象
     * @param messageHub
     * @returns {*}
     */
    function initWsHub(messageHub)
    {
        var websocketHost = require("./seatnotice/WebsocketNWHost.js");
        var wsHost = new websocketHost.WebsocketNWHost(server, messageHub);
        return wsHost.initSocket();
    }
    module.exports = app;
}());
