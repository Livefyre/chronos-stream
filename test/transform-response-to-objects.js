var assert = require('chai').assert;
var sinon = require('sinon');

var ResponseToObjects = require('chronos-stream/transform-response-to-objects');

describe('transform-response-to-objects', function () {
    it('transforms Livefyre response envelope strings where data is array', function (done) {
        var transform = new ResponseToObjects();
        var responseString = JSON.stringify(require('./mocks/response-data-array.json'));
        var output = []
        transform.on('end', function () {
            assert.equal(output.length, 2);
            // ensure they are the right objects
            output.forEach(function (data) {
                assert.ok(data.actor);
            });
            done();
        });
        transform.on('data', output.push.bind(output));
        transform.write(responseString);
        transform.end();
    });
    it('transforms Livefyre response envelope strings where data is object', function (done) {
        var transform = new ResponseToObjects();
        var responseString = JSON.stringify(require('./mocks/response-data-object.json'));
        var output = []
        transform.on('end', function () {
            assert.equal(output.length, 1);
            assert.ok(output[0].actor);
            done();
        });
        transform.on('data', output.push.bind(output));
        transform.write(responseString);
        transform.end();        
    });
    it('transforms Livefyre response envelope objects', function (done) {
        // usually you'll write in strings, but lets say you already parsed
        // the JSON. it should still work.
        var transform = new ResponseToObjects();
        var responseObject = require('./mocks/response-data-array.json');
        var output = []
        transform.on('end', function () {
            assert.equal(output.length, 2);
            // ensure they are the right objects
            output.forEach(function (data) {
                assert.ok(data.actor);
            });
            done();
        });
        transform.on('data', output.push.bind(output));
        transform.write(responseObject);
        transform.end();        
    });
    it('emits error when error responses written in', function (done) {
        var transform = new ResponseToObjects();
        var errorResponseString = JSON.stringify(require('./mocks/error.json'));
        var output = [];
        var onErrorSpy = sinon.spy();
        transform.on('error', function () {
            assert.equal(output.length, 0);
            done();
        });
        transform.on('end', function () {
            // shouldn't happen
            throw new Error("Shouldn't end");
        });
        transform.on('data', output.push.bind(output));
        transform.write(errorResponseString);
        transform.end(); 
    });
});
