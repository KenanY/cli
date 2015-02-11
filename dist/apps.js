var Apps, Authorizer, Table, git, gulp, q, request, rp, util, _;

gulp = require('gulp');

git = require('gulp-git');

q = require('bluebird');

rp = require('request-promise');

request = require('request');

_ = require('lodash');

util = require('util');

Table = require('cli-table');

Authorizer = require('./authorizer');

module.exports = Apps = (function() {
  var APPS_INDEX;

  function Apps() {}

  APPS_INDEX = 'http://staging.closeheat.com/api/apps';

  Apps.prototype.showList = function() {
    var authorizer, params;
    authorizer = new Authorizer;
    params = {
      api_token: authorizer.accessToken()
    };
    util.puts('Getting Your Application Info...');
    return request({
      url: APPS_INDEX,
      qs: params,
      method: 'get'
    }, (function(_this) {
      return function(err, resp) {
        var apps;
        if (err) {
          throw Error('Error happened');
        }
        apps = JSON.parse(resp.body).apps;
        if (apps.length) {
          return _this.table(apps);
        } else {
          return _this.noApps();
        }
      };
    })(this));
  };

  Apps.prototype.table = function(apps) {
    var apps_list;
    util.puts('');
    util.puts("You have " + apps.length + " apps deployed.");
    util.puts('');
    apps_list = new Table({
      head: ['Name', 'Clone command']
    });
    _.each(apps, function(app) {
      return apps_list.push([app.name, "closeheat clone " + app.slug]);
    });
    util.puts(apps_list.toString());
    util.puts('');
    util.puts('');
    util.puts("Edit any of your apps by cloning it with:");
    util.puts('');
    return util.puts("  closeheat clone your-awesome-app");
  };

  Apps.prototype.noApps = function() {
    util.puts("You currently have no apps deployed.");
    util.puts("Create an app by typing:");
    return util.puts("  closeheat create my-awesome-app");
  };

  return Apps;

})();