var Cluster = require('./cluster/index')
    , cluster = new Cluster();
cluster.run(__dirname + '/express/index');

//module.exports = (process.env['NODE_ENV'] === "COVERAGE")
//    ? require('./lib-cov/express')
//    : require('./express');