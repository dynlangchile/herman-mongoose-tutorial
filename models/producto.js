var Schema = require('mongoose').Schema

var producto_schema = new Schema({
  nombre        :   String,
  descripcion   :   String,
  precio        :   Number
})

module.exports = producto_schema