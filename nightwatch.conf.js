require('babel-register')()
require('env2')('.env'); // optionally store youre Evironment Variables in .env
'use strict'


module.exports = (function(settings) {
    settings.test_workers = false;
    return settings;
})(require('./nightwatch.json'));
