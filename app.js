const express = require('express'),
      fs = require('fs'),
      app = express.createServer();

app.use(express.logger({ format: 'dev' }))
  .use(express.bodyParser())
  .use(express.cookieParser())
  .use(express.session({ secret: "sekrits" }))
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

  fs.readdir('./files/' + email, function(err, files) {
    if (!err) {
      res.json({ error: 'okay', filenames: files });
      return;
    }

    res.json({ error: 'okay', filenames: [] });

    fs.mkdir('./files/' + email, function(err) {
      if (err) {
        fs.mkdir('./files/', function(err) {
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

  res.sendfile('./files/' + email + '/' + name, function(err) {
    if (err) {
      res.json({ error: 'file not found' }, 404);
      next(err);
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

  fs.writeFile('./files/' + email + '/' + name, req.body.data, function(err) {
    if (err) {
      console.error('Something went horribly wrong!', err);
      res.json({ error: err });
      return;
    }

    res.json({ error: 'okay' });
  });
});

app.listen(1234, '0.0.0.0', function() {
  var addy = app.address();
  console.log('Server started on http://' + addy.address + ':' + addy.port);
});
