module.exports = PagedHttpStream;

var Readable = require('stream-objectmode/src/readable');
var http = require('http');
var inherits = require('inherits');

/**
 * Base class for streaming response strings from an HTTP Collection that is
 * paged.
 * You just need to implement _getNextRequest.
 */
function PagedHttpStream(initialRequest, opts) {
  opts = opts || {};
  Readable.call(this, opts);
  this._nextRequest = initialRequest;
}
inherits(PagedHttpStream, Readable);

/**
 * stream.Readable protocol
 * This is called whenever data should be fetched from upstream.
 * In this case, make the next request to Chronos
 */
PagedHttpStream.prototype._read = function (x, done) {
  var self = this;
  var request = this._nextRequest;
  if ( ! request) {
    // we're done
    return this.push(null);
  }
  this._request(request, function (res) {
    var buffer = '';
    if (res.statusCode !== 200) {
      return self.emit('error', new Error(res.statusCode));
    }
    res.on('error', function (e) {
      console.log('response error', e);
    })
    res.on('data', function (d) {
      buffer += d;
    });
    res.once('end', function () {
      self._nextRequest = self._getNextRequest(request, res, buffer);
      self.push(buffer);
    });
  });
};

/**
 * Make an HTTP request
 */
PagedHttpStream.prototype._request = function (options, cb) {
  this.emit('request', options);
  if (typeof options === 'string') {
    return http.get(options, cb);
  }
  var req = http.request(options, cb);
  req.end();
};

/**
 * Return the next options that should be passed to http.request
 */
PagedHttpStream.prototype._getNextRequest = function (lastRequest, res, body) {
  throw new Error('PagedHttpStream#_getNextRequest not implemented');
};

