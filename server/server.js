const USUARIO_INCORRECTO = -1;
const USUARIO_ESTANDAR = 0;
const ADMIN = 1;

const bcrypt = require("bcrypt");
const express = require("express");
const app = express();
const port = 8000;
const session = require("express-session");

const fileUpload = require('express-fileupload');
app.use(fileUpload());

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

app.use(require('./admin.js'));
const connection = require('./database.js')

app.use(express.json());
/*app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "POST" | "GET");
  next();
});*/

app.listen(port, () => {
  console.log(`Running ${port}`);
});

//AUTENTICACION
app.use(
  session({
    secret: "carencias", //Firma secreta
    resave: false, //No se para que sirve
    saveUninitialized: false, //La sesion no se almacena si está vacia
    cookie: {
      //secure: true --> Requiere HTTPS
      maxAge: (30 * 60 * 1000) //miliseconds
    }
    //expires: new Date(Date.now() + 30 * 60 * 1000), //miliseconds??
  })
);

//Autenticacion comun
var auth = function (req, res, next) {
  if (req.session && req.session.userType !== undefined) return next();
  else return res.sendStatus(401);
};

var userAuth = function (req, res, next) {
  if (req.session && req.session.userType === USUARIO_ESTANDAR) {
    //console.log(req.session);
    //console.log(req.session.userType);
    return next();
  } else {
    return res.redirect("/login");
  }
};

var adminAuth = function (req, res, next) {
  if (req.session && req.session.userType === ADMIN) return next();
  else return res.redirect("/login");
};

app.get("/cookie", function (req, res) {
  res.write('<p>expires in: ' + (req.session.cookie.maxAge / 1000) + 's</p>');
  res.end();
});

//TODO
//Permite acceder a los recursos de una carpeta. El primer parametro es la ruta virtual sobre la que se monta, el segundo el real.
app.use("/", express.static(__dirname + "/webpage"));
//app.use("/dashboard/admin", adminAuth);
//app.use("/dashboard/user", userAuth);
app.use("/dashboard/user", userAuth, express.static(__dirname + "/dashboard/user"));
app.use("/dashboard/admin", adminAuth, express.static(__dirname + "/dashboard/admin"));

