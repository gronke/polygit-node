Polygit
=======

Polygit is a Web-Components Cache Proxy inspired by [polygit.org](http://polygit.org/). This spike is made to explore the capabilities of `<base>` header element to provide an easy-to-use development stack for Web-Components.

__Warning__: This package is an experimental draft and not ready for productive usage yet.

Hot it works
------------

After startup this web-components proxy will index the `Polymer` and `PolymerElements` GitHub organization's repositories.

The `<base href="http://example.org/components/">` head tag redirects browser asset requests to the given base location. That can be used to pipe them through this proxy, so that known repositories from the built index can be cloned to a cache location on the server and passed to the client. 

Unknown repositories end up with a `302 Redirect` to the concatenation of the proxy request header referer URL, `/bower_components/` and the requested file

```
{{req.header.referer}}/bower_components/{{requestedFile}}
```

That allows the client to fall-back to local assets places in `bower_components/`, where custom elements can be provided, but comes with the tradeof that all requests to local assets first bounce at the proxy server. 

For development purposes a 302 Redirect is used, so that browser do not accidentally store invalid redirects.


Requirements
------------
- Node >= 4.0

Setup
-----
```bash
git clone https://github.com/gronke/polygit-node.git
cd polygit-node
npm install
```

Run
---
```bash
node --harmony index.js
```

Examples
--------

### local

Run the proxy cache server and open [the demo](http://127.0.0.1:3333) in your browser.

### jsbin.com

Run the proxy cache server locally and copy this snippet to your jsbin.

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>JS Bin</title>
  <base href="http://127.0.0.1:3333/polygit">
  <link rel="import" href="../paper-button/paper-button.html">
</head>
<body>
  <paper-button>Foo</paper-button>
</body>
</html>
```

References
----------

- [PolymerLabs/polygit](https://github.com/PolymerLabs/polygit)
