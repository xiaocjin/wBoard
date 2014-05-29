/**
 * Created by jinxc on 14-5-16.
 */
var http = require('http')
    , logger = require("../logger")
    , Socket = require('../socket')
    , Board = require('../lib/wBoard')
    , board = new Board()
    , async = require("async")
    , _ = require("underscore");

function SocketHandler(httpServer) {

    var s = new Socket(httpServer);
    var redis = s.redis;
    var io = s.io;

    io.sockets.on('connection', function (socket) {
        socket.on('message', function (message, callback) {
            var action = message.action;
            var data = message.data;
            var cb = callback || function () {
            };
            redis.hget('wb:socket', socket.id, function (err, result) {
                var user_data = JSON.parse(result);
                if (user_data) {
                    var cid = user_data.cid;
                    var room = message.room || cid;
                    switch (action) {
                        case "init":
                            //board.init(session, cb);
                            break;
                        case "drawCanvas":
                            board.drawCanvas(data, cid, cb);
                            socket.broadcast.to(cid).emit(action, data);
                            break;
                        case "createObject":
                            board.createObject(cid, function (err, d) {
                                socket.broadcast.to(cid).emit(action, d);
                                cb(err, d);
                            });
                            break;
                        case "drawObject":
                            board.drawObject(data, cid, cb);
                            socket.broadcast.to(room).emit(action, data);
                            break;
                        case "turn":
                            board.turn(data, cid, cb);
                            socket.broadcast.to(cid).emit(action, data);
                            break;
                        case "createBoard":
                            board.createBoard(cid, function (err, d) {
                                socket.broadcast.to(cid).emit(action, d);
                                cb(err, d);
                            });
                            break;
                        case "updateBoard":
                            board.updateBoard(data, cid, cb);
                            socket.broadcast.to(cid).emit(action, data);
                            break;
                        case "getContent":
                            board.getContent(cid, cb);
                            break;
                        case "getObject":
                            board.getObject(data, cid, cb);
                            break;
                        case "getCanvas":
                            board.getCanvas(data, cid, cb);
                            break;
                        default:
                    }
                }
            });
        });

        socket.on('disconnect', function () {
            console.log('disconnect ', socket.id);
            redis.hdel('wb:socket', socket.id);
            /**
             * 离开房间
             */
            var rooms = io.sockets.manager.roomClients[socket.id];
            for (var room in rooms) {
                if (room.length > 0) {
                    console.log('unsubscribing from ', room);
                    room = room.substr(1);
                    socket.leave(room);
                }
            }
        });

        /**
         * 认证
         */
        socket.on('author', function (message, callback) {
            var cb = callback || function () {
            };

            var cid = message.cid;
            var role = message.role;
            var info = {};
            _.extend(info, message);
            info.socket = socket.id;
            redis.set('wb:user:' + message.user, socket.id);
            //redis.expire('wb:user:' + message.user, 86400);

            redis.hset('wb:socket', socket.id, JSON.stringify(info));

            socket.join(cid);
            var data = {};
            var room = new Array();
            room.push(cid);
            if (role > 1) {
                socket.join(cid + 'teacher');
                room.push(cid + 'teacher');
            }
            data.room = room;
            cb(null, data);
            //通知php服务器有用户登录

        });

        /**
         * 命令通道
         */
        socket.on('command', function (message, callback) {
            async.parallel({
                info: function (cb) {
                    redis.hget('wb:socket', socket.id, cb);
                },
                socketId: function (cb) {
                    redis.get('wb:user:' + message.user, cb);
                }
            }, function (err, result) {
                var info = JSON.parse(result.info);
                var socketId = result.socketId;
                if (info) {
                    var obj = {
                        user: info.user,
                        data: message.data
                    };
                    io.sockets.socket(socketId).emit('command', obj);
                }
                var cb = callback || function () {
                };
                cb(err);
            });
        });

        /**
         * 聊天通道
         */
        socket.on('video', function (message, callback) {
            redis.hget('wb:socket', socket.id, function (err, result) {
                var action = message.action;
                var data = message.data;
                var user_data = JSON.parse(result);
                if (user_data) {
                    var cid = user_data.cid;
                    var obj = {
                        user: user_data.user,
                        data: data
                    };
                    socket.broadcast.to(cid).emit(action, obj);
                    var cb = callback || function () {
                    };
                    if (action == 'live_on') {
                        board.video_on(data, cid, function (err) {
                            cb(err);
                        })
                    } else {
                        board.video_off(data, cid, function (err) {
                            cb(err);
                        })
                    }
                }
            });
        });

        /**
         * 视频命令
         */
        socket.on('chart', function (message, callback) {
            redis.hget('wb:socket', socket.id, function (err, result) {
                var user_data = JSON.parse(result);
                if (user_data) {
                    var obj = {
                        user: user_data.user,
                        data: message.data
                    };
                    socket.broadcast.to(message.room).emit('chart', obj);
                    var cb = callback || function () {
                    };
                    cb(null);
                }
            });
        });
    });

    io.sockets.on('error', function () {
        logger.error(arguments);
    });

};

module.exports = SocketHandler;