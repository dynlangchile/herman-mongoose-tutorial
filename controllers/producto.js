// Creación de la Conexión
var mongoose        = require('mongoose')
  , db_lnk          = 'mongodb://localhost/supermercado'
  , db              = mongoose.createConnection(db_lnk)

// Creación de variables para cargar el modelo
var producto_schema = require('../models/producto')
  , Producto = db.model('Producto', producto_schema)

exports.index = function (req, res, next) {

  Producto.find(gotProducts)

  // NOTA: Creo que es bueno usar verbos en inglés para las funciones,
  //       por lo cómodo que son en estos casos (get, got; find, found)
  function gotProducts (err, productos) {
    if (err) {
      console.log(err)
      return next()
    }

    return res.render('index', {title: 'Lista de Productos', productos: productos})
  }
}

exports.show_edit = function (req, res, next) {
  res.send('show_edit')
}

exports.update = function (req, res, next) {
  res.send('update')
}

exports.remove = function (req, res, next) {
  res.send('remove')
}

exports.create = function (req, res, next) {
  res.send('create')
}