app.get("/dashboard/admin", adminAuth, function (req, res) {

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
    function (usuarios) {

      let usuario = usuarios[0];
      if (!usuario) {
        let alerta = {
          text: "Usuario y/o contraseña incorrectos"
        };
        res.render(__dirname + "/login/views/login", {
          alert: alerta
        });
      }else{
        bcrypt.compare(password, usuario.Password, function (err, result) {

          if (result == false) {
            let alerta = {
              text: "Usuario y/o contraseña incorrectos"
            };
            res.render(__dirname + "/login/views/login", {
              alert: alerta
            });
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
        })
      }

    },
    function (error) {
      console.log(error);
      lanzarError(res, "Fallo en la base de datos");
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
      alerta.text = "Usuario y/o contraseña no introducidos";
      res.render(__dirname + "/login/views/login", {
        alert: alerta
      });
      /*res.send(
        "Usuario o contraseña no introducido" +
        req.body.username +
        req.body.password
      );*/
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
    res.render(__dirname + "/login/views/login", {
      alert: undefined
    });
    //res.sendFile(__dirname + "/login/login.html");
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
  let password = req.body.password_1;
  let apellidos = req.body.apellidos;
  let email = req.body.email;

  bcrypt.hash(password, 10, (err, encrypted) => {
    let hash = encrypted;
    console.log(hash);
    agregarUsuario(username, hash, nombre, apellidos, email).then(
      () => {
        agregarCliente(username).then(
          () => {
            console.log("Se ha creado el usuario exitosamente");
            res.redirect("/login");
          },
          (error) => {
            lanzarError(res, "Error al agregar al cliente a la base de datos");
          });
      },
      (error) => {
        lanzarError(res, "Error al agregar al nuevo usuario a la base de datos");
      }
    );

  });

});

app.post("/dashboard/user/editarPerfil", function (req, res) {
  let nombre = req.body.nombre_perfil;
  let apellidos = req.body.apellidos_perfil;
  let email = req.body.email_perfil;
  let idUser = req.session.user;

  actualizarUsuario(nombre, apellidos, email, idUser).then(
    () => {
      res.redirect("/dashboard/user");
    },
    (error) => {
      lanzarError(res, "Error al actualizar el perfil");
    }
  );

});

app.get("/dashboard/user/editarPerfil", function (req, res) {

  let string = "SELECT * FROM USUARIOS WHERE User = '" + req.session.user + "'";

  connection.query(string, function (err, result, fields) {
    console.log(result);
    if (err) {
      lanzarError(res, "Error al consultar la base de datos");
    }
    res.render('user/clientePerfil', {
      user: result[0],
    });

  });

});

app.post("/dashboard/admin/editarPerfil", function (req, res) {
  let nombre = req.body.nombre_perfil;
  let apellidos = req.body.apellidos_perfil;
  let email = req.body.email_perfil;
  let idUser = req.session.user;

  actualizarUsuario(nombre, apellidos, email, idUser).then(
    () => {
      res.redirect("/dashboard/admin");
    },
    (error) => {
      lanzarError(res, "Error al actualizar el perfil");
    }
  );

});

app.get("/dashboard/admin/editarPerfil", function (req, res) {

  let string = "SELECT * FROM USUARIOS WHERE User = '" + req.session.user + "'";

  connection.query(string, function (err, result, fields) {
    console.log(result);
    if (err) {
      lanzarError(res, "Error al consultar la base de datos");
    }
    res.render('admin/administradorPerfil', {
      user: result[0],
    });

  });

});


app.set('views', path.join(__dirname, '/dashboard/views'));
app.use("/dashboard/assets", express.static(__dirname + "/dashboard/assets"));
app.use("/dashboard/resources", express.static(__dirname + "/dashboard/resources"));
//app.use("/dashboard/resources/colecciones/java/imagenes/", express.static(__dirname + "/dashboard/resources/colecciones/java/imagenes/"));
//app.use("/dashboard/resources/*", express.static(__dirname + "/dashboard/resources/media"));

//Acceso a subdirectorios público
/*app.get("/dashboard/assets/*", function (req, res) {
  let url = req.originalUrl;
  console.log(url.toString());

  if (fs.existsSync(__dirname + url.toString())) {
    res.sendFile(__dirname + url.toString());
  } else {
    res.sendStatus(404);
  }

});*/


/*app.get("/dashboard/resources/*", function (req, res) {
  let url = req.originalUrl;
  //console.log(url.toString());

  if (fs.existsSync(__dirname + url.toString())) {
    res.sendFile(__dirname + url.toString());
  } else {
    res.sendStatus(404);
  }

});*/


//PAGINA PRINCIPAL USUARIO
app.get("/dashboard/user", async function (req, res) {
  let string = "SELECT * FROM COLECCIONES WHERE Nombre IN(SELECT Coleccion FROM ALBUMES WHERE User = '" + req.session.user + "')";
  var colecciones;
  var estadosAlbumes;
  connection.query(string, function (err, result, fields) {
    if (err) {
      lanzarError(res, "Error al consultar la base de datos");
    }
    colecciones = result;
    let string = "SELECT Estado FROM ALBUMES WHERE User = '" + req.session.user + "'";

    connection.query(string, function (err, resultEstados, fields) {
      if (err) {
        lanzarError(res, "Error al consultar la base de datos");
      }
      estadosAlbumes = resultEstados;
      let stringUser = "SELECT * FROM CLIENTES WHERE User = '" + req.session.user + "'";
      connection.query(stringUser, function (err, resultUser, fields) {
        if (err) {
          lanzarError(res, "Error al consultar la base de datos");
        }
        res.render('user/clientePrincipal', {
          colecciones: colecciones,
          estados: estadosAlbumes,
          nombre: req.session.user,
          puntos: resultUser[0].Puntos
        });
      });
    });
  });
});

//PASATIEMPO
app.get("/dashboard/user/retoPasatiempo", async function (req, res) {
  let stringUser = "SELECT * FROM CLIENTES WHERE User = '" + req.session.user + "'";
  connection.query(stringUser, function (err, resultUser, fields) {
    if (err) {
      lanzarError(res, "Error al consultar la base de datos");
    }
    res.render('user/clienteRetoPasatiempo', {
      puntos: resultUser[0].Puntos
    });
  });
});

//TIENDA USUARIO ALBUMES
app.get("/dashboard/user/tiendaAlbumes", function (req, res) {

  let stringCompradas = "SELECT * FROM COLECCIONES AS c INNER JOIN ALBUMES AS a ON c.Nombre = a.Coleccion WHERE c.Estado = 'Activa' and a.User = '" + req.session.user + "'";
  connection.query(stringCompradas, function (err, coleccionesDisponiblesCompradas, fields) {
    if (err) {
      lanzarError(res, "Error al consultar la base de datos");
    }
    let stringNoCompradas = "SELECT * FROM COLECCIONES WHERE Estado = 'Activa' AND Nombre not IN( SELECT Nombre FROM COLECCIONES AS c INNER JOIN ALBUMES AS a ON c.Nombre = a.Coleccion WHERE c.Estado = 'Activa' and a.User = '" + req.session.user + "' )";
    connection.query(stringNoCompradas, function (err, coleccionesDisponiblesNoCompradas, fields) {
      if (err) {
        lanzarError(res, "Error al consultar la base de datos");
      }
      let stringUser = "SELECT * FROM CLIENTES WHERE User = '" + req.session.user + "'";
      connection.query(stringUser, function (err, resultUser, fields) {
        if (err) {
          lanzarError(res, "Error al consultar la base de datos");
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

  let string = "SELECT * FROM CROMOS AS c WHERE c.ID not IN(SELECT CromoID FROM CROMOS_ALBUMES WHERE AlbumUser = '" + idUser + "' AND AlbumColeccion = '" + coleccion + "') AND c.Coleccion = '" + coleccion + "'";
  connection.query(string, function (err, cromosNoComprados, fields) {
    if (err) lanzarError(res, "Error al consultar la base de datos");


    let string = "SELECT * FROM CROMOS WHERE ID IN (SELECT CromoID FROM CROMOS_ALBUMES WHERE AlbumUser = '" + idUser + "' AND AlbumColeccion = '" + coleccion + "' )";

    connection.query(string, function (err, cromosComprados, fields) {
      if (err) lanzarError(res, "Error al consultar la base de datos");

      let stringUser = "SELECT * FROM CLIENTES WHERE User = '" + req.session.user + "'";
      connection.query(stringUser, function (err, resultUser, fields) {
        if (err) {
          lanzarError(res, "Error al consultar la base de datos");
        }

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
  let idUser = req.session.user;

  let stringUser = "SELECT * FROM CLIENTES WHERE User = '" + idUser + "'";
  connection.query(stringUser, function (err, resultUser, fields) {
    if (err) lanzarError(res, "Error al consultar la base de datos");

    let string = "SELECT * FROM CROMOS WHERE ID IN (SELECT CromoID FROM CROMOS_ALBUMES WHERE AlbumUser = '" + idUser + "' AND AlbumColeccion = '" + coleccion + "' )";
    connection.query(string, function (err, cromosComprados, fields) {
      if (err) lanzarError(res, "Error al consultar la base de datos");
      console.log(cromosComprados);
      res.render('user/clienteCromos', {
        cromos: cromosComprados,
        nombreColeccion: coleccion,
        puntos: resultUser[0].Puntos
      });

    });

  });

});

app.get("/dashboard/user/comprarCromo", async function (req, res) {
  //TODO comprobar entrada??
  let idCromo = req.query.idCromo;
  //let idUser = req.session.user
  let idUser = "user";

  var cromo, cliente;

  obtenerCromos(idCromo).then(async function (cromos) {
      if (!cromos.length) {
        lanzarError(res, "No existe ese cromo");
      } else {

        let coleccionAlbum = await obtenerColeccionCromo(idCromo);
        coleccionAlbum = coleccionAlbum[0].Coleccion;

        cromo = cromos[0];

        var precio = cromo.Precio;
        var cantidad = cromo.Cantidad;
        if (cantidad > 0) {
          obtenerClientes(idUser).then(function (clientes) {
            cliente = clientes[0];
            if (cliente.Puntos > cromo.Precio) {
              consultarCromoAlbum(idCromo, idUser, coleccionAlbum).then(function () {
                agregarCromoAAlbumAtomico(idCromo, coleccionAlbum, idUser, cromo.Precio, cromo.Cantidad, cliente.Puntos).then(function () {
                  res.redirect("./TiendaCromos?nombreColeccion=" + coleccionAlbum);

                  calcularNuevoEstadoAlbum(idUser, coleccionAlbum);

                }, function (error) {
                  lanzarError(res, "Error al consultar la base de datos");
                });
              }, function (error) {
                lanzarError(res, "Error al consultar la base de datos");
              });
            } else {
              lanzarError(res, "Puntos insuficientes para comprar el cromo");
            };
          }, function (error) {
            lanzarError(res, "Error al consultar la base de datos");
          });
        } else {
          lanzarError(res, "No hay existencias de ese cromo");
        }

      }

    },
    function (error) {
      lanzarError(res, "Error al consultar la base de datos");
    });
});

function lanzarError(res, mensaje) {
  res.render(__dirname + '/error/views/error', {
    error: mensaje
  });
}

function calcularNuevoEstadoAlbum(usuario, coleccion) {
  contarCromosComprados(usuario, coleccion).then(function (numCromosComprados) {

    numCromosComprados = numCromosComprados[0].numCromosComprados;

    contarCromosColeccion(coleccion).then(function (numCromosColeccion) {

      numCromosColeccion = numCromosColeccion[0].numCromosColeccion;

      if (numCromosComprados === 0) {
        cambiarEstadoAlbum('No iniciada', usuario, coleccion);
      } else if (numCromosComprados < numCromosColeccion) {
        cambiarEstadoAlbum('Completada parcialmente', usuario, coleccion);
      } else {
        cambiarEstadoAlbum('Finalizada', usuario, coleccion);
      }

    }, function (error) {
      lanzarError(res, "Error al consultar la base de datos");
    })
  }, function (error) {
    lanzarError(res, "Error al consultar la base de datos");
  });
}

function consultarCromoAlbum(idCromo, idUser, coleccionAlbum) {
  return new Promise(function (resolve, reject) {
    connection.query("SELECT * FROM CROMOS_ALBUMES WHERE CromoID = ? AND AlbumUser = ? AND AlbumColeccion = ?", [idCromo, idUser, coleccionAlbum], function (err, result) {
      if (err) reject(Error("No se ha podido consultar si está o no el cromo en el álbum"));
      else if (result) {
        if (result.length !== 0) reject(Error("Cromo ya comprado"));
        else resolve("El cromo no está comprado");
      }
    });
  });
}

function agregarCromoAAlbumAtomico(idCromo, coleccionAlbum, idUser, precio, cantidad, puntos) {
  return new Promise(function (resolve, reject) {
    actualizarPuntosCliente(puntos - precio, idUser)
      .then(function () {
        actualizarCantidadCromo(cantidad - 1, idCromo)
          .then(function () {
            agregarCromoAAlbum(idCromo, idUser, coleccionAlbum)
              .then(function () {
                  resolve()
                },
                function (error) {
                  actualizarCantidadCromo(cantidad + 1, idCromo);
                  actualizarPuntosCliente(puntos + precio, idUser);
                });
          }, function (error) {
            actualizarPuntosCliente(puntos + precio, idUser);
          });
      }, function (error) {
        reject(error);
      });
  });
}

function cambiarEstadoAlbum(estado, usuario, coleccion) {
  return ejecutarQueryBBDD("UPDATE ALBUMES SET Estado = ? WHERE User = ? AND Coleccion = ?", [estado, usuario, coleccion], "Cambiar estado album", false);
}

function obtenerColeccionCromo(idCromo) {
  return ejecutarQueryBBDD("SELECT Coleccion FROM CROMOS WHERE ID = ?", [idCromo], "Obtener coleccion de cromo", true);
}

function contarCromosComprados(usuario, coleccion) {
  return ejecutarQueryBBDD("SELECT COUNT(*) AS numCromosComprados FROM CROMOS_ALBUMES WHERE AlbumUser = ? AND AlbumColeccion = ?", [usuario, coleccion], "Contar cromos comprados", true);
}

function contarCromosColeccion(coleccion) {
  return ejecutarQueryBBDD("SELECT COUNT(*) AS numCromosColeccion FROM CROMOS WHERE Coleccion = ?", [coleccion], "Contar cromos coleccion", true);
}

function agregarUsuario(username, password, nombre, apellidos, email) {
  return ejecutarQueryBBDD("INSERT INTO USUARIOS (User, Password, Nombre, Apellidos, Email) VALUES (?, ?, ?, ?, ?)", [username, password, nombre, apellidos, email], "Agregar usuario", false);
}

function agregarCliente(username) {
  return ejecutarQueryBBDD("INSERT INTO CLIENTES (User) VALUES (?)", [username], "Agregar cliente", false);
}

function actualizarUsuario(nombre, apellidos, email, idUser) {
  return ejecutarQueryBBDD("UPDATE USUARIOS SET Nombre = ?, Apellidos = ?, Email = ?  WHERE User = ?", [nombre, apellidos, email, idUser], "Actualizar perfil", false);
}

function obtenerUsuarios(username) {
  return ejecutarQueryBBDD("SELECT User, Password, Admin FROM USUARIOS WHERE User = ?", [username], "Obtener usuario", true);
}

function agregarCromoAAlbum(idCromo, idUser, coleccionAlbum) {
  return ejecutarQueryBBDD("INSERT INTO CROMOS_ALBUMES (CromoID, AlbumUser, AlbumColeccion) VALUES (?, ?, ?)", [idCromo, idUser, coleccionAlbum], "Agregar cromo a album", false);
}

function actualizarCantidadCromo(nuevaCantidad, idCromo) {
  return ejecutarQueryBBDD("UPDATE CROMOS SET Cantidad = ? WHERE ID = ?", [nuevaCantidad, idCromo], "Actualizar cantidad cromo", false);
}

function actualizarPuntosCliente(nuevosPuntos, idUser) {
  return ejecutarQueryBBDD("UPDATE CLIENTES SET Puntos = ? WHERE User = ?", [nuevosPuntos, idUser], "Actualizar puntos cliente", false);
}

function agregarAlbumCliente(idUser, nombreColeccion) {
  return ejecutarQueryBBDD("INSERT INTO ALBUMES (User, Coleccion) VALUES (?, ?)", [idUser, nombreColeccion], "Agregar album al cliente", false);
}

function obtenerColecciones(nombreColeccion) {
  return ejecutarQueryBBDD("SELECT * FROM COLECCIONES WHERE Nombre = ?", [nombreColeccion], "Obtener coleccion", true);
}

function obtenerClientes(idUser) {
  return ejecutarQueryBBDD("SELECT * FROM CLIENTES WHERE User = ?", [idUser], "Obtener cliente", true);
}

function obtenerCromos(idCromo) {
  return ejecutarQueryBBDD("SELECT * FROM CROMOS WHERE ID = ?", [idCromo], "Obtener cromo", true);
}

function obtenerAlbumes(coleccion, usuario) {
  return ejecutarQueryBBDD("SELECT * FROM ALBUMES WHERE User = ? AND Coleccion = ?", [usuario, coleccion], "Obtener album", true);
}

async function obtenerPuntosCliente(idUser) {
  let clientes = await obtenerClientes(idUser);
  let puntos = clientes[0].Puntos;
  return puntos;
}

function ejecutarQueryBBDD(query, arrayDatos, operacion, devolverResultado) {
  return new Promise(function (resolve, reject) {
    connection.query(query, arrayDatos, function (err, result) {
      if (err) {
        reject (Error("Operacion " + operacion + " no completada"));
      } else {
        if (devolverResultado) {
          return resolve(result);
        } else {
          return resolve("Operacion " + operacion + " completada con exito");
        }
      }
    });
  });
}

app.get("/dashboard/user/comprarAlbum", function (req, res) {
  //TODO comprobar entrada??
  let nombreColeccion = req.query.nombreColeccion;
  //let idUser = "user";
  let idUser = req.session.user
  var coleccion, cliente;

  obtenerColecciones(nombreColeccion).then(function (colecciones) {
    coleccion = colecciones[0];
    if (coleccion.Estado !== "Agotado") {

      obtenerAlbumes(coleccion.Nombre, idUser).then(function (albumes) {
        let album = albumes[0];

        if (album) {
          lanzarError(res, "Ya ha adquirido un album para dicha coleccion");
        } else {
          obtenerClientes(idUser).then(function (clientes) {
            cliente = clientes[0];

            if (cliente.Puntos > coleccion.PrecioAlbum) {

              actualizarPuntosCliente(cliente.Puntos - coleccion.PrecioAlbum, idUser).then(function () {}, function (error) {
                lanzarError(res, "Error al consultar la base de datos");
              });
              agregarAlbumCliente(idUser, coleccion.Nombre).then(function () {
                res.redirect("./tiendaAlbumes");
              }, function (error) {
                lanzarError(res, "Error al consultar la base de datos");
              });

            } else {
              lanzarError(res, "Puntos insuficientes para comprar el album");
            };
          }, function (error) {
            lanzarError(res, "Error al consultar la base de datos");
          });
        }

      }, function (error) {
        lanzarError(res, "Error al consultar la base de datos");
      });

    } else {

      lanzarError(res, "No hay existencias en álbumes de esa colección");
      //res.send("No hay existencias en álbumes de esa colección")
    }

  }, function (error) {
    lanzarError(res, "Error al consultar la base de datos");
  });
});



//RETOS

//CAPTCHA
var svgCaptcha = require('svg-captcha');
const {
  type
} = require("os");

app.get("/dashboard/user/retoCaptcha", async function (req, res) {
  renderCaptchaAleatoria(req, res, undefined);

});

app.post("/dashboard/user/retoPasatiempo", async function (req, res) {
  let idUser = req.session.user;
  let PUNTOS_PREGUNTA = 15;
  let puntos = await obtenerPuntosCliente(idUser);

  //SUMAR PUNTOS
  puntos = puntos + PUNTOS_PREGUNTA;
  actualizarPuntosCliente(puntos, idUser);

});

app.post("/dashboard/user/retoCaptcha", async function (req, res) {
  let respuesta = req.body.respuesta;
  let idUser = req.session.user;
  let PUNTOS_PREGUNTA = 3;
  let puntos = await obtenerPuntosCliente(idUser);

  if (req.session.captcha) {

    let alerta = [];
    if (respuesta === req.session.captcha) {
      alerta.esValido = 1;

      //SUMAR PUNTOS
      puntos = puntos + PUNTOS_PREGUNTA;
      actualizarPuntosCliente(puntos, idUser);

    } else {
      //INVALIDO
      alerta.esValido = 0;
    }

    renderCaptchaAleatoria(req, res, alerta);

  } else {
    res.sendStatus(403);
  }

});

function generarCaptcha() {
  svgCaptcha.options.width = 220;
  return svgCaptcha.create(8);
}

async function renderCaptchaAleatoria(req, res, alerta) {
  var captcha = generarCaptcha();
  req.session.captcha = captcha.text;
  let puntos = undefined;
  puntos = await obtenerPuntosCliente(req.session.user).catch((error) => {
    lanzarError(res, "Error al consultar la base de datos");
  });
  if (puntos) {
    res.render('user/clienteRetoCaptcha', {
      image: captcha.data,
      alerta: alerta,
      puntos: puntos
    });
  }
}

//PREGUNTAS

app.get("/dashboard/user/retoPregunta", async function (req, res) {

  renderPreguntaAleatoria(req, res, undefined);

});

function obtenerPreguntaAleatoria() {
  return ejecutarQueryBBDD("SELECT * FROM PREGUNTAS ORDER BY RAND() LIMIT 1", [], "Obtener Pregunta", true);
}

app.post("/dashboard/user/retoPregunta", async function (req, res) {
  //TODO comprobar entrada??
  let respuestaCorrecta = req.session.respuestaPregunta;
  let idUser = req.session.user
  let puntos = await obtenerPuntosCliente(req.session.user);

  //TODO PONERLO ARRIBA
  const PUNTOS_PREGUNTA = 7;
  let alerta = [];

  //Si se generó una pregunta con GET
  if (req.session.pregunta) {
    if (req.body.respuesta.toLowerCase() === respuestaCorrecta.toLowerCase()) {

      alerta.esValido = 1;

      actualizarPuntosCliente(puntos + PUNTOS_PREGUNTA, idUser).catch((error) => {});

      puntos = puntos + PUNTOS_PREGUNTA;

    } else {

      alerta.esValido = 0;

    }

    renderPreguntaAleatoria(req, res, alerta);


  } else {
    res.sendStatus(403);
  }
});

async function renderPreguntaAleatoria(req, res, alerta) {
  let puntos = await obtenerPuntosCliente(req.session.user);

  obtenerPreguntaAleatoria().then((result) => {
    let pregunta = result[0].Pregunta;
    let respuesta = result[0].Respuesta;

    req.session.pregunta = pregunta;
    req.session.respuestaPregunta = respuesta;

    res.render('user/clienteRetoPregunta', {
      pregunta: pregunta,
      alerta: alerta,
      puntos: puntos
    });

  });

}

//ECUACIONES
const katex = require('katex');
app.get("/dashboard/user/retoEcuacion", async function (req, res) {
  renderEcuacionAleatoria(req, res, undefined);
});

app.post("/dashboard/user/retoEcuacion", async function (req, res) {
  //TODO comprobar entrada??
  let respuestaCorrectaEcuacion = req.session.respuestaEcuacion;
  let idUser = req.session.user
  let puntos = await obtenerPuntosCliente(idUser);

  //TODO PONERLO ARRIBA
  const PUNTOS_PREGUNTA = 10;
  let alerta = [];

  //Si se generó una pregunta con GET
  if (respuestaCorrectaEcuacion) {
    if (req.body.respuesta.toLowerCase() === respuestaCorrectaEcuacion.toLowerCase()) {

      alerta.esValido = 1;

      actualizarPuntosCliente(puntos + PUNTOS_PREGUNTA, idUser).catch((error) => {});

      puntos = puntos + PUNTOS_PREGUNTA;

    } else {

      alerta.esValido = 0;

    }

    renderEcuacionAleatoria(req, res, alerta);

  } else {
    res.sendStatus(403);
  }
});

async function renderEcuacionAleatoria(req, res, alerta) {
  let puntos = await obtenerPuntosCliente(req.session.user);

  obtenerEcuacionAleatoria().then((result) => {
    let ecuacion = result[0].Ecuacion;
    let respuesta = result[0].Respuesta;
    let ecuacionLatex = katex.renderToString(ecuacion);
    req.session.ecuacion = ecuacionLatex;
    req.session.respuestaEcuacion = respuesta;

    res.render('user/clienteRetoEcuacion', {
      ecuacion: ecuacionLatex,
      alerta: alerta,
      puntos: puntos
    });

  });
}

function obtenerEcuacionAleatoria() {
  return ejecutarQueryBBDD("SELECT * FROM ECUACIONES ORDER BY RAND() LIMIT 1", [], "Obtener Pregunta", true);
}


