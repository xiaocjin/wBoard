/**
 * Created by jinxc on 14-5-17.
 */
var config = require('../config')
    , db = config.get("redis:data_db")
    , Publisher = require('../cache/publisher')
    , publisher = new Publisher(db)
    , redis = require("redis")
    , logger = require("../logger")
    , async = require("async")
    , _ = require("underscore");

function Board() {

};

/**
 * 身份认证
 * @param data
 * @param session
 * @param socket
 */
Board.prototype.author = function (data, session, socket, cb) {
    var role = data.role;
    var user = data.user;
    var cid = data.cid;
    if (user) {
        session.user = user;
        session.role = role;
        session.cid = cid;
        socket.join(cid);
        session.touch();
        var message = {};
        var room = new Array();
        room.push(cid);
        if (role > 1) {
            socket.join(cid + 'teacher');
            room.push(cid + 'teacher');
        }
        message.room = room;
        cb(null, message);
    } else {
        var e = new Error('author fail');
        cb(e, null);
    }
};

/**
 *
 * @param data
 * @param session
 */
Board.prototype.drawCanvas = function (data, cid, cb) {
    //this.publish('drawCanvas', data, null, cid);
    var lecture = data.lecture;
    var page = data.page;
    var board = data.board;
    var obj = data.data;
    /**
     * save
     */
    publisher.client.rpush('wb:c:' + cid + ":" + board + ":" + page + ":" + lecture, JSON.stringify(obj), function (err, info) {
        cb(err);
    });
};

/**
 *
 * @param data
 * @param session
 */
Board.prototype.createObject = function (cid, cb) {
    publisher.client.incr("wb:object:num:" + cid, function (err, num) {
        var data = {
            oid: num
        };
        cb(err, data);
    });
};

/**
 *
 * @param data
 * @param session
 */
Board.prototype.drawObject = function (data, cid, cb) {
    var page = data.page;
    var board = data.board;
    var lecture = data.lecture;
    var oid = data.oid;
    var obj = data.data;
    publisher.client.hget('wb:o:' + cid + ":" + board + ":" + page + ":" + lecture, oid, function (err, info) {
        var message = JSON.parse(info);
        _.extend(message, obj);
        publisher.client.hset('wb:o:' + cid + ":" + board + ":" + page + ":" + lecture, oid, JSON.stringify(message), function (err, info) {
            cb(err);
        });
    });
};

/**
 *
 * @param data
 * @param cid
 */
Board.prototype.turn = function (data, cid, cb) {
    //this.publish('turn', data, null, cid);
    var board = data.board;
    publisher.client.set('wb:current:' + cid, board, function (err, info) {
        cb(err);
    });
};

/**
 * 添加白板
 * @param cid
 * @param data
 * @param room
 * @param session
 */
Board.prototype.createBoard = function (cid, cb) {
    publisher.client.incr("wb:num:" + cid, function (err, num) {
        var data = {
            board: num
        }
        cb(err, data);
    });
};

/**
 * 更新白板
 * @param cid
 * @param data
 * @param room
 * @param session
 */
Board.prototype.updateBoard = function (data, cid, cb) {
    var board = data.board;
    var obj = data.data;
    publisher.client.hget("wb:board:" + cid, board, function (err, info) {
        var message = JSON.parse(info);
        _.extend(message, obj);
//        for (var i in data) {
//            message[i] = data[i];
//        }
        publisher.client.hset("wb:board:" + cid, board, JSON.stringify(message), function (err, info) {
            cb(err);
        });
    });
};

/**
 * 获取版本content
 * @param cid
 * @param data
 */
Board.prototype.getContent = function (cid, callback) {
    async.parallel({
        current: function (cb) {
            publisher.client.get("wb:current:" + cid, function (err, num) {
                cb(err, {"board": num})
            })
        },
        boards: function (cb) {
            publisher.client.hgetall("wb:board:" + cid, function (err, boards) {
                var arr = new Array();
                for (var i in boards) {
                    var d = JSON.parse(boards[i]);
                    d.board = i;
                    arr.push(d);
                }
                arr.sort(function (a, b) {
                    return a.board - b.board;
                });
                cb(err, arr);
            })
        },
        video: function (cb) {
            publisher.client.get("wb:video:" + cid, function (err, obj) {
                cb(err, JSON.parse(obj));
            })
        }
    }, callback);
};

/**
 * 获取所有白板content
 * @param cid
 * @param data
 */
Board.prototype.getObject = function (data, cid, cb) {
    var page = data.page;
    var board = data.board;
    var lecture = data.lecture;
    publisher.client.hgetall("wb:o:" + cid + ":" + board + ":" + page + ":" + lecture, function (err, objects) {
        var arr = new Array();
        for (var i in objects) {
            var d = JSON.parse(objects[i]);
            arr.push(d);
        }
        cb(err, arr);
    });
};

/**
 * 获取canvas内容
 * @param data
 * @param cid
 * @param cb
 */
Board.prototype.getCanvas = function (data, cid, cb) {
    var page = data.page;
    var board = data.board;
    var lecture = data.lecture;
    async.auto({
        len: function (callback) {
            publisher.client.llen("wb:c:" + cid + ":" + board + ":" + page + ":" + lecture, callback);
        },
        content: ['canvasLen', function (callback, results) {
            var len = results.len;
            publisher.client.lrange("wb:c:" + cid + ":" + board + ":" + page + ":" + lecture, 0, len - 1, callback);
        }]
    }, cb);
};


/**
 * 初始化
 */
Board.prototype.init = function (session, cb) {
    if (session.user) {
        var cid = session.cid;
        publisher.client.flushdb(function () {
            publisher.client.set("wb:num:" + cid, 1);
            publisher.client.set("wb:object:num:" + cid, 0);
            cb(null);
        });
    }
};

/**
 *
 * @param data
 * @param cid
 */
Board.prototype.video_on = function (data, cid, cb) {
    publisher.client.set('wb:video:' + cid, JSON.stringify(data), function (err, info) {
        cb(err);
    });
};

/**
 *
 * @param data
 * @param cid
 */
Board.prototype.video_off = function (data, cid, cb) {
    publisher.client.del('wb:video:' + cid, function (err, info) {
        cb(err);
    });
};

module.exports = Board;