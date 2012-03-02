cornfield - We Grow Popcorn
===========================

Prerequisites
-------------
* node v0.6.11 or higher
* npm

Installation
------------
1. `git clone https://github.com/jbuck/cornfield.git`
2. `cd cornfield`
3. `npm install`
3. `node app.js`

Configuration
-------------
All of the default configuration options are located in config/default.json.
If you want to change any of them, it's recommended that you copy default.json,
tweak the config as you see fit, and then use your new config by setting the
NODE_ENV environment variable to the name of your config file without the
extension. For example, If you want to use the `production.json` config:

    NODE_ENV=production node app.js
