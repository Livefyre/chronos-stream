var options = require('nopt')({
    auth: String
}, process.argv)

var ChronosStream = require('chronos-stream');

var topic = 'urn:livefyre:profiles-qa.fyre.co:user=5329c8c285889e7bc6000000:personalStream';

var activities = new ChronosStream(topic)

if (options.auth) {
    activities.auth(options.auth);
}

activities.on('error', function (e) {
    console.error("Error with ChronosStream", e);
});

activities.on('request', function (options) {
    console.log('requesting', options);
});

activities.on('data', function (activity) {
    console.log(activity);
});

activities.on('end', function () {
    console.log('ended');
    process.exit();
});
