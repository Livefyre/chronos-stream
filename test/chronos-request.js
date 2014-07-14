var chronosRequest = require('chronos-stream/chronos-request');
var assert = require('chai').assert;
var sinon = require('sinon');
var querystring = require('querystring');
var topic = 'urn:livefyre:livefyre.com:site=290596:collection=2486485:SiteStream';

describe('chronos-stream/chronos-url', function () {
    it('uses opts.cursor, opts.token, opts.topic', function () {
        var lftoken = 'mytoken';
        var cursor = {
          "hasNext": null,
          "hasPrev": true,
          "limit": 50,
          "next": "2014-06-19T23:53:32.136981Z",
          "prev": "2014-06-19T22:24:18.643884Z"
        };
        var request = chronosRequest({
            environment: 'qa',
            topic: topic,
            token: lftoken,
            cursor: cursor
        });
        var query = querystring.parse(request.query);
        assert.equal(query.resource, topic);
        assert.equal(query.lftoken, lftoken);
        assert.equal(query.until, cursor.prev);
    });
    it('defaults to production env', function () {
        assert.equal(
            chronosRequest().host,
            chronosRequest({ environment: 'production' }).host);
    });
    it('makes correct urls for qa env', function () {
        var qaRequest = chronosRequest({ environment: 'qa' })
        assert.equal(qaRequest.host, 'bootstrap.qa-ext.livefyre.com')
    });
    it('makes correct urls for uat env', function () {
        var uatRequest = chronosRequest({ environment: 'uat' })
        assert.equal(uatRequest.host, 'bootstrap.t402.livefyre.com')
    });
    it('makes correct urls for prod env', function () {
        var prodRequest = chronosRequest({ environment: 'production' })
        assert.equal(prodRequest.host, 'bootstrap.livefyre.com')
    });
    it('makes correct urls for fyre env', function () {
        var localDevRequest = chronosRequest({ environment: 'fyre' })
        assert.equal(localDevRequest.host, 'bootstrap.fyre')
    });
});
