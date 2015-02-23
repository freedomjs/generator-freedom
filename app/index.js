'use strict';
var generators = require('yeoman-generator');
var appname, freedomsource, freedomtype, git, gruntfile, bootstrap;
var freedomchoices = ['freedom', 'freedom-for-firefox', 'freedom-for-chrome'];

module.exports = generators.Base.extend({
  // Using multiple prompts because later ones depend on earlier ones
  prompt1: function () {
    var done = this.async();
    this.prompt([
      {
        type    : 'input',
        name    : 'name',
        message : 'What is your project name?',
        default : this.appname  // Default to current folder name
      },
      {
        type    : 'list',
        name    : 'freedomsource',
        message : 'How would you like to get freedom.js?',
        choices : [ 'npm', 'bower', 'freedomjs.org' ]
      },
      {
        type    : 'confirm',
        name    : 'git',
        message : "Would you like to to use git?",
        default : true
      },
      {
        type    : 'confirm',
        name    : 'gruntfile',
        message : "Would you like to make a Gruntfile (requires npm)?",
        default : true
      },
      {
        type    : 'confirm',
        name    : 'bootstrap',
        message : "Would you like to use Bootstrap (requires bower)?",
        default : false
      }
    ], function (answers) {
         appname = answers.name;
         freedomsource = answers.freedomsource;
         if (freedomsource !== 'freedomjs.org') {
           freedomchoices.push('freedom-for-node');
         }
         git = answers.git;
         gruntfile = answers.gruntfile;
         bootstrap = answers.bootstrap;
         done();
       }.bind(this));
  },
  prompt2: function () {
    var done = this.async();
    this.prompt([
      {
        type    : 'list',
        name    : 'freedomtype',
        message : 'Which flavor of freedom.js would you like ' +
          '(if uncertain, choose "freedom")?',
        choices : freedomchoices
      }
    ], function (answers) {
         freedomtype = answers.freedomtype;
         done();
       }.bind(this));
  },
  getfreedom: function () {
    if (freedomsource === 'npm') {
      this.npmInstall([freedomtype]);
    } else if (freedomsource === 'bower') {
      // NOTE - seems like only vanilla freedom is on bower right now
      // but I think the right fix is to publish the others there
      this.bowerInstall([freedomtype]);
    } else if (freedomsource === 'freedomjs.org') {
      var freedomurl = 'http://www.freedomjs.org/dist/latest/' + freedomtype + '.js';
      if (freedomtype === 'freedom-for-firefox') {
        freedomurl += 'm';  // ff addon uses .jsm files
      }
      this.fetch(freedomurl, 'deps/',
                 function (err) { if (err) { console.error(err); } } );
    }
  },
  copycorefiles: function () {
    this.fs.copyTpl(
      this.templatePath('manifest.json'),
      this.destinationPath('src/manifest.json'),
      { appname: appname }
    );
    this.fs.copyTpl(
      this.templatePath('index.html'),
      this.destinationPath('src/index.html'),
      { appname: appname }
    );
    this.fs.copyTpl(
      this.templatePath('main.js'),
      this.destinationPath('src/main.js'),
      { appname: appname }
    );
    // TODO - use bootstrap instead of this when requested
    this.fs.copyTpl(
      this.templatePath('style.css'),
      this.destinationPath('src/static/style.css')
    );
  },
  getbootstrap: function() {
    if (bootstrap) {
      this.composeWith('backbone:route', {}, {
        local: require.resolve('generator-bootstrap')
      });
    }
  },
  setupgrunt: function () {
    if (gruntfile) {
      this.npmInstall(['grunt-contrib-clean', 'grunt-contrib-connect',
                       'grunt-contrib-copy', 'grunt-contrib-jshint']);
      var freedompath;
      if (freedomsource === 'npm') {
        freedompath = 'require.resolve(\'' + freedomtype + '\')';
      } else if (freedomsource === 'bower') {
        // TODO figure proper way to copy bower-installed freedom
      } else if (freedomsource === 'freedomjs.org') {
        freedompath = '\'deps/' + freedomtype + '.js';
        if (freedomtype === 'freedom-for-firefox') {
          freedompath += 'm';  // ff addon uses .jsm files
        }
        freedompath += '\'';
      }
      this.fs.copyTpl(
        this.templatePath('Gruntfile.js'),
        this.destinationPath('Gruntfile.js'),
        { appname: appname, freedompath: freedompath }
      );
      this.fs.copyTpl(
        this.templatePath('package.json'),
        this.destinationPath('package.json'),
        { appname: appname }
      );
    }
  },
  setupgit: function () {
    if (git) {
      this.spawnCommand('git', ['init']);
      this.fs.copyTpl(
        this.templatePath('.gitignore'),
        this.destinationPath('.gitignore')
      );
    }
  }
});