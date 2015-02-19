#!/usr/bin/env node

var Apps, Authorizer, Cloner, Creator, Deployer, Initializer, Server, fs, images, logo_path, path, pictureTube, program, tube, _;

program = require('commander');

_ = require('lodash');

fs = require('fs.extra');

path = require('path');

images = require('ascii-images');

Creator = require('../creator');

Server = require('../server');

Initializer = require('../initializer');

Deployer = require('../deployer');

Apps = require('../apps');

Authorizer = require('../authorizer');

Cloner = require('../cloner');

program.version('0.0.1').usage('<keywords>');

program.command('create [app-name]').alias('c').description('Creates a new app with clean setup and directory structure.').option('-f, --framework [name]', 'Framework').option('-t, --template [name]', 'Template').option('--javascript [name]', 'Javascript precompiler').option('--html [name]', 'HTML precompiler').option('--css [name]', 'CSS precompiler').option('--tmp [path]', 'The path of temporary directory when creating').option('--dist [path]', 'Path of destination of where to create app dir').action(function(name, opts) {
  var settings;
  settings = _.pick.apply(_, [opts, 'framework', 'template', 'javascript', 'html', 'css', 'dist', 'tmp']);
  settings.name = name;
  if (_.isEmpty(_.omit(settings, 'name'))) {
    return new Creator().createFromPrompt(settings);
  } else {
    return new Creator().createFromSettings(settings);
  }
});

program.command('server').option('--ip [ip]', 'IP to run LiveReload on (default - localhost)').option('-p, --port [port]', 'Port to run server on (default - 4000)').action(function(opts) {
  return new Server().start(opts);
});

program.command('init').action(function() {
  return new Initializer().init();
});

program.command('deploy').action(function() {
  return new Deployer().deploy();
});

program.command('apps').action(function() {
  return new Apps().showList();
});

program.command('login [access-token]').action(function(access_token) {
  return new Authorizer().login(access_token);
});

program.command('clone [app-name]').action(function(app_name) {
  return new Cloner().clone(app_name);
});

program.command('help').action(function() {
  return program.help();
});

fs = require('fs');

pictureTube = require('picture-tube');

tube = pictureTube({
  cols: 5
});

tube.pipe(process.stdout);

logo_path = path.resolve(__dirname, '../img/full.png');

fs.createReadStream(logo_path).pipe(tube);

images(logo_path, function(logo) {
  program.parse(process.argv);
  if (!program.args.length) {
    if (fs.existsSync('index.html') || fs.existsSync('index.jade')) {
      new Server().start();
    } else {
      program.help();
    }
  }
});
