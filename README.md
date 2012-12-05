herman-mongoose-tutorial
==========================

Simple ejemplo de como usar la mezcla de express con mongoose (mongoDB librería) para interactuar de manera CRUD con un objeto.

# Disclaimer

Quiero hacer un _stress_ en la idea que esto es una *sugerencia* de como atacar el problema de interactuar de manera CRUD con un objeto usando las liberías de node.sj expressjs y mongoosejs; No un "Ud siempre debe hacerlo asi"

# Prerequisitos

Para que el ejemplo funcione debemos tener los puntos descritos abajo en nuestra maquina de desarrollo (idealmente en sus últimas versiones). Se dejan las respectivas instalaciones como ejercicio al lector.

* Node.js
* MongoDB
* ExpressJS
* Mongoose

# Preliminares - Diseño

Una manera rapida de partir es definiendo el vector solución en dos dimensiones: La definición del objeto (modelo) y las rutas web que queremos usar para "hablar" con él.

## Modelo del Objeto

En este ejemplo usaré productos de un supermercado, cada producto tendrá un nombre, descripción y precio, y sus tipos de datos serán respectivamente: nombre, descripción y precio. 

Creemos un archivo /models/producto.js (Hint: Todos nuestras representaciones de objectos de datos irán en este directorio)

Usemos el siguiente código:

````javascript
var Schema = require('mongoose').Schema

var producto_schema = new Schema({
  nombre        :   String,
  descripcion   :   String,
  precio        :   Number
})

module.exports = producto_schema
````
En sintesís, le estamos diciendo a nodejs que vamos a crear un objeto de mongoose de tipo `Schema` donde cada documento usa los campos `nombre`, `descripcion` y `producto`, junto a sus respectivos tipos. La última línea es vital para que podamos usar el código del archivo fuera de este (i.e.: Que este sea llamado por el programa app.js que lo va a ejecutar).

Como estamos testeando, démosle algunos documentos a mongoDB vía su consola, nuestra base de datos se llamará supermercado.

````bash
$ mongo
MongoDB shell version: 2.0.4
connecting to: test
> use supermercado
switched to db supermercado
> db.productos.update({},{ nombre: 'Papas Fritas', descripcion: 'Crujientes, sabor mediterraneo', precio: 2.5 }, true, false)
````
Aquí una pequeña explicación: La función update() en mongoDB es muy poderosa en el sentido que podemos hacer muchas cosas con ella. En este caso, le estamos diciendo: "Actualiza la colección productos, en todo su scope o todos sus elementos (primer parámetro `{}`), con el siguiente objeto ( { nombre...}, si no existe, creálo (true), y no lo hagas multiples veces (false)." Lo de las multiples veces, no tiene sentido acá, si tiene sentido cuando le digo "actualiza todas las papas fritas, incrementando su precio en +1".

Comprobemos si nuestro producto se guardó:

````bash
> db.productos.findOne()
{
  "_id" : ObjectId("4fe6454a8c136cf49721359f"),
  "nombre" : "Papas Fritas",
  "descripcion" : "Crujientes, sabor mediterraneo",
  "precio" : 2.5
}
````
Ese campo _id es nativo de mongoDB.

## Rutas Web de la Aplicación

Ahora que ya tenemos un objeto, y un documento que lo describe, es hora de diseñar rápidamente las rutas que queremos para operar en nuestra aplicación web. Empezemos por los conceptos: "Con mi aplicación web, yo a los productos quiero:"

* Listarlos
* Escoger uno y ve su descripción en detalle
* Editar un producto
* Eliminar un producto
* Crear uno nuevo

En verdad, podríamos hacer un diseño mayor, pero tenemos ideas claras de un modelo CRUD acá (Create, Read, Update, Delete), por lo que, y para hacer el tutorial breve, trabajaremos así.

Lo que sigue es gestar las rutas que harán estas actividades reales:

* Listarlos
    * `GET     /`
* Escoger uno y ver su descripción en detalle
    * `GET     /producto/:id`
* Editar un producto
    * `GET     /producto/:id`   (usaremos la misma ruta, pero guardaremos con...)
* Guardar un producto
    * `POST    /producto/:id`
* Eliminar un producto
    * `GET     /delete-producto/:id`
* Crear uno nuevo (Obtener UI)
    * `GET     /nuevo-producto`
* Enviar el objecto creado a la Base de Datos
    * `POST    /nuevo-producto`

