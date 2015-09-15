'use strict';
var superagent = require('superagent');
var path = require('path');

module.exports = class GitHub {

  constructor(options) {
    this.options = {
      organizations: [
        'PolymerElements',
        'Polymer'
      ]
    };
  }

  lookup(componentName) {

    var organization, i;
    this.options.organizations.forEach(function(org) {

      org = org;
      if((i = componentName.indexOf(org + '/')) !== -1) {
        organization = org;
        componentName = componentName.slice(i + org.length + 1);
      }

    });

    if(!organization) {
      organization = this.options.organizations[0];
    }

    organization = this.rewriteOrganization(componentName, organization);

    return organization + '/' + componentName;
  }

  resolve(componentName, version) {
    version = version || 'master';
    return version;
  }

  getFullUrl(endpoint) {
    console.log(endpoint);
    return path.join(
      this.basePath, 
      this.lookup(endpoint.name), 
      this.resolve(endpoint.name, endpoint.version), 
      endpoint.file
    );
  }

  getFullPath(endpoint) {
    return path.join(
      this.lookup(endpoint.name), 
      this.resolve(endpoint.name, endpoint.version), 
      endpoint.file
    );
  }

  get basePath() {
    return 'https://raw.githubusercontent.com';
  }

  rewriteOrganization(componentName, org) {
    switch(componentName) {
      case 'polymer':
        return 'Polymer';
        break;
    }
    return org;
  }

}
