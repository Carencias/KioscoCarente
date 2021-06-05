"use strict";

const USUARIO_INCORRECTO = -1;
const USUARIO_ESTANDAR = 0;
const ADMIN = 1;

const express = require("express");
const app = express();
const port = 8000;
const mysql = require("mysql");
const session = require("express-session");
const {
  response
} = require("express");
app.use(express.urlencoded());
const fs = require('fs');
const ejs = require('ejs');
app.set('view engine', 'ejs');
var path = require('path');
const {
  send
} = require("process");


app.use(express.json());
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "POST");
  next();
});

app.listen(port, () => {
  console.log(`Running ${port}`);
});

const connection = mysql.createConnection({
  host: "sistemas.casasoladerueda.es",
  port: 30000,
  user: "kiosko_carente",
  password: "carencias",
  database: "kiosko",
});

//AUTENTICACION
app.use(
  session({
    secret: "carencias", //Firma secreta
    resave: false, //No se para que sirve
    saveUninitialized: false, //La sesion no se almacena si está vacia
    cookie: {
      //secure: true --> Requiere HTTPS
    },
    expires: new Date(Date.now() + 30 * 60 * 1000), //miliseconds??
  })
);

//Autenticacion comun
var auth = function (req, res, next) {
  if (req.session && req.session.userType !== undefined) return next();
  else return res.sendStatus(401);
};

var userAuth = function (req, res, next) {
  if (req.session && req.session.userType === USUARIO_ESTANDAR) {
    console.log(req.session);
    console.log(req.session.userType);
    return next();
  } else {
    return res.sendStatus(401);
  }
};

var adminAuth = function (req, res, next) {
  if (req.session && req.session.userType === ADMIN) return next();
  else return res.sendStatus(401);
};

//TODO
//Permite acceder a los recursos de una carpeta. El primer parametro es la ruta virtual sobre la que se monta, el segundo el real.
app.use("/", express.static(__dirname + "/webpage"));
//app.use("/dashboard/admin", adminAuth);
//app.use("/dashboard/user", userAuth);
app.use("/dashboard/user", express.static(__dirname + "/dashboard/user"));
app.use("/dashboard/admin", express.static(__dirname + "/dashboard/admin"));

app.get("/dashboard/admin", function (req, res) {

  let string = "SELECT * FROM COLECCIONES ";
  connection.query(string, function (err, result, fields) {
    if (err) throw err;

    res.render('admin/administradorPrincipal', {
      colecciones: result,
      nombre: req.session.user
    });

  });

});

function comprobarCredenciales(req, res) {
  let username = req.body.username;
  let password = req.body.password;

  obtenerUsuarios(username).then(
    function(usuarios){

      let usuario = usuarios[0];

      if (usuario.length === 0 || usuario.Password !== password) {
        res.send("Autenticación incorrecta");
      } else {
        console.log("Login Username: ", usuario.User);
        console.log("Login Password: ", usuario.Password);

        let tipoUsuario = usuario.Tipo;
        //Guardo en la sesión los datos obtenidos de la bbdd
        req.session.user = usuario.User;
        req.session.password = usuario.Password;
        req.session.userType = usuario.Admin;

        console.log(tipoUsuario);
        abrirSesionIniciada(req, res);
      }
    },
    function(error){
      console.log(error);
      //throw error;
  });
  /*connection.query(
    "SELECT User, Password, Admin FROM USUARIOS WHERE User='" + username + "'",
    function (err, result) {
      if (err) throw err;
      //No se encontro el usuario o bien la contraseña no es válida
      if (result.length === 0 || result[0].Password !== password) {
        res.send("Autenticación incorrecta");
      } else {
        console.log("Login Username: ", result[0].User);
        console.log("Login Password: ", result[0].Password);

        let tipoUsuario = result[0].Tipo;

        //Guardo en la sesión los datos obtenidos de la bbdd
        req.session.user = result[0].User;
        req.session.password = result[0].Password;
        req.session.userType = result[0].Admin;

        console.log(tipoUsuario);

        abrirSesionIniciada(req, res);
      }
    }
  );*/
}

