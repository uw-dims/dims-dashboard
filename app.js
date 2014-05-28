
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , files = require('./routes/files')
  , clients = require('./routes/clients')
  , http = require('http')
  , path = require('path')
  , config = require('./config')
  , util = require('util');


var app = module.exports = express();

app.engine('html', require('ejs').renderFile);

// all environments
app.set('port', config.port);
app.set('views', __dirname + '/views');
app.set('view engine', 'html');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser({
  keepExtensions: true,
  uploadDir: (path.join(__dirname,'/tmp'))
}));
app.use(express.methodOverride());
app.use(express.static(path.join(__dirname, 'public')));
app.use(app.router);

// development only
if ('development' === app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/partials/:name', routes.partials);
app.get('/users', user.list);
app.post('/upload', files.upload);
app.get('/ipgrep', clients.ipgrep);
app.get('/cifbulk', clients.cifbulk);
app.get('/crosscor', clients.crosscor);
app.get('/anon', clients.anon);
app.get('*', routes.index);

// Handle cross-domain requests
// NOTE: Uncomment this funciton to enable cross-domain request.
/*
  app.options('/upload', function(req, res){
  console.log('OPTIONS');
  res.send(true, {
  'Access-Control-Allow-Origin': '*'
  }, 200);
  });
*/


http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

