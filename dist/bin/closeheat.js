#!/usr/bin/env node

var Apps, Authorizer, Cloner, Creator, Deployer, Initializer, Log, Server, fs, logo_path, path, program, tube, _;

program = require('commander');

_ = require('lodash');

fs = require('fs');

path = require('path');

Creator = require('../creator');

Server = require('../server');

Initializer = require('../initializer');

Deployer = require('../deployer');

Apps = require('../apps');

Authorizer = require('../authorizer');

Cloner = require('../cloner');

Log = require('../log');

program.version('0.9.1').usage('<keywords>');

program.command('create [app-name]').description('Creates a new app with clean setup and directory structure.').option('-f, --framework [name]', 'Framework').option('-t, --template [name]', 'Template').option('--javascript [name]', 'Javascript precompiler').option('--html [name]', 'HTML precompiler').option('--css [name]', 'CSS precompiler').option('--tmp [path]', 'The path of temporary directory when creating').option('--dist [path]', 'Path of destination of where to create app dir').option('--no-deploy', 'Do not create Github repo and closeheat app').action(function(name, opts) {
  var includes_template_settings, settings, template_settings;
  settings = _.pick.apply(_, [opts, 'framework', 'template', 'javascript', 'html', 'css', 'dist', 'tmp', 'deploy']);
  settings.name = name;
  Log.logo();
  template_settings = ['framework', 'template', 'javascript', 'html', 'css'];
  includes_template_settings = _.any(_.keys(settings), function(setting) {
    return _.contains(template_settings, setting);
  });
  if (includes_template_settings) {
    return new Creator().createFromSettings(settings);
  } else {
    return new Creator().createFromPrompt(settings);
  }
});

program.command('server').description('Runs a server which builds and LiveReloads your app.').option('--ip [ip]', 'IP to run LiveReload on (default - localhost)').option('-p, --port [port]', 'Port to run server on (default - 4000)').action(function(opts) {
  return new Server().start(opts);
});

program.command('deploy').description('Deploys your app to closeheat.com via Github.').action(function() {
  Log.logo();
  return new Deployer().deploy();
});

program.command('apps').description('Shows a list of your deployed apps.').action(function() {
  return new Apps().list();
});

program.command('login').option('-t, --token [access-token]', 'Access token from closeheat.com.').description('Changes the closeheat.com access token on your computer.').action(function(opts) {
  if (opts.token) {
    return new Authorizer().saveToken(opts.token);
  } else {
    return new Authorizer().login();
  }
});

program.command('clone [app-name]').description('Clones your apps Github repository.').action(function(app_name) {
  return new Cloner().clone(app_name);
});

program.command('transform [type] [language]').description('Transforms files in current dir to other language.').action(function(type, language) {
  var Dirs, Transformer, dirs, settings;
  Log.logo();
  Dirs = require('../dirs');
  Transformer = require('../transformer');
  dirs = new Dirs({
    name: 'transforming',
    src: process.cwd(),
    dist: process.cwd()
  });
  settings = {};
  settings[type] = language;
  return new Transformer(dirs).transform(settings).then((function(_this) {
    return function() {
      return console.log('transformed', settings);
    };
  })(this));
});

program.command('help').description('Displays this menu.').action(function() {
  Log.logo(0);
  return program.help();
});

program.parse(process.argv);

if (!program.args.length) {
  if (fs.existsSync('index.html') || fs.existsSync('index.jade')) {
    new Server().start();
  } else {
    Log.logo(0);
    program.help();
  }
  return;
  tube = pictureTube({
    cols: 5
  });
  tube.pipe(process.stdout);
  logo_path = path.resolve(__dirname, './img/full.png');
  fs.createReadStream(logo_path).pipe(tube);
}
