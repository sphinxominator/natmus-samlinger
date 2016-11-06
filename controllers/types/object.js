'use strict';

const es = require('collections-online/lib/services/elasticsearch');
const documentCtrl = require('collections-online/lib/controllers/document');
const config = require('collections-online/lib/config');
const section = require('collections-online/lib/section');
const objectSection = section('object');

const Q = require('q');
const request = require('request');
const querystring = require('querystring');

function getObject(req) {
  let deferred = Q.defer();
  let id = req.params.id;
  let collection = req.params.collection;

  let query = {
    sourceId: id,
    collection
  };
  let queryString = Object.keys(query).map((key) => {
    return key + ':' + query[key];
  }).join(' AND ');

  let qs = querystring.stringify({
    query: queryString,
    size: 1
  });

  let url = 'http://testapi.natmus.dk/search/public/elasticSearchString?' + qs;
  request({
    url,
    json: true
  }, (err, res, body) => {
    if(err) {
      deferred.reject(err);
    } else {
      let results = body.results;
      if(body.numberOfResultsTotal > 1) {
        let err = new Error('The API returned more than one record');
        deferred.reject(err);
      } else if(body.numberOfResultsTotal === 0) {
        let err = new Error('The API returned no records');
        err.status = 404;
        deferred.reject(err);
      } else {
        deferred.resolve(results[0].data || {});
      }
    }
  });
  return deferred.promise;
}

/**
 * Renders an asset's landing page
 */
exports.index = function(req, res, next) {
  return getObject(req).then((metadata) => {
    return {
      'metadata': metadata,
      'objectSection': objectSection({}),
      'req': req
    };
  })
  .then(function(renderParameters) {
    if (renderParameters) {
      res.render('object.jade', renderParameters);
    }
  })
  .then(null, function(error) {
    if (error.message === 'Not Found') {
      error.status = 404;
    }
    next(error);
  });
};