app.post("/login", function (req, res) {
  //Comprobar si ya está logueado
  console.log(req.session);
  if (checkSesionIniciada(req)) {
    res.redirect("/dashboard");
  } else {
    if (!req.body.username || !req.body.password) {
      //TODO Con javascript del lado del cliente se avisa si no introduce usuario o contraseña
      res.send(
        "Usuario o contraseña no introducido" +
        req.body.username +
        req.body.password
      );
    } else {
      comprobarCredenciales(req, res);
    }
  }
});

//Dashboard es la URL sobre la que se mostrará el area privada del usuario normal
app.get("/dashboard", function (req, res) {
  if (checkSesionIniciada(req)) {
    abrirSesionIniciada(req, res);
  } else {
    res.redirect("/login");
  }
});

app.get("/login", function (req, res) {
  //Comprobar si ya está logueado
  console.log(req.session);
  if (checkSesionIniciada(req)) {
    //res.redirect("webpage/dashboard");
    abrirSesionIniciada(req, res);
  } else {
    res.sendFile(__dirname + "/login/login.html");
  }
});

app.get("/registro", function (req, res) {
    res.sendFile(__dirname + "/registro/registro.html");

});

function checkSesionIniciada(req) {
  if (req.session && req.session.user && req.session.password) {
    return true;
  }
  return false;
}

function abrirSesionIniciada(req, res) {
  //Se abre la sesión del dashboard según el tipo de usuario
  if (checkSesionIniciada(req)) {
    if (req.session.userType === USUARIO_ESTANDAR) {
      //res.send("Bienvenido al dashboard de USUARIO_ESTANDAR");

      //res.sendFile(__dirname + "/webpage/dashboard/user/index.html");
      res.redirect("/dashboard/user");
    } else if (req.session.userType === ADMIN) {
      //res.send("Bienvenido al dashboard de ADMIN");

      //res.sendFile(__dirname + "/webpage/admin/index.html");
      res.redirect("/dashboard/admin/");
    }
  }
}
app.get("/dashboard/logout", auth, function (req, res) {
  req.session.destroy();
  res.redirect("/index.html");
  //res.send("Sesión Finalizada correctamente");
});

//Para requerir la autenticacion al acceder a las paginas hay que agregar auth como aqui
app.get("/content", auth, function (req, res) {
  res.send("Solo podras ver esto una vez te hayas logueado");
});

app.post("/registro", function (req, res) {
  let nombre = req.body.nombre;
  let username = req.body.username;
  let password = req.body.password;
  let apellidos = req.body.apellidos;
  let email = req.body.email;
  
  agregarUsuario(username, password, nombre, apellidos, email, '0').then(
    () => {res.send("Se ha creado el usuario exitosamente")},
    (error) => {response.send(error)}
  );
  /*connection.connect();
  let string = "INSERT INTO USUARIOS (User, Password, Nombre, Apellidos, Email, Admin) VALUES ('"+
  username +"','"+
  password + "','" +
  nombre + "','" +
  apellidos + "','" +
  email + "','0')";
  connection.query(string, function (err, result, fields) {
    if (err) {
      response.send(err);
    }
  });

  res.send("Se ha creado el usuario exitosamente");*/
});

app.post("/dashboard/admin/crearColeccion", function (req, res) {
  //TODO comprobar entrada??
  let nombre = req.body.titulo_coleccion;
  let precioAlbum = req.body.precio_coleccion;
  let foto = req.body.imagen_album;
  let descripcion = req.body.descripcion_coleccion

  agregarColeccion(nombre, precioAlbum, foto,descripcion).then(
    () => {res.redirect("/dashboard/admin/");},
    (error) => {res.send(error.message)}
  );

  /*let string = "INSERT INTO COLECCIONES (Nombre,PrecioAlbum,FotoAlbum) VALUES ('" +
    nombre + "'," +
    precioAlbum + ",'" +
    foto + "')";
  connection.query(string, function (err, result, fields) {
    if (err) {
      res.send(err.message);
    }else{
      res.send("Añadido correctamente")
    }
  });*/  
});

