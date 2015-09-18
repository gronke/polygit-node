'use strict';

var superagent = require('superagent');
var path = require('path');
var fs = require('fs');

var resolutionCache = {};

module.exports = class Resolver {

  constructor(options, github) {
    this.options = {
      organizations: [
        'Polymer',
        'PolymerElements'
      ],
      cacheValidTime: 3600,
      cacheFile: options.cacheFile || path.resolve(__dirname, '../cache/registry.json')
    };

    this.github = github;

    this.readCache()
    .then(() => {
      console.log('using registry cache (' + this.itemCount + ' items)');
    })
    .catch((e) => {

      var promises = [];
      this.options.organizations.forEach((org) => {
        promises.push(this.pollRepos(org));
      });

      Promise.all(promises)
      .then(() => {
        this.writeCache();
      })
      .catch((e) => {
        console.errror('caching failed');
        console.error(e.stack);
      });

    });
  }

  lookup(assetName) {
    var asset;
    Object.keys(resolutionCache).forEach((registryItemName) => {
      if(!asset && (assetName.indexOf(registryItemName) === 0)) {
        asset = {
          name: registryItemName,
          file: assetName.slice(registryItemName.length + 1),
          clone_url: resolutionCache[registryItemName].clone_url,
          updated_at: resolutionCache[registryItemName].updated_at
        };
      }
    });
    return asset;
  }

  pollRepos(organization) {

    return new Promise((resolve, reject) => {

      try {
        this.github.repos.getFromOrg({
          org: organization,
          per_page: 100 // max 100, see https://developer.github.com/guides/traversing-with-pagination/
        }, function(err, res) {

          if(err) {
            console.log(err);
            reject(err);
            return;
          }

          res.forEach((repo) => {
            if(!resolutionCache.hasOwnProperty(repo.name)) {
              console.log('indexing ' + repo.name + ' => ' + repo.clone_url);
              resolutionCache[repo.name] = {
                updated_at: (new Date()).getTime(),
                clone_url: repo.clone_url
              }
            }
          });

          resolve();

        });
      } catch(e) {
        reject(e);
      }
    });

  }

  readCache() {

    return new Promise((resolve, reject) => {
      var stat, content;

      try {
        
        stat = fs.statSync(this.options.cacheFile);
        if((stat.atime.getTime() + this.options.cacheValidTime) > (new Date()).getTime()) {
          return reject(new Error('registry cache outdated'));
        }

        content = fs.readFileSync(this.options.cacheFile);
        resolutionCache = JSON.parse(content);
        console.log('read ' + this.itemCount + ' items from cache');

      } catch(e) {
        return reject(e);
      }

      resolve();
    });

  }

  writeCache() {
    fs.writeFileSync(this.options.cacheFile, JSON.stringify(resolutionCache));
    console.log('written ' + Object.keys(resolutionCache).length + ' entries to ' + this.options.cacheFile);
  }

  resolveVersion(assetName, version) {
    version = version || 'master';
    return version;
  }

  get itemCount() {
    return Object.keys(resolutionCache).length;
  }

}
