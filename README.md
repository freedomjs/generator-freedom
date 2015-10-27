generator-freedom
=================

Yeoman generator for freedom.js web
applications. Current capabilities:

- fetch freedom.js (either regular or platform-specific flavors) from
npm, bower, [GitHub](https://github.com/freedomjs/freedom-starter), or [freedomjs.org](http://freedomjs.org/)
- create appropriate freedom.js-specific boilerplate files for a
  simple working demo application ([Counter](http://www.freedomjs.org/dist/freedom/latest/demo/counter/))
- Perform various optional tasks:
    - Initiate a git repository with appropriate .gitignore
    - Create a strict `.jshintrc` (for [code quality](http://jshint.com/docs/))
    - Create a Gruntfile with some useful tasks (installing needed npm packages)
    - [Generate a license](https://www.npmjs.com/package/generator-license)

Current known issues:
- Need to publish other freedom.js flavors to bower
- Demo application only works with regular freedom.js (i.e. not
  Chrome/Firefox/Node versions)
- Could use more testing (i.e. it's not been run much on many
  platforms -
  [filing issues](https://github.com/freedomjs/generator-freedom/issues)
  is very welcome!)

Planned features:
- Options to load in more advanced freedom.js functionality (see
  [freedom.js interfaces](https://github.com/freedomjs/freedom/tree/master/interface))
- Secondary generator to customize freedom app API (in manifest.json
  file)
- Boilerplate for tests and test running
- Maybe more optional features/3rd party integration (make git repo on
  GitHub, test running on 3rd party services, packaging/deploying app, etc.)
