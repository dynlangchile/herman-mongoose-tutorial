
/**
 * Module dependencies.
 */

var express   = require('express')
var producto  = require('./controllers/producto')

var app = module.exports = express.createServer();

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

// Routes
app.get('/', producto.index)

app.get('/producto/:id', producto.show_edit)

app.post('/producto/:id', producto.update)

app.get('/delete-producto/:id', producto.remove)

app.get('/nuevo-producto', producto.create)

app.post('/nuevo-producto', producto.create)


app.listen(3000, function(){
  console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});
