Polygit
=======

Polygit is a Web-Components Cache Proxy inspired by [polygit.org](http://polygit.org/). This spike is made to explore the capabilities of `<base>` header element to provide an easy-to-use development stack for Web-Components.

__Warning__: This package is an experimental draft and not ready for productive usage yet.

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
