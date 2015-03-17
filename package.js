Package.describe({
  name: 'dpankros:autojoin',
  version: '0.1.0',
  // Brief, one-line summary of the package.
  summary: 'Allows simple joins to be defined from within a SimpleSchema',
  // URL to the Git repository containing the source code for this package.
  git: 'https://github.com/dpankros/meteor-autojoin',
  // By default, Meteor will default to using README.md for documentation.
  // To avoid submitting documentation, set this field to null.
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.use('check', ['client', 'server']);
  api.use('mongo', ['client', 'server']);
  api.use('aldeed:simple-schema@1.3.0', ['client', 'server']);
  api.use('aldeed:collection2@2.3.2', ['client', 'server']);
  api.versionsFrom('1.0.3.2');

  api.addFiles('meteor-autojoin-prefs.js');
  api.addFiles('meteor-autojoin-util.js');
  api.addFiles('meteor-autojoin-private.js');
  api.addFiles('meteor-autojoin-mongo.js');
  api.addFiles('meteor-autojoin.js');

  api.export('AutoJoin', ['client', 'server']);
});

Package.onTest(function(api) {
  api.use('mongo', ['client', 'server']);
  api.use('tinytest');
  api.use('aldeed:simple-schema@1.3.0', ['client', 'server']);
  api.use('aldeed:collection2@2.3.2', ['client', 'server']);
  api.use('dpankros:autojoin');
  api.addFiles('meteor-autojoin-tests.js');
});
