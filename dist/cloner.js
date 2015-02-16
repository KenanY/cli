var Authorizer, Cloner, Q, Urls, callback, git, gulp, gutil, q, request, util;

gulp = require('gulp');

git = require('gulp-git');

Q = require('q');

q = require('bluebird');

callback = require('gulp-callback');

gutil = require('gulp-util');

request = require('request');

util = require('util');

Authorizer = require('./authorizer');

Urls = require('./urls');

module.exports = Cloner = (function() {
  function Cloner() {}

  Cloner.prototype.clone = function(app_name) {
    util.puts("Getting application data for " + app_name + "...");
    return this.getAppData(app_name).then((function(_this) {
      return function(app) {
        util.puts("Downloading and cloning the repository...");
        return _this.execCloning(app.github_repo, app.default_branch, app_name).then(function() {
          return util.puts("DONE");
        });
      };
    })(this));
  };

  Cloner.prototype.getAppData = function(app_name) {
    var authorizer, params;
    authorizer = new Authorizer;
    params = {
      api_token: authorizer.accessToken()
    };
    return new q(function(resolve, reject) {
      return request({
        url: Urls.appData(app_name),
        qs: params,
        method: 'get'
      }, function(err, resp) {
        var app;
        app = JSON.parse(resp.body).app;
        return resolve(app);
      });
    });
  };

  Cloner.prototype.execCloning = function(github_repo, branch, app_name) {
    return new q(function(resolve, reject) {
      return git.clone("https://github.com/" + github_repo, {
        args: app_name
      }, function(err) {
        if (err) {
          throw err;
        }
        return resolve();
      });
    });
  };

  Cloner.prototype.showDeployLog = function() {
    console.log('Deploying to closeheat.');
    console.log('............ SOME LOG HERE ..........');
    return console.log('Should be done.');
  };

  return Cloner;

})();