app.post("dashboard/admin/editarColeccion", function (req, res) {
  //TODO comprobar entrada??
  let nombre = req.body.nombre;
  let precioAlbum = req.body.precio;
  let foto = req.body.foto;
  let estado = req.body.estado;
  let coleccion = req.body.coleccion;

  editarColeccion(precioAlbum, foto, nombre, estado, coleccion).then(
    () => {res.send("Coleccion Actualizada")},
    (error) => {res.send(error.message)}
  );
  /*let string =
    "UPDATE COLECCIONES SET PrecioAlbum =" + precioAlbum +
    ",FotoAlbum= '" + foto +
    "',Nombre= '" + nombre +
    "', Estado = '" + estado +
    "' WHERE  Nombre= '" + coleccion +"'";

  console.log(string);
  connection.query(string, function (err, result, fields) {
    if (err) {
      throw err;
    }
  });*/
});

app.set('views', path.join(__dirname, '/dashboard/views'));
//app.use("/dashboard/resources/colecciones/java/imagenes/", express.static(__dirname + "/dashboard/resources/colecciones/java/imagenes/"));
//app.use("/dashboard/resources/*", express.static(__dirname + "/dashboard/resources/media"));

//Acceso a subdirectorios público
app.get("/assets/*", function (req, res) {
  let url = req.originalUrl;
  //console.log(url.toString());
  
  if(fs.existsSync(__dirname +url.toString())){
    res.sendFile(__dirname +url.toString());
  } else {
    res.sendStatus(404);
  }
  
});

app.get("/dashboard/resources/*", function (req, res) {
  let url = req.originalUrl;
  //console.log(url.toString());
  
  if(fs.existsSync(__dirname +url.toString())){
    res.sendFile(__dirname +url.toString());
  } else {
    res.sendStatus(404);
  }
  
});

app.get("/dashboard/admin/editarColeccion", function (req, res) {
  //TODO comprobar entrada??
  
  let coleccion = req.query.nombreColeccion;

  let string = "SELECT * FROM CROMOS WHERE Coleccion = '" + coleccion + "'";
  connection.query(string, function (err, result, fields) {
    if (err) {
      throw err;
    }
    console.log(result)
    res.render('admin/administradorEditarColeccion', {
      cromos: result
    });

  });

});

app.get("/dashboard/admin/editarCromo", function (req, res) {
  //TODO comprobar entrada??
  
  let id = req.query.IDCromo;

  let string = "SELECT * FROM CROMOS WHERE ID ='"+id+"'" ;
  connection.query(string, function (err, result, fields) {
    if (err) {
      throw err;
    }
    console.log(result)
    res.render('admin/administradorEditarCromo', {
      cromo: result[0]
    });

  });

});

//PAGINA PRINCIPAL USUARIO
app.get("/dashboard/user", function (req, res) {
  let string = "SELECT * FROM ALBUMES WHERE User = '" + req.session.user + "'";
  var colecciones = [];
  let estadosAlbumes = [];
  connection.query(string, function (err, result, fields) {
    if (err) {
      throw err;
    }
    result.forEach(function(album){
        estadosAlbumes.push(album.Estado);
        obtenerColecciones(album.Coleccion).then(function(coleccionesBBDD){
        colecciones.push(coleccionesBBDD[0]);
        
        let stringUser = "SELECT * FROM CLIENTES WHERE User = '" + req.session.user + "'";
        connection.query(stringUser, function (err, resultUser, fields) {
        if (err) {
          throw err;
        }
        res.render('user/clientePrincipal', {
          colecciones: colecciones,
          estados: estadosAlbumes,
          nombre: req.session.user,
          puntos: resultUser[0].Puntos
        });
        });
        
        }, (error) => {res.send(error.message)});
    });
  });
});

