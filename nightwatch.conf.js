

module.exports = (function(settings) {
    settings.test_workers = false;

    return settings;
})(require('./nightwatch.json'));




//
// var HtmlReporter = require('nightwatch-html-reporter');
// var reporter = new HtmlReporter({
//
//     openBrowser: false,
//     reportFilename: 'index.html',
//     reportsDirectory: __dirname + '/reports'
//
// });
//
// module.exports = {
//
// }
