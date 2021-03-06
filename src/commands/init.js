var fs = require('fs');
var ff = require('ff');
var path = require('path');

var color = require('cli-color');

var commands = require('./index');
var apps = require('../apps');

var BaseCommand = require('../util/BaseCommand').BaseCommand;
var UsageError = require('../util/BaseCommand').UsageError;

var DestinationExistsError = apps.DestinationExistsError;

var InitCommand = Class(BaseCommand, function (supr) {

  this.name = 'init';
  this.description = 'creates a new devkit app';

  this.init = function () {
    supr(this, 'init', arguments);
    this.opts
      .boolean('no-template')
      .describe('no-template', 'copy no files other than manifest.json')
      .describe('local-template', 'path to local application template')
      .describe('git-template', 'path to git repository');
  };

  this.exec = function (args, cb) {
    return Promise.bind(this).then(function () {
      // check the app name
      var appPath = args.shift();
      var errorMessage;

      if (!appPath) {
        // TODO: print usage
        errorMessage = 'No app name provided';
        this.logger.error(errorMessage);
        return Promise.reject(new UsageError(errorMessage));
      }

      var appName = path.basename(appPath);
      if (!appName) {
        // TODO: refactor and print usage
        errorMessage = 'No app name provided';
        this.logger.error(errorMessage);
        return Promise.reject(new UsageError(errorMessage));
      }

      this.appName = appName;

      if (!/^[a-z][a-z0-9]*$/i.test(appName)) {
        errorMessage = 'App name must start with a letter and consist only of' +
          'letters and numbers';
        this.logger.error(errorMessage);
        return Promise.reject(new UsageError(errorMessage));
      }

      this.appPath = appPath = path.resolve(process.cwd(), appPath);

      var template = {type: void 0};

      if (this.opts.argv.template !== void 0) {
        template.type = 'none';
        template.path = '';
      } else if (this.opts.argv['local-template']) {
        template.type = 'local';
        template.path = this.opts.argv['local-template'];
      } else if (this.opts.argv['git-template']) {
        template.type = 'git';
        template.path = this.opts.argv['git-template'];
      }

      // create the app
      return apps.create(appPath, template);
    }).then(function (app) {

      // change to app root and run install command
      process.chdir(app.paths.root);
      return commands.get('install').exec([]);

    }).then(function () {

      // Success message
      this.logger.log(
        color.cyanBright('created new app'), color.yellowBright(this.appName)
      );

      return new Promise(function (resolve) {
        commands.get('instructions').exec(['new_application'], resolve);
      });

    }).catch(DestinationExistsError, function (err) {
      this.logger.error(
        'The path you specified (' + err.message + ') already exists.',
        'Aborting.'
      );
    }).catch(function (err) {
      console.error(err);
    }).nodeify(cb);
  };
});


module.exports = InitCommand;