Para los avanzados en Verbos HTTP, me podrían decir que la creación puede ser hecha con PUT, y el borrado con DELETE, en este tutorial, iremos muy básico, solo con GET y POST. Se invita desde luego toda pull request para hacer este tutorial más firme.

Con nuestras rutas claras, solo nos queda escribir el código, y es lo que haremos.

# Desarrollo de nuestra aplicación

### Ensayo inicial

El lector astuto dirá "Partamos por las rutas, ya que las definimos". La instalación de express tiene estas dos lineas en su archivo `app.js`:

````javascript
var routes = require('./routes');

//...

app.get('/', routes.index);
````

Aquí le decimos a la aplicación, al principio, "Usa como módulo el archivo /routes/index.js (implícito) y referenciemoslo con la variable `routes`", luego le decimos "Cuando el usuario haga un GET, carga la función `index` en el módulo `routes`".

En esta parte empieza mi sugerencia propiamente tal, ya que borraremos estas líneas y crearemos nuestras funciones en `controladores' de manera de abrazar el modelo MVC (Model, View y Controller).

Crearemos, primero el archivo `/controllers/producto.js`. Este tendrá todos los _handlers_ (manejadores) de las rutas diseñadas, Escribamos las siguientes líneas para entender como funciona este sistema:

* En /controllers/producto.js

````javascript
exports.index = function (req, res, next) {

  res.send('Funciona!')
}
````

* Y, en /app.js

````javascript
// Al principio
var producto  = require('./controllers/producto')

//... Y despues del comentario // Routes
app.get('/', producto.index)

````

Nosotros, le estamos diciendo a express "Carga el módulo producto que está en `/controllers/producto.js`" y "Cuando el usuario haga un GET a `/` utiliza la función `index` la que vive en `producto.js`".

Está función no hace más que devolver el texto 'Funciona!'. Detengamos la ejecución de app.js, reiniciemosla y hagamos la consulta:

![Pantallazo](http://cl.ly/image/233i1v1k3T2B1O16001o/Screen%20Shot%202012-06-23%20at%209.38.57%20PM.png)

### La aplicación propiamente tal

Lo primero que haremos es finiquitar nuestro trabajo en `app.js` escribiendo todas las rutas y sus handlers, y luego nos concentraremos en manejar las peticiones a las distintas rutas.

Escribamos entonces en `app.js` las siguientes rutas:

````javascript
// Routes
app.get('/', producto.index)

app.get('/producto/:id', producto.show_edit)

app.post('/producto/:id', producto.update)

app.get('/delete-producto/:id', producto.remove)

app.get('/nuevo-producto', producto.create)

app.post('/nuevo-producto', producto.create)
````

Debemos escribir los handlers en producto.js, responderemos, como placeholders, el nombre de la función. Más adelante, escribirimos codigo adecuado para cada una. Por ejemplo para `show_edit`:

````javascript
exports.show_edit = function (req, res, next) {
    res.send('show_edit')
}
````

### Desarrollando las rutas

#### Home (/)

Queremos mostrar una tabla con la lista de productos que tenemos en nuestra base de datos. Esto, en html es algo asi como:

````html
<html>
  <body>
    <h2>Tabla de Productos</h2>
    <table border="1">
      <tr>
        <th>Producto</th>
        <th>Descripcion</th>
        <th>Precio</th>
      </tr>
      <tr>
        <td><a href="/super8/">Super 8</a></td>
        <td>Barra de Chocolate</td>
        <td>3.50</td>
      </tr>
      <tr>
        <td><a href="/papas-fritas/">Papas Fritas</a></td>
        <td>Crujientes del Mediterraneo</td>
        <td>4.50</td>
      </tr>
      <tr>
        <td><a href="/coca-cola/">Coca Cola</a></td>
        <td>Agua Carbonatada con Azucar</td>
        <td>2.80</td>
      </tr>
    </table>
  </body>
</html>

````
Lo cual se renderea a

![esta imagen](http://cl.ly/image/3e1e0A021d3R171K0f3v/Screen%20Shot%202012-06-25%20at%2012.51.25%20PM.png):

Para lograr esto usaremos un template de `jade`, librería que viene incluída en expressJS. Si observamos, en la carpeta `views`tenemos todo lo que necesitamos: Un archivo `layout.jade`, el cual no tocaremos, y un archivo `index.js` el cual editaremos para llegar al `html` descrito arriba. Abramos el archivo `index.js` para incluir el siguiente código de template `jade`:

````jade
h2 Tabla de Productos
table(border='1')
  tr
    th Producto
    th Descripción
    th Precio
  tr
    td
      a(href="/super8") Super 8
    td Barra de Chocolate
    td 3.50
  tr
    td
      a(href='/papas-fritas') Papas Fritas
    td Crujientes del Mediterraneo
    td 4.50
  tr
    td
      a(href='/coca-cola') Coca Cola
    td Agua Carbonatada con Azucar
    td 2.80
````

Jade puede ser extraño al principio, pero es muy poderoso, ya que podemos insertar código de javascript, hacer loops y un montón de cosas que iremos viendo. Lo importante es que aumenta nuestra productividad. Ahora debemos decirle al controlador que cargue este template. Iremos al archivo `controllers/producto.js` modificando la función `exports.index` así:

````javascript
exports.index = function (req, res, next) {
  res.render('index', { title: 'Lista de Productos'})
}
````

Para probar nuestro cambios, no olvidemos de detener express (`CTRl+C`) e iniciar la aplicación de nuevo (`$ node app.js`). El resultado al llamar a `http://localhost:3000` debería ser: 