//TIENDA USUARIO ALBUMES
app.get("/dashboard/user/tiendaAlbumes", function (req, res) {

  let stringCompradas = "SELECT * FROM COLECCIONES AS c INNER JOIN ALBUMES AS a ON c.Nombre = a.Coleccion WHERE c.Estado = 'Activa' and a.User = '" + req.session.user + "'";
  connection.query(stringCompradas, function (err, coleccionesDisponiblesCompradas, fields) {
    if (err) {
      throw err;
    }
      let stringNoCompradas = "SELECT * FROM COLECCIONES WHERE Estado = 'Activa' AND Nombre not IN( SELECT Nombre FROM COLECCIONES AS c INNER JOIN ALBUMES AS a ON c.Nombre = a.Coleccion WHERE c.Estado = 'Activa' and a.User = '" + req.session.user  +"' )";
      connection.query(stringNoCompradas, function (err, coleccionesDisponiblesNoCompradas, fields) {
            if (err) {
              throw err;
            }
            let stringUser = "SELECT * FROM CLIENTES WHERE User = '" + req.session.user + "'";
            connection.query(stringUser, function (err, resultUser, fields) {
                if (err) {
                  throw err;
                }
                res.render('user/clienteTiendaAlbumes', {
                  colecciones: coleccionesDisponiblesNoCompradas.concat(coleccionesDisponiblesCompradas),
                  numeroNoCompradas: coleccionesDisponiblesNoCompradas.length,
                  puntos: resultUser[0].Puntos
                });
            });
      });
  });
});

//TIENDA CROMOS
app.get("/dashboard/user/tiendaCromos", function (req, res) {
  //TODO comprobar entrada??
  
  let coleccion = req.query.nombreColeccion;
  let idUser = "user";

  let string = "SELECT * FROM CROMOS AS c WHERE c.ID not IN(SELECT CromoID FROM CROMOS_ALBUMES WHERE AlbumUser = '" + idUser + "' AND AlbumColeccion = '" + coleccion + "') AND c.Coleccion = '"+coleccion+"'";
  connection.query(string, function (err, cromosNoComprados, fields) {
    if (err) throw err;

    let string = "SELECT * FROM CROMOS WHERE ID = (SELECT CromoID FROM CROMOS_ALBUMES WHERE AlbumUser = '" + idUser + "' AND AlbumColeccion = '" + coleccion + "' )";
    connection.query(string, function (err, cromosComprados, fields) {
      if (err) throw err;
  
      let stringUser = "SELECT * FROM CLIENTES WHERE User = '" + req.session.user + "'";
      connection.query(stringUser, function (err, resultUser, fields) {
      if (err) {throw err;}

      res.render('user/clienteTiendaCromos', {
      cromos: cromosNoComprados.concat(cromosComprados),
      numeroNoComprados: cromosNoComprados.length,
      nombreColeccion: coleccion,
      puntos: resultUser[0].Puntos
      });
    });
    });
  });

});

//CROMOS USUARIO
app.get("/dashboard/user/clienteCromos", function (req, res) {
  //TODO comprobar entrada??
  
  let coleccion = req.query.nombreColeccion;

  let stringUser = "SELECT * FROM CLIENTES WHERE User = '" + req.session.user + "'";
    connection.query(stringUser, function (err, resultUser, fields) {
    if (err) throw err;

    let string = "SELECT * FROM CROMOS WHERE ID = (SELECT CromoID FROM CROMOS_ALBUMES WHERE AlbumUser = '" + req.session.user + "' AND AlbumColeccion = '" + coleccion + "' )";
    connection.query(string, function (err, cromosComprados, fields) {
      if (err) throw err;
        console.log(cromosComprados);
      res.render('user/clienteCromos', {
        cromos: cromosComprados,
        nombreColeccion: coleccion,
        puntos: resultUser[0].Puntos
      });
  
    });

  });

});

