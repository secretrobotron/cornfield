const express = require('express'),
      path = require('path'),
      app = express.createServer(),
      poorDB = {};

poorDB['jon@jbuckley.ca'] = {
  'Template 1': {
    'popcorn': 1
  },
  'Template 2': {
    'herpderp': 2
  }
}

app.use(express.logger({ format: 'dev' }))
  .use(express.static(path.join(__dirname, '.')))
  .use(express.bodyParser())
  .use(express.cookieParser())
  .use(express.session({ secret: "sekrits" }));

require('express-browserid').plugAll(app);

app.get('/whoami', function(req, res) {
  res.json({email: req.session.email});
});

app.get('/files', function(req, res) {
  var email = req.session.email,
      files = [];

  if (!email) {
    res.json({ error: 'unauthorized' }, 403);
    return;
  }

  if (poorDB[email]) {
    files = Object.keys(poorDB[email]);
  }

  res.json({ error: 'okay', filenames: files });
});

app.get('/file/:name', function(req, res) {
  var email = req.session.email,
      name = req.params.name;

  if (!email) {
    res.json({ error: 'unauthorized' }, 403);
    return;
  }

  if (!poorDB[email] || !poorDB[email][name]) {
    res.json({ error: 'file not found' }, 404);
    return;
  }

  res.json({ error: 'okay', data: poorDB[email][name] });
});

app.post('/file/:name', function(req, res) {
  var email = req.session.email,
      name = req.params.name;
  
  if (!email) {
    res.json({ error: 'unauthorized' }, 403);
    return;
  }

  if (!poorDB[email]) {
    poorDB[email] = {};
  }

  poorDB[email][name] = req.body;
  res.json({ error: 'okay' });
});

app.listen(8080, '127.0.0.1', function() {
  var addy = app.address();
  console.log('Server started on http://' + addy.address + ':' + addy.port);
});
