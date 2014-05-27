/**
 * Created by jinxc on 14-5-22.
 */
(function () {

    var communicate = {};

    var socket = io.connect(null);

    /**
     *
     * @param user
     * @param role
     * @param cid
     * @param cb
     */
    communicate.author = function (user, role, cid, cb) {
        var message = {
            user: user,
            role: role,
            cid: cid
        }
        socket.emit('author', message, cb);
    };

    /**
     *聊天
     * @param room
     * @param data
     * @param cb
     */
    communicate.chart = function (room, data, cb) {
        var message = {
            room: room,
            data: data
        }
        socket.emit('chart', message, cb);
    };

    /**
     *命令
     * @param room
     * @param data
     * @param cb
     */
    communicate.command = function (user, data, cb) {
        var message = {
            user: user,
            data: data
        }
        socket.emit('command', message, cb);
    };

    /**
     *
     * @param cb
     */
    communicate.init = function (cb) {
        var message = {
            action: 'init'
        }
        socket.emit('message', message, cb);
    };

    /**
     *
     * @param data
     * @param cb
     */
    communicate.drawCanvas = function (data, cb) {
        var message = {
            data: data,
            action: 'drawCanvas'
        }
        socket.emit('message', message, cb);
    };

    /**
     *
     * @param cb
     */
    communicate.createObject = function (cb) {

        var message = {
            action: 'createObject'
        }
        socket.emit('message', message, cb);
    };

    /**
     *
     * @param data
     * @param cb
     */
    communicate.drawObject = function (data, cb) {
        var message = {
            data: data,
            action: 'drawObject'
        }
        socket.emit('message', message, cb);
    };


    /**
     *
     * @param board
     * @param cb
     */
    communicate.turn = function (board, cb) {
        var data = {
            board: board
        }
        var message = {
            data: data,
            action: 'turn'
        }
        socket.emit('message', message, cb);
    };

    /**
     *
     * @param cb
     */
    communicate.createBoard = function (cb) {
        var message = {
            action: 'createBoard'
        }
        socket.emit('message', message, cb);
    };

    /**
     *
     * @param data
     * @param cb
     */
    communicate.updateBoard = function (data, cb) {
        var message = {
            data: data,
            action: 'updateBoard'
        }
        socket.emit('message', message, cb);
    };

    /**
     *
     * @param cb
     */
    communicate.getContent = function (cb) {
        var message = {
            action: 'getContent'
        }
        socket.emit('message', message, cb);
    };

    /**
     *
     * @param page
     * @param board
     * @param lecture
     * @param cb
     */
    communicate.getoObject = function (page, board, lecture, cb) {
        var data = {
            page: page,
            board: board,
            lecture: lecture
        }
        var message = {
            data: data,
            action: 'getoObject'
        }
        socket.emit('message', message, cb);
    };

    /**
     *
     * @param page
     * @param board
     * @param lecture
     * @param cb
     */
    communicate.getCanvas = function (page, board, lecture, cb) {
        var data = {
            page: page,
            board: board,
            lecture: lecture
        }
        var message = {
            data: data,
            action: 'getCanvas'
        }
        socket.emit('message', message, cb);
    };

    socket.on('reconnect', function () {
        console.log('reconnect:' + socket.socket.sessionid, new Date())
    })
    /**
     * 重连，无限重复
     */
    socket.on('reconnecting', function () {
        console.log('reconnecting:' + socket.socket.sessionid, new Date())
    })
    socket.on('reconnect_failed', function () {
        console.log('reconnect_failed:' + socket.socket.sessionid, new Date())
    })
    /**
     * 链接成功
     */
    socket.on('connect', function () {
        console.log('connect:' + socket.socket.sessionid, new Date());
    })
    /**
     * 链接断开
     */
    socket.on('disconnect', function () {
        console.log('disconnect:' + socket.socket.sessionid, new Date());
    })
    socket.on('error', function () {
        console.log('error:' + socket.socket.sessionid, new Date());
    })

    window.socket = socket;
    window.communicate = communicate;

})();