//CODIGO DE DIEGO
/*
app.get("/dashboard/user/mostrarAlbum", function (req, res) {
  //TODO comprobar entrada??
  
  let coleccion = req.query.nombreColeccion;
  let idUser = "user";

  let string = "SELECT * FROM CROMOS WHERE Coleccion = '" + coleccion + "'";
  connection.query(string, function (err, todosCromos, fields) {
    if (err) throw err;

    let string = "SELECT * FROM CROMOS WHERE ID = (SELECT CromoID FROM CROMOS_ALBUMES WHERE AlbumUser = " + idUser + " AND AlbumColeccion = " + coleccion + " )";
    connection.query(string, function (err, cromosComprados, fields) {
      if (err) throw err;
  
      res.render('user/usuarioMostrarAlbum', {
        todosCromos: todosCromos,
        cromosComprados: cromosComprados
      });
  
    });

  });

});*/


app.post("/dashboard/admin/crearCromo", function (req, res) {
  //TODO comprobar entrada??
  let nombre = req.body.nombre;
  let coleccion = req.body.coleccion;
  let rutaImagen = req.body.rutaImagen;
  let precio = req.body.precio;
  let cantidad = req.body.cantidad;
  let descripcion = req.body.descripcion;
  let datoInteresante = req.body.datoInteresante;
  let frecuencia = req.body.frecuencia;

  agregarCromo(nombre, coleccion, rutaImagen, precio, cantidad, descripcion, datoInteresante, frecuencia).then(
    () => {res.send("Cromo creado correctamente")},
    (error) => {res.send(error.message)}
  );
  /*let string =
    "INSERT INTO CROMOS (Nombre, Coleccion, RutaImagen, Precio, Cantidad, Descripcion, DatoInteresante, Frecuencia) VALUES ('" +
    nombre +"','" +
    coleccion +"','" +
    rutaImagen +"'," +
    precio +"," +
    cantidad +",'" +
    descripcion +"','" +
    datoInteresante +"','" +
    frecuencia +"')";
  connection.query(string, function (err, result, fields) {
    if (err) {
      throw err;
    }
  });*/
});

app.post("/borrarCromo", function (req, res) {
  let id = req.body.id;

  borrarCromo(id).then(
    () => {res.send("El cromo ha sido borrado")},
    (error) => {res.send(error.message)}
  );
  /*let string =
    "DELETE FROM CROMOS WHERE ID =" + id ;
  try {
    connection.query(string, function (err, result, fields) {
      if (err) {
        throw err;
      }
    });
  } catch (error) {
    console.log(error);
  }
    res.send("El cromo ha sido borrado");*/
});

app.post("/borrarColeccion", function (req, res) {
  let nombre = req.body.nombre;
  
  borrarColeccion(nombre).then(
    () => {res.send("La coleccion ha sido borrada")},
    (error) => {res.send(error)}
  );
  /*let string =
    "DELETE FROM COLECCIONES WHERE Nombre = '" + nombre +"'";
  try {
    connection.query(string, function (err, result, fields) {
      if (err) {
        throw err;
      }
    });
  } catch (error) {
    console.log(error);
  }
  res.send("La coleccion ha sido borrada");*/
});

app.post("/dashboard/user/comprarCromo", function (req, res) {
  //TODO comprobar entrada??
  let idCromo = req.body.idCromo;
  let coleccionAlbum = req.body.coleccionAlbum;
  //let usuarioAlbum = req.body.usuarioAlbum;
  //let idUser = req.session.user
  let idUser = "user";

  var cromo, cliente;

  obtenerCromos(idCromo).then(function(cromos){
    //TODO si no se permite enviar el ID del cromo a mano sobra
    if(!cromos.length){
      res.send("No existe ese cromo");
    }else{

      cromo = cromos[0];

      var precio = cromo.Precio;
      var cantidad = cromo.Cantidad;
      if (cantidad > 0){
        obtenerClientes(idUser, precio).then(function(clientes){  
          cliente = clientes[0];
          if (cliente.Puntos > cromo.Precio){
            consultarCromoAlbum(idCromo, idUser, coleccionAlbum).then(function(){
              agregarCromoAAlbumAtomico(idCromo, coleccionAlbum, idUser, cromo.Precio, cromo.Cantidad, cliente.Puntos).then(function(){
                  res.send("Cromo comprado correctamente");
                }, function (error){res.send(error.message)});
            }, function(error){res.send(error.message)});
          } else{res.send("Puntos insuficientes para comprar el cromo")};
          }, function(error){res.send(error.message)});
      } else{res.send("No hay existencias de ese cromo")}

    }

  }, function(error){res.send(error.message)});
});

