var ChronosStream = require('chronos-stream');

var topic = 'urn:livefyre:livefyre.com:site=290596:collection=2486485:SiteStream';

var activities = new ChronosStream(topic);

activities.on('error', function (e) {
    console.error("Error with ChronosStream", e);
});

activities.on('request', function (options) {
    console.log('requesting', options);
});

activities.on('data', function (activity) {
    console.log(activity);
});

activities.on('end', process.exit);
