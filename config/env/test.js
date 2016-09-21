'use strict';

var _ = require('lodash');
var base = require('./base');

module.exports = _.merge(base, {
  env: 'test',
  ip:   process.env.OPENSHIFT_NODEJS_IP ||
        process.env.IP ||
        '0.0.0.0',
  port: process.env.OPENSHIFT_NODEJS_PORT ||
        process.env.PORT ||
        9000,
  viewsPath: '/views',
  siteTitle: 'Nationalmuseets Samlinger Online (beta)',
  es: {
    host: '172.16.1.222:80',
    assetsIndex: 'test_assets',
    allIndecies: [
      'test_assets',
      'dev_mom_objects_public',
      'dev_es_objects_public',
      'dev_as_objects_public',
      'dev_fhm_objects_public',
      'dev_dnt_objects_public',
      'dev_kmm_objects_public',
      'dev_mus_objects_public',
      'dev_flm_objects_public'
    ]
  },
  natmusApiBaseURL: 'http://testapi.natmus.dk/',
  googleAnalyticsPropertyID: 'UA-2930791-7'
});
