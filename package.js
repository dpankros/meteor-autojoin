Package.describe({
  name: 'dpankros:autojoin',
  version: '0.0.1',
  // Brief, one-line summary of the package.
  summary: 'Allows simple joins to be defined from within a SimpleSchema',
  // URL to the Git repository containing the source code for this package.
  git: '',
  // By default, Meteor will default to using README.md for documentation.
  // To avoid submitting documentation, set this field to null.
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.use('aldeed:simple-schema', ['client', 'server']);
  api.use('check', ['client', 'server']);
  api.use('mongo', ['client', 'server']);
  api.versionsFrom('1.0.3.2');
  api.addFiles('meteor-autojoin.js');
});

Package.onTest(function(api) {
  api.use('tinytest');
  api.use('meteor-autojoin');
  api.addFiles('meteor-autojoin-tests.js');
});
