const elasticsearch = require('elasticsearch');
const express = require('express');
const app = express();
const bodyParser = require('body-parser')
const path = require('path');

app.use(bodyParser.json())
app.set('port', process.env.PORT || 3002);
app.use(express.static(path.join(__dirname, 'public')));

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

const elasticService = require('./elastic_service');
app.get('/', function (req, res) {
    elasticService.ping(req, res);
});

// http://localhost:3002/indexExists/testindex => True or false
app.get('/indexExists/:indexName', function (req, res) {
    elasticService.indexExists(req, res, req.params.indexName);
});
// http://localhost:3002/initIndex/testindex => {"acknowledged":true,"shards_acknowledged":true,"index":"testindex"}
app.get('/initIndex/:indexName', function (req, res) {
    elasticService.initIndex(req, res, req.params.indexName);
});
// http://localhost:3002/addDocument/testindex/1/std/{"name":"sam"} => {"_index":"testindex","_type":"std","_id":"1","_version":1,"result":"created","_shards":{"total":2,"successful":1,"failed":0},"_seq_no":0,"_primary_term":1}
app.get('/addDocument/:indexName/:_id/:docType/:payload', function (req, res) {
    elasticService.addDocument(req, res, req.params.indexName, req.params._id, req.params.docType, req.params.payload);
});

// http://localhost:3002/search/testindex/std/sam => {"took":0,"timed_out":false,"_shards":{"total":1,"successful":1,"skipped":0,"failed":0},"hits":{"total":{"value":1,"relation":"eq"},"max_score":0.2876821,"hits":[{"_index":"testindex","_type":"std","_id":"1","_score":0.2876821,"_source":{"name":"sam"}}]}}
app.get('/search/:indexName/:docType/:payload', function (req, res) {
    elasticService.search(req, res, req.params.indexName, req.params.docType, req.params.payload);
});

// http://localhost:3002/deleteDocument/testindex/1/std => {"_index":"testindex","_type":"std","_id":"1","_version":3,"result":"deleted","_shards":{"total":2,"successful":1,"failed":0},"_seq_no":2,"_primary_term":1}
app.get('/deleteDocument/:indexName/:_id/:docType', function (req, res) {
    elasticService.deleteDocument(req, res, req.params.indexName, req.params._id, req.params.docType);
});

// http://localhost:3002/deleteAll => {"acknowledged":true}
app.get('/deleteAll', function (req, res) {
    elasticService.deleteAll(req, res);
});

app.listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});
