'use strict';

var superagent = require('superagent');
var path = require('path');
var fs = require('fs');

var resolutionCache = {};

module.exports = class Resolver {

  constructor(options, github) {
    this.options = {
      organizations: [
        'PolymerElements',
        'Polymer'
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

      let orgs = this.options.organizations;

      (new Promise((resolve, reject) => {
 
        let poll_then, poll_next;
  
        poll_then = () => {
          if(!poll_next(poll_then)) {
            console.log('Resolver finished loading');
            resolve();
          }
        }
  
        poll_next = (cb) => {
          if(orgs && orgs.length) {
            console.log('Polling GitHub organization repositories for', orgs[0]);
            this.pollRepos(orgs.shift())
            .then(cb);
            return true;            
          } else {
            return false;
          }
        }
  
        if(!orgs || !orgs.length) {
          throw new Error('No organizations defined');
        }

        poll_next(poll_then);
  
      }))
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

  pollRepos(organization, page) {

    page = page || 1;

    return new Promise((resolve, reject) => {

      try {
        this.github.repos.getFromOrg({
          org: organization,
          page: page,
          per_page: 100 // max 100, see https://developer.github.com/guides/traversing-with-pagination/
        }, (err, res) => {

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

          if(res.length === 100) {
            this.pollRepos(organization, page + 1)
            .then(resolve);
          } else {
            resolve();
          }

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
