'use strict';
var generators = require('yeoman-generator');
var appname, freedomsource, freedomtype, git, gruntfile, bootstrap;
var freedomchoices = ['freedom', 'freedom-for-firefox', 'freedom-for-chrome'];
var srcpath = './';
var corefiles = ['freedom-module.js', 'freedom-module.json', 'index.html',
		 'page.js', 'static/freedomjs-icon.png', 'static/style.css'];

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
        choices : [ 'webapp template', 'npm', 'bower', 'freedomjs.org' ]
      },
      {
        type    : 'confirm',
        name    : 'git',
        message : 'Would you like to to initiate a git repo?',
        default : true
      }
    ], function (answers) {
      appname = answers.name;
      freedomsource = answers.freedomsource;
      if (freedomsource === 'npm') {
        freedomchoices.push('freedom-for-node');
      }
      git = answers.git;
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
	},
	{
          type: 'checkbox',
          name: 'subgenerators',
          message: 'What subgenerators would you like (requirements vary)?',
          choices: [{
            name: 'bootstrap',
            checked: false
          }]
	}
      ], function (answers) {
        freedomtype = answers.freedomtype;
	gruntfile = answers.gruntfile;
	bootstrap = answers.subgenerators.indexOf('bootstrap') !== -1;
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
      var freedomurl = 'http://www.freedomjs.org/dist/latest/' + freedomtype + '.js';
      if (freedomtype === 'freedom-for-firefox') {
        freedomurl += 'm';  // ff addon uses .jsm files
      }
      this.fetch(freedomurl, 'deps/',
                 function (err) { if (err) { console.error(err); } } );
    } else if (freedomsource === 'webapp template') {
      corefiles.push('freedom.js');  // Get freedom from GitHub starter template
    }
  },
  getcorefiles: function () {
    if (gruntfile) {
      srcpath += 'src/';
    } else {
      corefiles.push('runserver.sh');  // No grunt -> basic demo server
    }
    var done = this.async();
    this.remote(
      'freedomjs', 'freedom-starter', 'master', function(err, remote) {
	if(err) {
	  return done(err);
	}
	corefiles.forEach(function(element, index, array) {
	  remote.copy(element, srcpath + element);
	});
	done();
      }, true);  // last 'true' forces the repo to refresh even if cached
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
    if (git) {
      this.fs.copyTpl(
        this.templatePath('.gitignore'),
        this.destinationPath('.gitignore')
      );
      this.spawnCommand('git', ['init']);
    }
  }
});
