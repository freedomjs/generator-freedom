'use strict';
var generators = require('yeoman-generator');
var appname, freedomsource, freedomtype;

module.exports = generators.Base.extend({
  prompting: function () {
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
        type    : 'list',
        name    : 'freedomtype',
        message : 'Which flavor of freedom.js would you like?',
        choices : [ 'freedom', 'freedom-for-firefox',
                    'freedom-for-chrome', 'freedom-for-node' ]
      }
    ], function (answers) {
         appname = answers.name;
         freedomsource = answers.freedomsource;
         freedomtype = answers.freedomtype;
         done();
       }.bind(this));
  },
  getfreedom: function() {
    if (freedomsource === 'npm') {
      this.npmInstall([freedomtype]);
    } else if (freedomsource === 'bower') {
      // NOTE - seems like only vanilla freedom is on bower right now
      // but I think the right fix is to publish the others there
      this.bowerInstall([freedomtype]);
    } else if (freedomsource === 'freedomjs.org') {
      freedomtype += '.js';
      if (freedomtype === 'freedom-for-firefox.js') {
        freedomtype += 'm';  // ff addon uses .jsm files
      }
      this.fetch('http://www.freedomjs.org/dist/latest/' + freedomtype, './',
                 function (err) { if (err) { console.error(err); } } );
    }
  }
});