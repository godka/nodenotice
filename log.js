/**
 * Created by xiaodm on 2016/7/21.
 */
var path = require('path');
var log4js = require('log4js');
var logConfig = require('./logconfig.json');
logConfig.appenders[0].filename = path.join(__dirname, "logs", logConfig.appenders[0].filename);
console.log(logConfig.appenders[0].filename);
log4js.configure(logConfig);

log4js.loadAppender('file');
//log4js.addAppender(log4js.appenders.file('pants.log'), 'pants');
var logger = log4js.getLogger('notice');

module.exports = logger;