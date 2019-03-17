require('babel-register')();
require('env2')('.env'); // optionally store youre Evironment Variables in .env
'use strict'

var HtmlReporter = require('nightwatch-html-reporter');
var reporter = new HtmlReporter({

    openBrowser: false,
    reportFilename: 'index.html',
    reportsDirectory: __dirname + '/reports'

});

module.exports = {
    beforeEach: function (browser, done) {
        require('nightwatch-video-recorder').start(browser, done)
    },
    afterEach: function (browser, done) {
        require('nightwatch-video-recorder').stop(browser, done);
    },
    reporter: reporter.fn,
    custom_assertions_path: ['test/custom-assertions'],
}
