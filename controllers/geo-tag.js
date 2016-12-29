const config = require('collections-online/lib/config');
const geoTag = require('collections-online-cumulus/controllers/geo-tag');
const ds = require('collections-online/lib/services/documents');

const natmusApi = require('../services/natmus-api');

module.exports.save = (metadata) => {
  const id = metadata.collection + '-' + metadata.id;
  return natmusApi.expectChanges('asset', id)
  .then((currentMetadata) => {
    return geoTag.save(metadata);
  });
};

module.exports.updateIndex = (metadata) => {
  const id = metadata.collection + '-' + metadata.id;
  return natmusApi.pollForChange('asset', id);
};