![Pantallazo](http://cl.ly/image/1M2M1W1N2n3X1n080i17/Screen%20Shot%202012-06-25%20at%201.09.26%20PM.png)

Sin embargo, estos datos son _dummy_. Liberemos el poder de la base de datos `MongoDB`, recordemos que introdujimos este documento:

````bash
> db.productos.findOne()
{
  "_id" : ObjectId("4fe6454a8c136cf49721359f"),
  "nombre" : "Papas Fritas",
  "descripcion" : "Crujientes, sabor mediterraneo",
  "precio" : 2.5
}
````

¿Cómo conectamos nuestra base de datos MongoDB usando node.js? Usando la librería [mongoose](http://mongoosejs.com/). 

El momento de la base de datos llegó, recordemos que al principio creamos el archivo `models/producto.js`:

* models/producto.js

````javascript
var Schema = require('mongoose').Schema

var producto_schema = new Schema({
  nombre        :   String,
  descripcion   :   String,
  precio        :   Number
})

var Producto = module.exports = producto_schema
````

... Y, Modifiquemos nuestros archivos de la siguiente manera:

* package.json

````javascript
{
    "name": "herman-mongoose-suggestion"
  , "version": "1.0.0"
  , "dependencies": {
      "express"     : "2.5.8"
    , "jade"        : "0.25.x"
    , "mongoose"    : "2.5.10"
  }
}
````

Una vez modificado `package.json`, no olvidemos de actualizar nuestro modulos de node via `npm install -f` en el directorio de nuestra aplicación.

* controllers/producto.js

````javascript

// Creación de la Conexión
var mongoose        = require('mongoose')
  , db_lnk          = 'mongodb://localhost/supermercado'
  , db              = mongoose.createConnection(db_lnk)

// Creación de variables para cargar el modelo
var producto_schema = require('../models/producto')
  , Producto = db.model('Producto', producto_schema)

````
Ahora, existe, por supuesto la posibilidad de montar de una manera general la conexión para toda la aplicación. No la tocaremos sin embargo en este tutorial.

Modificamos la función `exports.index`, siempre dentro de `controllers/producto.js`para que recoja los productos:

* controllers/producto.js

````javascript
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
````

Nótese la estructura de callbacks: Cuando se pide la lista de productos, sólo al llegar la respuesta invocamos a `gotProducts`, el cual llama a la renderización a través de `res.render` de la página. Para los que vienen de otros lenguajes esta manera de modelar puede ser confusa al principio. Pero tiene sus ventajas en el escenario web, el cual, a mi parecer es completamente orientado al evento.

Tenemos listo el back-end! Ya tenemos una lista de productos, ejecutamos? Aún no, ya que `res.render` cargaría el _template_ _jade_, pero no le está insertando los datos. Por lo que modificaremos `views/index.jade` para tal efecto:

* views/index.jade

````jade
h2 Tabla de Productos
table(border='1')
  tr
    th Producto
    th Descripción
    th Precio
  - if (productos)
    - each producto in productos
      tr
        td
          a(href="/producto/" + producto._id.toString()) #{producto.nombre}
        td #{producto.descripcion}
        td #{producto.precio}
````

Bien. `CTRL+C`, `$ node app.js`y veamos el resultado:

![Pantallazo](http://cl.ly/image/2F2O0Z0w1z2F2i2p0Z3O/Screen%20Shot%202012-07-01%20at%209.07.17%20PM.png)

#### Página de Edición de un Producto (GET /producto/:id)

Si clickamos en el link del primer producto obtenidos, tendremos un mensaje que no podemos ver el producto. Tomaremos las medidas para ello.

En general, se pueden dar buenos argumentos para no usar la misma id de producto de la base de datos como indicador `id` para la ruta. Pero recordemos que estamos en un ejemplo didáctico. Necesitaremos desarrollar (Y aquí veremos lo atractivo que es el paradigma MVC), una función de controlador y una vista, no necesitaremos en este ejemplo hacer funciones de modelos, dado que mongoose nos entrega todo. En la medida que veamos más complejidad, es necesario encapsular las funciones de mongoose y las lógicas que necesitemos en funciones de modelo.

* controllers/producto.js

````javascript
exports.show_edit = function (req, res, next) {

  // Obtención del parámetro id desde la url
  var id = req.params.id

  Producto.findById(id, gotProduct)

  function gotProduct (err, producto) {
    if (err) {
      console.log(err)
      return next(err)
    }

    return res.render('show_edit', {title: 'Ver Producto', producto: producto})
  }
}
````

Mongoose nos ahorra muchos problemas de desarrollo, tiene la función `findById`, ([Ver documento](http://mongoosejs.com/docs/2.7.x/docs/finding-documents.html)), la que, dado un `id` en string, devuelve el objecto correspondiente (o null, si no existe)

Necesitamos renderizar el objecto. Acá usaremos la misma plantilla para edición y mostrar el producto:

* /views/show_edit.jade

````jade
h2 #{title}
form(method='post')

  p
    label(for="nombre") Nombre:
      input(type='text', name='nombre', value=producto.nombre)

  p
    label(for="descripcion") Descripción:
      input(type='text', name='descripcion', size=100, value=producto.descripcion)

  p
    label(for="precio") Precio:
      input(type='text', name='precio', value=producto.precio)

  p
    input(type='submit', value='Guardar')
````

Obtenemos la siguiente pantalla:

![Pantallazo](http://cl.ly/image/1M3o3r0i3o1a/Screen%20Shot%202012-12-05%20at%206.22.03%20AM.png)

Sin embargo si presionamos el botón guardar cambios, nada ocurre. Es lo que habilitaremos en el siguiente apartado...

#### Enviar los cambios de un producto (POST producto/:id)

Este es un trabajo completo sólo en el controlador (ya que tenemos la vista y modelo en mongoose):

* /controllers/producto.js

````javascript
exports.update = function (req, res, next) {
  var id = req.params.id

  var nombre      = req.body.nombre       || ''
  var descripcion = req.body.descripcion  || ''
  var precio      = req.body.precio       || ''

  // Validemos que nombre o descripcion no vengan vacíos
  if ((nombre=== '') || (descripcion === '')) {
    console.log('ERROR: Campos vacios')
    return res.send('Hay campos vacíos, revisar')
  }

  // Validemos que el precio sea número
  if (isNaN(precio)) {
    console.log('ERROR: Precio no es número')
    return res.send('Precio no es un número !!!!!')
  }

  Producto.findById(id, gotProduct)

  function gotProduct (err, producto) {
    if (err) {
      console.log(err)
      return next(err)
    }

    if (!producto) {
      console.log('ERROR: ID no existe')
      return res.send('ID Inválida!')
    } else {
      producto.nombre       = nombre
      producto.descripcion  = descripcion
      producto.precio       = precio

      producto.save(onSaved)
    }
  }

  function onSaved (err) {
    if (err) {
      console.log(err)
      return next(err)
    }

    return res.redirect('/producto/' + id)
  }
}
````

Controlamos los errores de no ID y parámetros en blanco. A `next()` le estamos dando un parámetros. En iteraciones posteriores debemos configurar que si `next` recibe parámetros, entregarle un error 500 al usuario. Pasaremos de esta funcionalidad por ahora.

#### Borrar un Producto (POST /delete-producto/:id)

Cómo se mencionó arriba, se podría haber usado el verbo DELETE (haciendo [override de método](http://www.endurasoft.com/Blog/post/X-HTTP-Method-Override.aspx)). Para hacer más simple el tutorial, se implementa en `GET`.

Debemos agregar los links para el eliminado en la lista de productos, es decir en el template de jade:

* views/index.jade

````jade
h2 Tabla de Productos
table(border='1')
  tr
    th Producto
    th Descripción
    th Precio
    th &nbsp;
  - if (productos)
    - each producto in productos
      tr
        td
          a(href="/producto/" + producto._id.toString()) #{producto.nombre}
        td #{producto.descripcion}
        td #{producto.precio}
        td
          a(href="/delete-producto/" + producto._id.toString()) Borrar
````

![Pantallazo](http://cl.ly/image/433v3Y1Z1T0b/Screen%20Shot%202012-12-05%20at%207.18.01%20AM.png)

Y la funcionalidad correspondiente en el controlador:

* /controllers/producto.js

````javascript
exports.remove = function (req, res, next) {
  var id = req.params.id

  Producto.findById(id, gotProduct)

  function gotProduct (err, producto) {
    if (err) {
      console.log(err)
      return next(err)
    }

    if (!producto) {
      return res.send('Invalid ID. (De algún otro lado la sacaste tú...)')
    }

    // Tenemos el producto, eliminemoslo
    producto.remove(onRemoved)
  }

  function onRemoved (err) {
    if (err) {
      console.log(err)
      return next(err)
    }

    return res.redirect('/')
  }
}
````

Nótese (con algo de humor por supuesto), como reaccionamos ante una id que no encontramos. Si bien asumimos que esta función es llamada dentro de la página de índice, es posible que los valores quieran ser ingresados directamente (ala REST). El desarrollador debe preveer esta conducta y crear los flujos adecuados.

Cosas que podemos agregar: Hacer una función js de cliente para que despliegue un confirmador (está seguro?) y enviar vía AJAX la llamada a borrar el producto; Podemos cerciorarnos además que quien de la orden esté dentro de una sesión; Podemos agregar un token contra "Cross Site Request Forgery", entre otros.

#### Agregar un Producto (GET /nuevo-producto)

Finalmente, la funcionalidad de agregar productos.

La primera idea es que la función asociada a la ruta, `exports.create`, nos arroje un html con los campos en blanco:

* /controllers/producto.js

````javascript
exports.create = function (req, res, next) {
  return res.render('show_edit', {title: 'Ver Producto', producto: {}})
}
````

Eso fue sencillo. Quisieramos agregar un link a esta misma página en la página de inicio:

![Pantallazo]()

* /views/index.jade

````jade
p
  a(href='/nuevo-producto') Nuevo Producto
````

![Pantallazo](http://cl.ly/image/2u3i0b0y0R34/Screen%20Shot%202012-12-05%20at%207.21.33%20AM.png)

Y la función de controlador `exports.create` debe ser modificada, crearemos un desvío según el metodo HTTP que ocupemos (GET o POST)

````javascript
exports.create = function (req, res, next) {
  if (req.method === 'GET') {
    return res.render('show_edit', {title: 'Nuevo Producto', producto: {}})
  } else if (req.method === 'POST') {
    // Obtenemos las variables y las validamos
    var nombre      = req.body.nombre       || ''
    var descripcion = req.body.descripcion  || ''
    var precio      = req.body.precio       || ''

    // Validemos que nombre o descripcion no vengan vacíos
    if ((nombre=== '') || (descripcion === '')) {
      console.log('ERROR: Campos vacios')
      return res.send('Hay campos vacíos, revisar')
    }

    // Validemos que el precio sea número
    if (isNaN(precio)) {
      console.log('ERROR: Precio no es número')
      return res.send('Precio no es un número !!!!!')
    }

    // Creamos el documento y lo guardamos
    var producto = new Producto({
        nombre        : nombre
      , descripcion   : descripcion
      , precio        : precio
    })

    producto.save(onSaved)

    function onSaved (err) {
      if (err) {
        console.log(err)
        return next(err)
      }

      return res.redirect('/')
    }
  }  
}
````

Podemos hacer algunas pruebas:

![Pantallazo](http://cl.ly/image/0J1B0e0H0I0t/Screen%20Shot%202012-12-05%20at%207.57.02%20AM.png)
![Pantallazo](http://cl.ly/image/1p231T2c3J0k/Screen%20Shot%202012-12-05%20at%208.11.18%20AM.png)

Y eso sería todo por este tutorial. Insisto, se pueden hacer muchas cosas más, pero el objetivo es introducir al lector en estas tecnologías. Personalmente hubiese hecho algún trabajo para manejar los errores y devolver un error 500, desarrollo de usuarios y sesiones, más javascript de cliente y otros. Para el futuro. Muchas gracias.
