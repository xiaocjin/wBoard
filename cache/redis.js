var redis = require('redis')
    , config = require('../config');

function Redis(db) {
    this.port = config.get("redis:port");
    this.host = config.get("redis:host");
    this.password = config.get("redis:pass");
    this.db = config.get("redis:data_db");
    this.client = redis.createClient(this.port, this.host);
    if (this.password) this.client.auth(this.password, function () {});
    if (db) this.client.select(this.db, function () {});
}

module.exports = Redis;