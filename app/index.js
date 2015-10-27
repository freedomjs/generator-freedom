/* jslint node:true */
/* globals module,require */

'use strict';
var generators = require('yeoman-generator');
var yosay = require('yosay');
var appname, shortname, freedomsource, freedomtype, git, jshint, gruntfile,
    license;
var freedomchoices = ['freedom', 'freedom-for-firefox', 'freedom-for-chrome'];
// Core files of freedom module, to be copied into src/
var srcfiles = ['freedom-module.js', 'freedom-module.json', 'index.html',
		            'page.js', 'static/freedomjs-icon.png', 'static/style.css'];
// Base project files, to be copied into / (project root)
var basefiles = ['README.md'];

console.log(yosay('Welcome to freedom.js! Some tips:\n' +
		              '(1) The defaults are sane and simple.\n' +
		              '(2) When in doubt, look it up - I can wait!\n' +
		              '(3) You probably want vanilla "freedom" from npm.\n' +
		              'Thanks, and have fun re-decentralizing the web!',
		              { maxLength: 50 }));

module.exports = generators.Base.extend({
  // Using multiple prompts because later ones depend on earlier ones
  prompt1: function () {
    var done = this.async();
    this.prompt([
      {
        type    : 'input',
        name    : 'name',
        message : 'What is your project name (used in package.json)?',
        default : this.appname  // Default to current folder name
      },
      {
        type    : 'input',
        name    : 'shortname',
        message : 'What is a short name for your project (used for filenames)?',
        default : this.appname.split(/[\s-]/)[0].toLowerCase()
      },
      {
        type    : 'list',
        name    : 'freedomsource',
        message : 'How would you like to get freedom.js?',
        choices : [ 'npm', 'bower', 'webapp template', 'freedomjs.org' ]
      },
      {
        type    : 'confirm',
        name    : 'jshint',
        message : 'Would you like a provided (strict) .jshintrc?',
        default : true
      },
      {
        type    : 'confirm',
        name    : 'git',
        message : 'Would you like to to initiate a git repo?',
        default : true
      },
      {
        type    : 'confirm',
        name    : 'license',
        message : 'Would you like to to generate a license',
        default : true
      }
    ], function (answers) {
      appname = answers.name;
      shortname = answers.shortname;
      freedomsource = answers.freedomsource;
      jshint = answers.jshint;
      git = answers.git;
      license = answers.license;

      if (freedomsource === 'npm') {
        freedomchoices.push('freedom-for-node');
      }
      if (jshint) {
	      basefiles.push('.jshintrc');
      }
      if (git) {
	      basefiles.push('.gitignore');
      }
      done();
    }.bind(this));
  },
  prompt2: function () {
    if (freedomsource !== 'webapp template') {
      var done = this.async();
      this.prompt([
	      {
          type    : 'list',
          name    : 'freedomtype',
          message : 'Which flavor of freedom.js would you like ' +
            '(if uncertain, choose "freedom")?',
          choices : freedomchoices
	      },
	      {
          type    : 'confirm',
          name    : 'gruntfile',
          message : 'Would you like to make a Gruntfile (requires npm)?',
          default : true
	      }
      ], function (answers) {
        freedomtype = answers.freedomtype;
	      gruntfile = answers.gruntfile;
        done();
      }.bind(this));
    }
  },
  getfreedom: function () {
    // TODO - either adjust the demo to work with all freedom flavors
    // or at least message the user that they'll need to adjust it themselves
    if (freedomsource === 'npm') {
      this.npmInstall([freedomtype]);
    } else if (freedomsource === 'bower') {
      // NOTE - seems like only vanilla freedom is on bower right now
      // but I think the right fix is to publish the others there
      this.bowerInstall([freedomtype]);
    } else if (freedomsource === 'freedomjs.org') {
      var freedomurl = 'http://www.freedomjs.org/dist/latest/' + freedomtype +
          '.js';
      if (freedomtype === 'freedom-for-firefox') {
        freedomurl += 'm';  // ff addon uses .jsm files
      }
      this.fetch(freedomurl, 'deps/',
                 function (err) { if (err) { console.error(err); } } );
    } else if (freedomsource === 'webapp template') {
      srcfiles.push('freedom.js');  // Get freedom from GitHub starter template
    }
  },
  getcorefiles: function () {
    if (!gruntfile) {
      basefiles.push('runserver.sh');  // No grunt -> basic demo server
    }
    var done = this.async();
    this.remote(
      'freedomjs', 'freedom-starter', 'master', function(err, remote) {
	      if(err) {
	        return done(err);
	      }
	      srcfiles.forEach(function(element, index, array) {
          var target;
          if (element.match('freedom-module')) {
            target = element.replace('freedom-module', shortname);
          } else {
            target = element;
          }
	        remote.copy('src/' + element, 'src/' + target);
	      });
	      basefiles.forEach(function(element, index, array) {
	        remote.copy(element, element);
	      });
	      done();
      }, true);  // true -> force fresh pull each time
  },
  setupgrunt: function () {
    if (gruntfile) {
      this.npmInstall(['grunt-contrib-clean', 'grunt-contrib-connect',
                       'grunt-contrib-copy', 'grunt-contrib-jshint'],
                      { 'saveDev': true });
      var freedompath;
      if (freedomsource === 'npm') {
        freedompath = 'require.resolve(\'' + freedomtype + '\')';
      } else if (freedomsource === 'bower') {
        // TODO figure proper way to copy bower-installed freedom
      } else if (freedomsource === 'freedomjs.org') {
        freedompath = '\'deps/' + freedomtype + '.js';
        if (freedomtype === 'freedom-for-firefox') {
          freedompath += 'm';  // FF addon uses .jsm files
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
    this.spawnCommand('git', ['init']);
  },
  license: function () {
    // The prompt can appear while other things are going and look funny
    // But it seems to still work and not be too terrible
    if (license) {
      this.composeWith('license', {}, {
	      local: require.resolve('generator-license')
      });
    }
  }
});
