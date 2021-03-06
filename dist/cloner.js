var Authorized, Cloner, Git, Log, Promise, Urls;

Promise = require('bluebird');

Git = require('git-wrapper');

Authorized = require('./authorized');

Urls = require('./urls');

Log = require('./log');

module.exports = Cloner = (function() {
  function Cloner() {}

  Cloner.prototype.clone = function(app_name) {
    Log.logo();
    Log.spin("Getting application data for " + app_name + ".");
    return this.getAppData(app_name).then((function(_this) {
      return function(app) {
        Log.stop();
        Log.br();
        Log.spin("Cloning Github repository at " + app.github_repo + ".");
        return _this.execCloning(app.github_repo, app.default_branch, app_name).then(function() {
          Log.stop();
          Log.inner("Cloned the app code to directory '" + app_name + "'.");
          Log.br();
          Log.line('Run the server by typing:');
          Log.code(["cd " + app_name, 'closeheat']);
          Log.br();
          Log.p('The quickest way to deploy changes to closeheat.com and Github is with:');
          Log.secondaryCode('closeheat deploy');
          Log.br();
          Log.p('For more awesome tricks type:');
          return Log.secondaryCode('closeheat help');
        });
      };
    })(this))["catch"](function(err) {
      return Log.error(err);
    });
  };

  Cloner.prototype.getAppData = function(app_name) {
    return new Promise(function(resolve, reject) {
      return Authorized.request({
        url: Urls.appData(app_name),
        method: 'get'
      }, function(err, resp) {
        var app, e;
        if (err) {
          return reject(err);
        }
        try {
          app = JSON.parse(resp.body).app;
        } catch (_error) {
          e = _error;
          return reject("App named '" + app_name + "' does not exist or the server is down.");
        }
        return resolve(app);
      });
    });
  };

  Cloner.prototype.execCloning = function(github_repo, branch, app_name) {
    this.git = new Git();
    return new Promise(function(resolve, reject) {
      return new Git().exec('clone', ["git@github.com:" + github_repo + ".git", app_name], function(err, resp) {
        if (err) {
          return reject(err);
        }
        return resolve();
      });
    });
  };

  return Cloner;

})();
