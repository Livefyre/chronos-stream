module.exports = ChronosActivityStream;

var ChronosResponseStream = require('./chronos-response-stream');
var ResponseToObjects = require('./transform-response-to-objects');
var PassThrough = require('readable-stream/passthrough');
var inherits = require('inherits');

/**
 * A Readable stream of activity objects from Chronos, from newest to oldest
 * @param topic {string} Chronos topic to stream responses about
 * @param opts {object} Stream options
 */
function ChronosActivityStream(topic, opts) {
  opts = opts || {};
  opts.objectMode = true;
  PassThrough.call(this, opts);

  this.topic = topic;

  // Get responses, parse to .data objects, and re-emit any errors
  (new ChronosResponseStream(topic))
    .on('error', this.emit.bind(this, 'error'))
    .pipe(new ResponseToObjects())
    .on('error', this.emit.bind(this, 'error'))
    .pipe(this);
}
inherits(ChronosActivityStream, PassThrough);
