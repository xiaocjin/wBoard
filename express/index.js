var express = require('express')
    , config = require('../config')
    , db = config.get("redis:session_db")
    , routes = require('../routes')
    , notFound = require('../lib/notFound')
    , SocketHandler = require('../socket/handler')
    , app = express()
    , Redis = require('../cache/redis')
    , redis = new Redis(db)
    , RedisStore = require('connect-redis')(express)
    , logger = require("../logger")
    , http = require('http');

app.set('port', config.get('express:port'));
app.set('view engine', 'html');
app.set('views', 'views');
app.use(express.logger({ immediate: true, format: 'dev' }));
//
//var cookieParser = express.cookieParser(config.get('session:secret'))
//app.use(cookieParser);
//app.use(express.json());
//app.use(express.urlencoded());
//
//var sessionStore = new RedisStore({client: redis.client});
//
//app.use(express.session({ store: sessionStore,
//    secret: config.get('session:secret'),
//    cookie: { secure: config.get('session:secure'),
//        httpOnly: config.get('session:httpOnly'),
//        maxAge: config.get('session:maxAge')
//    }
//}));

app.use(app.router);
app.get('/', routes.index);
app.use(express.static('public'));
app.use(notFound.index);

var httpServer = http.createServer(app).listen(app.get('port'), function () {
    logger.info('Express server listening on port ' + app.get('port'));
});

var socketHandler = new SocketHandler(httpServer);