function consultarCromoAlbum(idCromo, idUser, coleccionAlbum){
  return new Promise(function(resolve, reject){
    connection.query("SELECT * FROM CROMOS_ALBUMES WHERE CromoID = ? AND AlbumUser = ? AND AlbumColeccion = ?", [idCromo, idUser, coleccionAlbum], function (err, result) {
      if(err) reject (Error("No se ha podido consultar si está o no el cromo en el álbum"));
      else if(result){
        if (result.length !== 0) reject( Error("Cromo ya comprado"));
        else resolve("El cromo no está comprado");
      }
    });
  });
}

function agregarCromoAAlbumAtomico(idCromo, coleccionAlbum, idUser, precio, cantidad, puntos){
  return new Promise(function(resolve, reject){
    actualizarPuntosCliente(puntos-precio, idUser)
    .then(function(){
      actualizarCantidadCromo(cantidad-1, idCromo)
        .then(function(){
          agregarCromoAAlbum(idCromo, idUser, coleccionAlbum)
            .then(function (){resolve()},
            function(error){
              actualizarCantidadCromo(cantidad+1, idCromo);
              actualizarPuntosCliente(puntos+precio, idUser);
            });
        }, function(error){actualizarPuntosCliente(puntos+precio, idUser);});
    }, function(error){reject(error);});
  });
}

function borrarColeccion(nombre){
  return ejecutarQueryBBDD("DELETE FROM COLECCIONES WHERE Nombre = ?", [nombre], "Borrar coleccion", false);
}

function borrarCromo(id){
  return ejecutarQueryBBDD("DELETE FROM CROMOS WHERE ID = ?", [id], "Borrar cromo", false);
}

function agregarCromo(nombre, coleccion, rutaImagen, precio, cantidad, descripcion, datoInteresante, frecuencia){
  return ejecutarQueryBBDD("INSERT INTO CROMOS (Nombre, Coleccion, RutaImagen, Precio, Cantidad, Descripcion, DatoInteresante, Frecuencia) VALUES (?,?,?,?,?,?,?,?)",
  [nombre, coleccion, rutaImagen, precio, cantidad, descripcion, datoInteresante, frecuencia], "Agregar cromo", false);
}

function editarColeccion(precioAlbum, foto, nombre, estado, coleccion){
  return ejecutarQueryBBDD("UPDATE COLECCIONES SET (PrecioAlbum,FotoAlbum,Nombre,Estado) VALUES (?,?,?,?) WHERE Nombre = ?", [precioAlbum,foto,nombre,estado,coleccion], "Editar coleccion", false);
}

function agregarColeccion(nombre, precioAlbum, foto,descripcion){
  return ejecutarQueryBBDD("INSERT INTO COLECCIONES (Nombre,PrecioAlbum,FotoAlbum,Descripcion) VALUES (?,?,?,?)", [nombre, precioAlbum, foto,descripcion], "Agregar coleccion", false);
}

function agregarUsuario(username, password, nombre, apellidos, email, admin){
  return ejecutarQueryBBDD("INSERT INTO USUARIOS (User, Password, Nombre, Apellidos, Email, Admin) VALUES (?, ?, ?, ?, ?, ?)", [username,password,nombre,apellidos,email,admin], "Agregar usuario",false);
}

function obtenerUsuarios(username){
  return ejecutarQueryBBDD("SELECT User, Password, Admin FROM USUARIOS WHERE User = ?", [username], "Obtener usuario", true);
}

