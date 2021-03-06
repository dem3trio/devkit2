var fs = require('fs');
var path = require('path');

var BaseCommand = require('../util/BaseCommand').BaseCommand;

var VersionCommand = Class(BaseCommand, function (supr) {

  this.name = 'which';
  this.description = 'prints the full path to DevKit';
  this.alias = ['version', 'v'];

  this.exec = function () {
    console.log(path.join(__dirname, '..', '..'));
  }
});

module.exports = VersionCommand;
