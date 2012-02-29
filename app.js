const express = require('express'),
      fs = require('fs'),
      app = express.createServer(),
      CONFIG = require('config'),
      storage = CONFIG.server.storageDirectory;

app.use(express.logger(CONFIG.logger))
  .use(express.bodyParser())
  .use(express.cookieParser())
  .use(express.session(CONFIG.session))
  // Allow everything to be used with CORS.
  // This should be limited somehow...
  .use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", req.header('Origin'));
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT");
    next();
  });

require('express-browserid').plugAll(app);

app.get('/files', function(req, res) {
  var email = req.session.email;

  if (!email) {
    res.json({ error: 'unauthorized' }, 403);
    return;
  }

  fs.readdir(storage + email, function(err, files) {
    if (!err) {
      res.json({ error: 'okay', filenames: files });
      return;
    }

    res.json({ error: 'okay', filenames: [] });

    fs.mkdir(storage + email, function(err) {
      if (err) {
        fs.mkdir(storage, function(err) {
          if (err) {
            console.error('Something went horribly wrong!', err);
          }
        });
      }
    });
  });
});

app.get('/files/:name', function(req, res) {
  var email = req.session.email,
      name = req.params.name;

  if (!email) {
    res.json({ error: 'unauthorized' }, 403);
    return;
  }

  res.sendfile(storage + email + '/' + name, function(err) {
    if (err) {
      res.json({ error: 'file not found' }, 404);
    }
  });
});

app.put('/files/:name', function(req, res) {
  var email = req.session.email,
      name = req.params.name;
  
  if (!email) {
    res.json({ error: 'unauthorized' }, 403);
    return;
  }

  fs.writeFile(storage + email + '/' + name, req.body.data, function(err) {
    if (err) {
      console.error('Something went horribly wrong!', err);
      res.json({ error: err });
      return;
    }

    res.json({ error: 'okay' });
  });
});

app.listen(CONFIG.server.bindPort, CONFIG.server.bindIP, function() {
  var addy = app.address();
  console.log('Server started on http://' + addy.address + ':' + addy.port);
  console.log('Press Ctrl+C to stop');
});
