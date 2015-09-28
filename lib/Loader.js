'use strict';
var git = require('gift');
var fs = require('fs');
var path = require('path');

module.exports = class Loader {

  constructor(options, github, resolver) {
    this.options = {
      cacheValidTime: (options.cacheValidTime || 3600) * 1000,
      cacheDirectory: options.cacheDirectory || path.join(__dirname, '../cache/components'),
      debug: options.debug || function() {}
    };
    this.github = github;
    this.resolver = resolver;
  }

  debug() {
    if(this.options.debug instanceof Function) {
      this.options.debug.apply(arguments);
    }
  }

  load(endpoint) {

    return new Promise((resolve, reject) => {
      var component;

      if((component = this.resolver.lookup(endpoint.path)) === undefined) {
        return reject(new Error(404));
      }

      this.update(component)
      .then(() => {

        try {
          fs.readFile(path.resolve(this.getComponentDirectory(component.name), component.file), (err, data) => {

            if(err) {
              return reject(err);
            }

            resolve(data);
          });
        } catch(e) {
          console.error(e);
        }

      })

    });

  }

  update(component) {

    if(this.isCached(component.name)) {
      return this.pull(component);
    } else {
      return this.clone(component);
    }

  }

  pull(component) {
    return new Promise((resolve, reject) => {

      try {
        if(this.isCacheValid(component)) {
          return resolve();
        }

        var oldUpdateTimestamp = component.updated_at;
        component.updated_at = (new Date()).getTime();

        console.log('git-pull', component.name, this.getComponentDirectory(component.name));
      
        var repo = git(this.getComponentDirectory(component.name));
        repo.pull('origin', 'master', (err) => {
          if(err) {
            component.updated_at = oldUpdateTimestamp;
            return reject(err);
          }
          resolve(repo);
        });
      } catch(e) {
        console.error(e);
      }
    });
  }

  clone(component) {
    return new Promise((resolve, reject) => {
      console.log('git-clone', component.clone_url, this.getComponentDirectory(component.name));
      git.clone(component.clone_url, this.getComponentDirectory(component.name), function(err, repo) {
        if(err) {
          return reject(err);
        } else {
          resolve(repo);
        }
      });
    })
  }

  isCacheValid(component) {
    return (component.updated_at + this.options.cacheValidTime) > (new Date()).getTime();
  }

  isCached(componentName) {
    try {
      return fs.lstatSync(this.getComponentDirectory(componentName)).isDirectory();
    } catch(e) {
      return false;
    }
  }

  getComponentDirectory(componentName) {
    return path.resolve(this.options.cacheDirectory, componentName);
  }

};
