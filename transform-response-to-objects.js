module.exports = ResponseToObjects;

var Transform = require('readable-stream').Transform;
var inherits = require('inherits');
var isArray = require('is-array');

/**
 * Parse written Livefyre API Responses (strings or objects) into a
 * readable stream of objects from response.data
 * If data is an array, each item of the array will be emitted separately
 * If an error response is written in, emit an error event
 */
function ResponseToObjects(opts) {
    opts = opts || {};
    opts.objectMode = true;
    Transform.call(this, opts);
}
inherits(ResponseToObjects, Transform);

/**
 * Required by stream/transform
 */
ResponseToObjects.prototype._transform = function (response, encoding, done) {
    var err;
    if (typeof response === 'string') {
        response = JSON.parse(response);
    }
    if (response.status === 'error') {
        err = new Error('ResponseToObjects transform had an error response written in');
        err.response = response;
        this.emit('error', err);
        return;
    }
    var data = response.data;
    if ( ! data) {
        err = new Error('Response has no data');
        err.response = response;
        this.emit('error', err);
        return;
    }
    if ( ! isArray(data)) {
        data = [data];
    }
    data.forEach(this.push.bind(this));
    done();
};
