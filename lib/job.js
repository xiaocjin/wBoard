/**
 * Created by jinxc on 14-5-28.
 */
var Board = require('../lib/wBoard')
    , board = new Board()
    , logger = require("../logger");

exports.start = function () {
    var CronJob = require('cron').CronJob;
    var job = new CronJob({
        cronTime: '00 00 00 * * *',
        onTick: function () {
            //board.getContent()
        },
        start: false
    });
    job.start();
};
