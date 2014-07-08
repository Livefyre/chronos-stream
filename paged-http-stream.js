module.exports = PagedHttpStream;

var Readable = require('readable-stream').Readable;
var http = require('http');
var inherits = require('inherits');

/**
 * Base class for streaming response strings from an HTTP Collection that is
 * paged.
 * You just need to implement _getNextRequest.
 */
function PagedHttpStream(opts) {
  opts = opts || {};
  opts.objectMode = true;
  Readable.call(this, opts);
  this._hasRequested = false;
  this._nextRequest = null;
}
inherits(PagedHttpStream, Readable);

/**
 * stream.Readable protocol
 * This is called whenever data should be fetched from upstream.
 * In this case, make the next request to Chronos
 */
PagedHttpStream.prototype._read = function () {
  var self = this;
  var request = this._hasRequested
    ? this._nextRequest
    : this._getNextRequest(null, null, null);
  if ( ! request) {
    // we're done
    return this.push(null);
  }
  this._request(request, function (res) {
    var buffer = '';
    res.on('error', function (e) {
      console.log('response error', e);
    })
    res.on('data', function (d) {
      buffer += d;
    });
    res.once('end', function () {
      self._hasRequested = true;
      try {
        self._nextRequest = self._getNextRequest(request, res, buffer);
        self.push(buffer);
      } catch (e) {
        self.emit('error', e);
        self.push(null);
      }
    });
  });
};

/**
 * Make an HTTP request
 */
PagedHttpStream.prototype._request = function (options, cb) {
  var self = this;
  this.emit('request', options);
  if (typeof options === 'string') {
    return http.get(options, cb);
  }
  var req = http.request(options, cb);
  req.on('error', function (e) {
    // error making the request (TCP, DNS, etc)
    // no HTTP response even that was an error response
    self.emit('error', e);
  });
  req.end();
};

/**
 * Return the next options that should be passed to http.request
 */
PagedHttpStream.prototype._getNextRequest = function (lastRequest, res, body) {
  throw new Error('PagedHttpStream#_getNextRequest not implemented');
};

