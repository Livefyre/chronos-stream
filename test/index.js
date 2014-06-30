var ChronosStream = require('chronos-stream');
var assert = require('chai').assert;
var sinon = require('sinon');
var nock = require('nock');

var responses = {
    hasPrev: require('./mocks/hasPrev.json'),
    notHasPrev: require('./mocks/notHasPrev.json')
};

var host = 'http://bootstrap.qa-ext.livefyre.com:80';
var topic = 'urn:livefyre:livefyre.com:site=290596:collection=2486485:SiteStream';

function mockNextRequest(code, response) {
    var fakeChronos = nock(host)
        .filteringPath(/.*/, '*')
        .get('*')
        .delayConnection(10)
        .reply(code, response);
    return fakeChronos;
}

describe('chronos-stream', function () {
    beforeEach(function () {
        nock.cleanAll();
    })
    it('can be constructed with topic', function () {
        var stuff = new ChronosStream(topic);
        assert.equal(stuff.topic, topic);
    });
    it('can read data', function (done) {
        nock.disableNetConnect();
        var nockServer = nock(host)
            // If the request doesn't include ?until, then give
            // a response that hasPrev
            // if we specified until, give one back without hasPrev
            .filteringPath(function (path) {
                var hasUntil = path.indexOf('until') !== -1;
                if ( ! hasUntil) return '*';
                return 'hasUntil';
            })
            .get('*')
            .reply(200, responses.hasPrev)
            .get('hasUntil')
            .reply(200, responses.notHasPrev);     

        var chronos = new ChronosStream(topic);

        // it will emit a 'request' event
        var onRequest = sinon.spy();
        chronos.on('request', onRequest);

        chronos.on('data', function (data) {
            // console.log('data', data);
            var activity = chronos.read();
            if ( ! activity) {
                return;
            }
            assert.ok(activity.actor);
        });

        chronos.on('end', function () {
            done();
        });
    });
    it('emits error event on 404', function (done) {
        var server = mockNextRequest(404, {});
        var stream = new ChronosStream(topic);
        stream.on('error', function (e) {
            assert.ok(/404/.test(e.message));
            done();
        });
        stream.once('data', function (data) {
            // console.log('data', data);
        });
    });
    it('emits error event on 400', function (done) {
        mockNextRequest(400, require('./mocks/error.json'));
        var stream = new ChronosStream(topic);
        stream.on('error', function (e) {
            assert.ok(/400/.test(e.message));
            done();
        });
        stream.once('data', function (data) {
            // console.log('data', data);
        });
    });
});
