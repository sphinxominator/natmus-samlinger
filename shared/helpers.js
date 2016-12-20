/* global config */
const config = require('collections-online/lib/config');
let helpers = require('collections-online/shared/helpers');

helpers.documentTitle = (metadata, fallback) => {
  let title;
  let type;

  if (metadata.type === 'asset') {
    title = metadata.text['da-DK'].title;
    const player = helpers.determinePlayer(metadata);
    type = config.translations.players[player] || 'Medie';
  } else if(metadata.type === 'object') {
    title = metadata.workDescription;
    type = 'Genstand';
  }

  if(!title) {
    if(typeof(fallback) !== 'undefined') {
      title = fallback;
    } else if(type) {
      title = type + ' uden titel';
    } else {
      title = 'Dokument med ukendt type';
    }
  }
  return helpers.capitalizeFirstLetter(title);
};

helpers.documentDescription = (metadata, fallback) => {
  let description;

  if (metadata.type === 'asset') {
    description = metadata.text['da-DK'].description;
  } else if(metadata.type === 'object') {
    let dimensions = metadata.dimensions || [];
    description = dimensions
      .map(dimension => dimension.overallDescription)
      .join(', ');
  }

  if(!description && typeof(fallback) !== 'undefined') {
    description = fallback;
  } else if(!description) {
    description = 'Uden beskrivelse';
  }
  return helpers.capitalizeFirstLetter(description);
};

helpers.documentLicense = (metadata) => {
  return metadata.rights && metadata.rights.license;
};

helpers.mediaFileType = (metadata) => {
  if(metadata.file && metadata.file.mediaType) {
    let mediaType = metadata.file.mediaType;
    return config.translations.players[mediaType] || 'Medie';
  }
};

const playerFromFileMediaType = {
  'document': [
    'image/portable'
  ],
  'image': [
    'image/bitmap',
    'image/canon',
    'image/grid',
    'image/jpeg',
    'image/nikon',
    'image/photoshop',
    'image/tiff'
  ],
  'image-downloaded': [
    'image/gif'
  ],
  'audio': [
    'image/mp3'
  ],
  'video': [
    'image/mpeg-4',
    'image/mpeg'
  ]
};

helpers.determinePlayer = (metadata) => {
  if(metadata.meta && metadata.meta.rotation === 1) {
    return 'rotation';
  } else if(metadata.file && metadata.file.mediaType) {
    // Iterate the players and try to determine the player based on media type
    let player = Object.keys(playerFromFileMediaType)
    .reduce((result, player) => {
      let mediaTypes = playerFromFileMediaType[player];
      if(!result && mediaTypes.indexOf(metadata.file.mediaType) > -1) {
        return player;
      }
      return result;
    }, undefined);
    return player || 'unknown';
  } else {
    return 'unknown';
  }
};

function getFileDimensionsString(metadata, size) {
  let width = metadata.file.dimensions.width;
  let height = metadata.file.dimensions.height;
  if(typeof(size) === 'number') {
    let ratio = width / height;
    if(ratio > 1) {
      width = size;
      height = size / ratio;
    } else {
      width = size * ratio;
      height = size;
    }
  }
  return Math.round(width) + ' × ' + Math.round(height);
}

function generateSizeDownloadOption(labelPrefix, size) {
  return {
    label: metadata => {
      let dimensions = getFileDimensionsString(metadata, size);
      return labelPrefix + ' (' + dimensions + ') JPEG';
    },
    filter: (metadata, derived) => {
      if(derived.player === 'image') {
        if(typeof(size) === 'number') {
          return derived.maxSize >= size;
        } else {
          return true;
        }
      } else {
        return false;
      }
    },
    url: metadata => helpers.getDownloadURL(metadata, size),
  };
}

const AVAILABLE_DOWNLOAD_OPTIONS = [
  generateSizeDownloadOption('Lille', 800),
  generateSizeDownloadOption('Mellem', 1200),
  generateSizeDownloadOption('Stor', 2000),
  generateSizeDownloadOption('Original', 'original'),
  {
    label: metadata => {
      let type = config.translations.mediaFileTypes[metadata.file.mediaType];
      return 'Original (' + getFileDimensionsString(metadata) + ') ' + type;
    },
    filter: metadata => {
      return metadata.file.mediaType !== 'image/jpeg';
    },
    url: metadata => helpers.getDownloadURL(metadata),
  }
];

helpers.getDownloadOptions = (metadata) => {
  const hasDimensions = metadata.file && metadata.file.dimensions;
  let maxSize = hasDimensions && Math.max(metadata.file.dimensions.width,
                                          metadata.file.dimensions.height);
  let derived = {
    maxSize,
    player: helpers.determinePlayer(metadata)
  };
  return AVAILABLE_DOWNLOAD_OPTIONS.filter(option => {
    return option.filter(metadata, derived);
  }).map(option => {
    return {
      label: option.label(metadata, derived),
      url: option.url(metadata, derived)
    };
  });
};

helpers.magic360Options = function(relatedAssets) {
  let relevantAssets = relatedAssets.filter((asset) => {
    return asset.relation === 'child';
  });
  relevantAssets.sort((assetA, assetB) => {
    let nameA = assetA.file.name || '';
    let nameB = assetB.file.name || '';
    return nameA.localeCompare(nameB);
  });
  let relevantAssetUrls = relevantAssets.map((asset) => {
    return helpers.getThumbnailURL(asset, 1280);
  });
  let options = {
    'magnifier-shape': 'circle',
    'magnifier-width': '100%',
    'columns': relevantAssetUrls.length,
    'images': relevantAssetUrls.join(' ')
  };
  let result = '';
  for (var o in options) {
    result += o + ': ' + options[o] + '; ';
  }
  return result;
};

helpers.isWatermarkRequired = (metadata) => {
  return false;
};

helpers.filesizeMB = (filesize) => {
  if (filesize) {
    var mb = filesize / 1024 / 1024;
    // Formatted
    mb = helpers.decimals(mb, 1);
    return mb + ' MB';
  } else {
    return undefined;
  }
};

helpers.creators = (creators) => {
  if (creators) {
    let creatorsList = [];
    creators.every(obj => creatorsList.push(obj.name));
    return creatorsList.join(', ');
  }
};

helpers.isDownloadable = (metadata) => {
  return !metadata.rights || metadata.rights.license !== 'All Rights Reserved';
};

// TODO: Consider moving this to collections-online?
helpers.collectionLinked = (collection, collectionName) => {
  let url = `/${collection}`;
  helpers.link(url, collectionName);
};

module.exports = helpers;