function agregarCromoAAlbum(idCromo, idUser, coleccionAlbum){
  return ejecutarQueryBBDD("INSERT INTO CROMOS_ALBUMES (CromoID, AlbumUser, AlbumColeccion) VALUES (?, ?, ?)", [idCromo,idUser,coleccionAlbum], "Agregar cromo a album", false);
}

function actualizarCantidadCromo(nuevaCantidad, idCromo){
  return ejecutarQueryBBDD("UPDATE CROMOS SET Cantidad = ? WHERE ID = ?", [nuevaCantidad, idCromo], "Actualizar cantidad cromo", false);
}

function actualizarPuntosCliente(nuevosPuntos, idUser){
  return ejecutarQueryBBDD("UPDATE CLIENTES SET Puntos = ? WHERE User = ?", [nuevosPuntos, idUser], "Actualizar puntos cliente", false);
}

function agregarAlbumCliente(idUser, nombreColeccion){
  return ejecutarQueryBBDD("INSERT INTO ALBUMES (User, Coleccion) VALUES (?, ?)", [idUser, nombreColeccion], "Agregar album al cliente", false);
}

function obtenerColecciones(nombreColeccion){
  return ejecutarQueryBBDD("SELECT * FROM COLECCIONES WHERE Nombre = ?", [nombreColeccion], "Obtener coleccion", true);
}

function obtenerClientes(idUser, precio){
  return ejecutarQueryBBDD("SELECT * FROM CLIENTES WHERE User = ?", [idUser], "Obtener cliente", true);
}

function obtenerCromos(idCromo){
  return ejecutarQueryBBDD("SELECT * FROM CROMOS WHERE ID = ?", [idCromo], "Obtener cromo", true);
}

function obtenerAlbumes(coleccion, usuario){
  return ejecutarQueryBBDD("SELECT * FROM ALBUMES WHERE User = ? AND Coleccion = ?", [usuario, coleccion], "Obtener album", true);
}

function ejecutarQueryBBDD(query, arrayDatos, operacion, devolverResultado){
  return new Promise(function(resolve, reject){
    connection.query(query, arrayDatos, function (err, result) {
      if(err){
        reject (Error("Operacion " + operacion + " no completada"));
      } else {

        if(devolverResultado){
          resolve(result);
        }else{
          resolve("Operacion " + operacion + " completada con exito");
        }
      }
    });
  });
}

app.post("/dashboard/user/comprarAlbum", function (req, res) {
  //TODO comprobar entrada??
  let nombreColeccion = req.body.nombreColeccion;
  let idUser = "user";
  //let idUser = req.session.user
  var coleccion, cliente;

  obtenerColecciones(nombreColeccion).then(function(colecciones){
    coleccion = colecciones[0];
    if(coleccion.Estado !== "Agotado"){

      obtenerAlbumes(coleccion.Nombre, idUser).then(function(albumes){
        let album = albumes[0];

        if(album){
          res.send("Ya ha adquirido un album para dicha coleccion");
        }else{
          obtenerClientes(idUser).then(function(clientes){  
            cliente = clientes[0];

            if (cliente.Puntos > coleccion.PrecioAlbum){

              actualizarPuntosCliente(cliente.Puntos-coleccion.PrecioAlbum, idUser).then(function(){}, function(error){res.send(error.message);});
              agregarAlbumCliente(idUser, coleccion.Nombre).then(function(){res.send("Álbum comprado correctamente");}, function(error){res.send(error.message);});
           
            } else{
              res.send("Puntos insuficientes para comprar el album")
            };
          },function(error){res.send(error.message)});
        }

      },function(error){res.send(error.message)});

    }else{res.send("No hay existencias en álbumes de esa colección")}

  },function(error){res.send(error.message);});
});

var svgCaptcha = require('svg-captcha');
const { NOMEM } = require("dns");
app.get("/captcha", function (req, res) {
  svgCaptcha.options.width=1600;
  //svgCaptcha.options.size=100;
  svgCaptcha.options.color=true;
  var captcha = svgCaptcha.create(80);
    req.session.captcha = captcha.text;
    
    res.type('svg');
    res.status(200).send(captcha.data);
});
