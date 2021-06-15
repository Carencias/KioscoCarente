const USUARIO_INCORRECTO = -1;
const USUARIO_ESTANDAR = 0;
const ADMIN = 1;
const PUNTOS_PREGUNTA = 7;
const PUNTOS_CAPTCHA = 3;
const PUNTOS_PASATIEMPO = 15;
const PUNTOS_ECUACION = 10;


const bcrypt = require("bcryptjs");
const express = require("express");
var mime = require('mime-types');
const mysql = require("mysql");
const app = express();
const port = 8000;
const session = require("express-session");

const fileUpload = require('express-fileupload');
app.use(fileUpload());

const {
  response
} = require("express");
app.use(express.urlencoded({ extended: true }));
const fs = require('fs');
const ejs = require('ejs');
app.set('view engine', 'ejs');
var path = require('path');
const {
  send
} = require("process");


app.use(express.json());

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
      maxAge: (30 * 60 * 1000) //miliseconds
    }
  })
);

//Autenticacion comun
var auth = function (req, res, next) {
  if (req.session && req.session.userType !== undefined) return next();
  else return res.sendStatus(401);
};

var userAuth = function (req, res, next) {
  if (req.session && req.session.userType === USUARIO_ESTANDAR) {
    return next();
  } else {
    return res.redirect("/login");
  }
};

var adminAuth = function (req, res, next) {
  if (req.session && req.session.userType === ADMIN) return next();
  else return res.redirect("/login");
};

//Permite acceder a los recursos de una carpeta. El primer parametro es la ruta virtual sobre la que se monta, el segundo el real.
app.use("/", express.static(__dirname + "/webpage"));
app.use("/dashboard/user", userAuth, express.static(__dirname + "/dashboard/user"));
app.use("/dashboard/admin", adminAuth, express.static(__dirname + "/dashboard/admin"));

app.get("/dashboard/admin", adminAuth, function (req, res) {

  let string = "SELECT * FROM COLECCIONES ";
  connection.query(string, function (err, result, fields) {
    if (err) lanzarError(res, "Error al acceder a las colecciones");

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
            let tipoUsuario = usuario.Tipo;
            //Guardo en la sesión los datos obtenidos de la bbdd
            req.session.user = usuario.User;
            req.session.password = usuario.Password;
            req.session.userType = usuario.Admin;
  
            abrirSesionIniciada(req, res);
          }
        })
      }

    },
    function (error) {
      lanzarError(res, "Fallo en la base de datos");
  });
}

app.post("/login", function (req, res) {
  if (checkSesionIniciada(req)) {
    res.redirect("/dashboard");
  } else {
    if (!req.body.username || !req.body.password) {
      alerta.text = "Usuario y/o contraseña no introducidos";
      res.render(__dirname + "/login/views/login", {
        alert: alerta
      });
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
  if (checkSesionIniciada(req)) {
    abrirSesionIniciada(req, res);
  } else {
    res.render(__dirname + "/login/views/login", {
      alert: undefined
    });
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
      res.redirect("/dashboard/user");
    } else if (req.session.userType === ADMIN) {
      res.redirect("/dashboard/admin/");
    }
  }
}
app.get("/dashboard/logout", auth, function (req, res) {
  req.session.destroy();
  res.redirect("/index.html");
});

app.post("/registro", function (req, res) {
  let nombre = req.body.nombre;
  let username = req.body.username;
  let password = req.body.password_1;
  let apellidos = req.body.apellidos;
  let email = req.body.email;

  bcrypt.hash(password, 10, (err, encrypted) => {
    let hash = encrypted;
    agregarUsuario(username, hash, nombre, apellidos, email).then(
      () => {
        agregarCliente(username).then(
          () => {
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
  let coleccion = req.query.nombreColeccion;
  let idUser = req.session.user;

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

  let coleccion = req.query.nombreColeccion;
  let idUser = req.session.user;

  let stringUser = "SELECT * FROM CLIENTES WHERE User = '" + idUser + "'";
  connection.query(stringUser, function (err, resultUser, fields) {
    if (err) lanzarError(res, "Error al consultar la base de datos");

    let string = "SELECT * FROM CROMOS WHERE ID IN (SELECT CromoID FROM CROMOS_ALBUMES WHERE AlbumUser = '" + idUser + "' AND AlbumColeccion = '" + coleccion + "' )";
    connection.query(string, function (err, cromosComprados, fields) {
      if (err) lanzarError(res, "Error al consultar la base de datos");
      res.render('user/clienteCromos', {
        cromos: cromosComprados,
        nombreColeccion: coleccion,
        puntos: resultUser[0].Puntos
      });

    });

  });

});

app.get("/dashboard/user/comprarCromo", async function (req, res) {
  let idCromo = req.query.idCromo;
  let idUser = req.session.user;

  var cromo, cliente;

  obtenerCromos(idCromo).then(async function (cromos) {
      if (!cromos.length) {
        lanzarError(res, "No existe ese cromo");
      } else {

        let coleccionAlbum = await obtenerColeccionCromo(idCromo);
        coleccionAlbum = coleccionAlbum[0].Coleccion;

        cromo = cromos[0];

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

app.get("/dashboard/admin/editarColeccion", function (req, res) {

  let nomColeccion = req.query.nombreColeccion;

  let string = "SELECT * FROM CROMOS WHERE Coleccion = '" + nomColeccion + "'";
  connection.query(string, function (err, result, fields) {
    if (err) {
      lanzarError(res, "Error al consultar la base de datos");
    }

    obtenerColecciones(nomColeccion).then(function (coleccion) {
      
      res.render('admin/administradorEditarColeccion', {
        cromos: result,
        Coleccion: coleccion[0]
      });
      
    }, function (error) {
      lanzarError(res, "Error al consultar la base de datos");
    });
    

  });

});

app.post("/dashboard/admin/editarColeccion", function (req, res) {
  let nombreColeccion = req.query.nombreColeccion;
  let precioAlbum = req.body.precio_coleccion;
  let EDFile = req.files;
  let estado = req.body.estado;
  let descripcion = req.body.descripcion_coleccion;

  let parentPath = "/dashboard/resources/colecciones/" + nombreColeccion + "/";

  if (EDFile) {

    EDFile = EDFile.file;
    let rutaCompleta = parentPath + nombreColeccion + "." + mime.extension(EDFile.mimetype);

    actualizarColeccion(precioAlbum, rutaCompleta, descripcion, estado, nombreColeccion).then(
      () => {
        //Crear carpeta nueva si la vieja no existia
        if (!fs.existsSync(__dirname + parentPath)) {
          //ERROR. Si estoy editando tiene que existir
          lanzarError(res, "No existe el directorio en el que se almacena la imagen");
          return;
        } else {

          EDFile.mv(__dirname + rutaCompleta, err => {
            if (err) return res.status(500).send({
              message: err
            })


          })

        }

        res.redirect("/dashboard/admin/");

      },
      (error) => {
        lanzarError(res, "Error al editar la colección en la base de datos");
      }
    );

  } else {
    actualizarColeccionSinFoto(precioAlbum, descripcion, estado, nombreColeccion).then(() => {
      res.redirect("/dashboard/admin/");
    }, (err) => {
      lanzarError(res, "No se ha podido actualizar la coleccion")
    });
  }

});

app.post("/dashboard/admin/crearColeccion", function (req, res) {
  let nombreColeccion = req.body.titulo_coleccion;
  let precioAlbum = req.body.precio_coleccion;
  let EDFile = req.files;
  let descripcion = req.body.descripcion_coleccion;

  let parentPath = "/dashboard/resources/colecciones/" + nombreColeccion + "/";


  if (EDFile) {

    EDFile = EDFile.imagen_album;
    let rutaCompleta = parentPath + nombreColeccion + "." + mime.extension(EDFile.mimetype);

    agregarColeccion(nombreColeccion, precioAlbum, rutaCompleta, descripcion).then(
      () => {
        res.redirect("/dashboard/admin/");

        //Crear carpeta nueva si no existia
        if (!fs.existsSync(__dirname + parentPath)) {

          fs.mkdirSync(__dirname + parentPath, {
            recursive: true
          });

        }

        EDFile.mv(__dirname + rutaCompleta, err => {
          if (err) return res.status(500).send({
            message: err
          })

        })
      },
      (error) => {
        lanzarError(res, "Error al agregar la colección a la base de datos");
      }
    );
  } else {
    lanzarError(res, "Error en el archivo de foto");
  }
});

app.get("/dashboard/admin/editarCromo", function (req, res) {
  let id = req.query.IDCromo;

  let string = "SELECT * FROM CROMOS WHERE ID ='" + id + "'";
  connection.query(string, function (err, result, fields) {
    if (err) {
      lanzarError(res, "Error al consultar la base de datos");
    }
    res.render('admin/administradorEditarCromo', {
      cromo: result[0]
    });

  });

});

app.post("/dashboard/admin/editarCromo", function (req, res) {

  let id = req.query.IDCromo;
  let precio = req.body.precio_cromo_formulario;
  let cantidad = req.body.stock_cromo_formulario;
  let EDFile = req.files;
  let descripcion = req.body.descripcion_cromo_formulario;
  let datoInteresante = req.body.dato_cromo_formulario;
  let frecuencia = req.body.frecuencia_cromo_formulario;

  //Obtener coleccion
  obtenerColeccionCromo(id).then((coleccion) => {
    coleccion = coleccion[0].Coleccion;
    let parentPath = "/dashboard/resources/cromos/" + coleccion + "/";

    obtenerCromos(id).then((cromo) => {
      if (EDFile) {

        EDFile = EDFile.file;
        let nombre = cromo[0].Nombre;
        let rutaCompleta = parentPath + nombre + "." + mime.extension(EDFile.mimetype);

        editarCromo(id, precio, cantidad, rutaCompleta, descripcion, datoInteresante, frecuencia).then(
          () => {
            //Crear carpeta nueva si la vieja no existia
            if (!fs.existsSync(__dirname + parentPath)) {
              //ERROR. Si estoy editando tiene que existir
              res.send("No existe el directorio en el que se almacena la imagen");
              return;
            } else {

              EDFile.mv(__dirname + rutaCompleta, err => {
                if (err) return res.status(500).send({
                  message: err
                })

              })
            }
            res.redirect("./editarColeccion?nombreColeccion=" + coleccion);
          },
          (error) => {
            lanzarError(res, "Error al editar el cromo en la base de datos");
          });

      } else {
        actualizarCromoSinFoto(id, precio, cantidad, descripcion, datoInteresante, frecuencia).then(() => {
          res.redirect("./editarColeccion?nombreColeccion=" + coleccion);
        }, (err) => {
          lanzarError(res, "No se ha podido actualizar la coleccion")
        });
      }
    });


  },
  (err)=>{
    lanzarError(res, "Error al consultar la base de datos");
  }
  
  );

});

app.get("/dashboard/admin/crearCromo", function (req, res) {

  res.render('admin/administradorCrearCromo', {
    lenguaje: req.query.nombreColeccion
  });

});

app.post("/dashboard/admin/crearCromo", function (req, res) {
  let nombre = req.body.nombre;
  let coleccion = req.query.nombreColeccion;
  let EDFile = req.files;
  let precio = req.body.precio;
  let cantidad = req.body.stock;
  let descripcion = req.body.descripcion;
  let datoInteresante = req.body.dato;
  let frecuencia = req.body.frecuencia;

  let parentPath = "/dashboard/resources/cromos/" + coleccion + "/";

  if (EDFile) {
    EDFile = EDFile.file;
    let rutaCompleta = parentPath + nombre + "." + mime.extension(EDFile.mimetype);

    agregarCromo(nombre, coleccion, rutaCompleta, precio, cantidad, descripcion, datoInteresante, frecuencia).then(
      () => {
        //Crear carpeta nueva si no existia
        if (!fs.existsSync(__dirname + parentPath)) {

          fs.mkdirSync(__dirname + parentPath, {
            recursive: true
          });

        }

        EDFile.mv(__dirname + rutaCompleta, err => {
          if (err) return res.status(500).send({
            message: err
          })
        });

        res.redirect("./editarColeccion?nombreColeccion=" + coleccion);
      },
      (error) => {
        lanzarError(res, "Error al crear el nuevo cromo");
      }
    );
  } else {
    lanzarError(res, "Error en el archivo de foto");
  }



});

app.post("/dashboard/admin/borrarCromo", function (req, res) {
  let id = req.body.id;

  cromosComprados(id).then(
    (cromosComprados) => {
      if(cromosComprados.length){
        lanzarError(res, "No se puede borrar un cromo que ya ha sido comprado por algun cliente");
      }else{
        borrarCromo(id).then(
          () => {
            res.send("El cromo ha sido borrado")
          },
          (error) => {
            lanzarError(res, "Error al intentar borrar el cromo de la base de datos");
          }
        );
      }
    },
    (error) => {
      lanzarError(res, "Error al intentar borrar el cromo de la base de datos");
    }
  )

});

app.post("/dashboard/admin/borrarColeccion", function (req, res) {
  let nombre = req.body.nombre;

  cromosCompradosColeccion(nombre).then(
    (cromosComprados) => {
      if(cromosComprados.length){
        lanzarError(res, "No se puede borrar una coleccion que tiene cromos que ya han sido comprados por algun cliente");
      }else{
        borrarColeccion(nombre).then(
          () => {
            res.send("La coleccion ha sido borrada")
          },
          (error) => {
            lanzarError(res, "Error al borrar la colección de la base de datos");
          }
        );
      }
    },
    (error) => {
      lanzarError(res, "Error al intentar borrar el cromo de la base de datos");
    }
  )

});

function cromosComprados(idCromo){
  return ejecutarQueryBBDD("SELECT * FROM CROMOS_ALBUMES WHERE CromoID = ?", [idCromo], "Comprobar si cromo esta comprado", true);
}

function cromosCompradosColeccion(coleccion){
  return ejecutarQueryBBDD("SELECT * FROM CROMOS_ALBUMES WHERE AlbumColeccion = ?", [coleccion], "Comprobar si la coleccion tiene algun cromo esta comprado", true);
}

function obtenerColecciones(nombreColeccion) {
  return ejecutarQueryBBDD("SELECT * FROM COLECCIONES WHERE Nombre = ?", [nombreColeccion], "Obtener coleccion", true);
}

function actualizarUsuario(nombre, apellidos, email, idUser) {
  return ejecutarQueryBBDD("UPDATE USUARIOS SET Nombre = ?, Apellidos = ?, Email = ?  WHERE User = ?", [nombre, apellidos, email, idUser], "Actualizar perfil", false);
}

function obtenerColeccionCromo(idCromo) {
  return ejecutarQueryBBDD("SELECT Coleccion FROM CROMOS WHERE ID = ?", [idCromo], "Obtener coleccion de cromo", true);
}

function borrarColeccion(nombre) {
  return ejecutarQueryBBDD("DELETE FROM COLECCIONES WHERE Nombre = ?", [nombre], "Borrar coleccion", false);
}

function borrarCromo(id) {
  return ejecutarQueryBBDD("DELETE FROM CROMOS WHERE ID = ?", [id], "Borrar cromo", false);
}

function obtenerCromos(idCromo) {
  return ejecutarQueryBBDD("SELECT * FROM CROMOS WHERE ID = ?", [idCromo], "Obtener cromo", true);
}

function agregarCromo(nombre, coleccion, rutaImagen, precio, cantidad, descripcion, datoInteresante, frecuencia) {
  return ejecutarQueryBBDD("INSERT INTO CROMOS (Nombre, Coleccion, RutaImagen, Precio, Cantidad, Descripcion, DatoInteresante, Frecuencia) VALUES (?,?,?,?,?,?,?,?)",
    [nombre, coleccion, rutaImagen, precio, cantidad, descripcion, datoInteresante, frecuencia], "Agregar cromo", false);
}

function editarCromo(id, precio, cantidad, imagen, descripcion, datoInteresante, frecuencia) {
  return ejecutarQueryBBDD("UPDATE CROMOS SET Precio = ?, Cantidad = ?, RutaImagen = ?, Descripcion = ?, DatoInteresante = ?, Frecuencia = ? WHERE ID = ?",
    [precio, cantidad, imagen, descripcion, datoInteresante, frecuencia, id], "Editar cromo", false);
}

function actualizarCromoSinFoto(id, precio, cantidad, descripcion, datoInteresante, frecuencia) {
  return ejecutarQueryBBDD("UPDATE CROMOS SET Precio = ?, Cantidad = ?, Descripcion = ?, DatoInteresante = ?, Frecuencia = ? WHERE ID = ?",
    [precio, cantidad, descripcion, datoInteresante, frecuencia, id], "Editar cromo", false);
}

function actualizarColeccion(precioAlbum, foto, descripcion, estado, nombre) {
  return ejecutarQueryBBDD("UPDATE COLECCIONES SET PrecioAlbum = ?, FotoAlbum = ?, Descripcion = ?, Estado = ?  WHERE Nombre = ?", [precioAlbum, foto, descripcion, estado, nombre], "Editar coleccion", false);
}

function actualizarColeccionSinFoto(precioAlbum, descripcion, estado, nombre) {
  return ejecutarQueryBBDD("UPDATE COLECCIONES SET PrecioAlbum = ?, Descripcion = ?, Estado = ?  WHERE Nombre = ?", [precioAlbum, descripcion, estado, nombre], "Editar coleccion", false);
}

function agregarColeccion(nombre, precioAlbum, foto, descripcion) {
  return ejecutarQueryBBDD("INSERT INTO COLECCIONES (Nombre,PrecioAlbum,FotoAlbum,Descripcion) VALUES (?,?,?,?)", [nombre, precioAlbum, foto, descripcion], "Agregar coleccion", false);
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
  let nombreColeccion = req.query.nombreColeccion;
  let idUser = req.session.user;
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
    }

  }, function (error) {
    lanzarError(res, "Error al consultar la base de datos");
  });
});

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
  let puntos = await obtenerPuntosCliente(idUser);

  //SUMAR PUNTOS
  puntos = puntos + PUNTOS_PASATIEMPO;
  actualizarPuntosCliente(puntos, idUser);

  return res.redirect('/dashboard/user/retoPasatiempo');
});

app.post("/dashboard/user/retoCaptcha", async function (req, res) {
  let respuesta = req.body.respuesta;
  let idUser = req.session.user;
  let puntos = await obtenerPuntosCliente(idUser);

  if (req.session.captcha) {

    let alerta = [];
    if (respuesta === req.session.captcha) {
      alerta.esValido = 1;

      //SUMAR PUNTOS
      puntos = puntos + PUNTOS_CAPTCHA;
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
  let respuestaCorrecta = req.session.respuestaPregunta;
  let idUser = req.session.user
  let puntos = await obtenerPuntosCliente(req.session.user);

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
  let respuestaCorrectaEcuacion = req.session.respuestaEcuacion;
  let idUser = req.session.user
  let puntos = await obtenerPuntosCliente(idUser);
  let alerta = [];

  //Si se generó una pregunta con GET
  if (respuestaCorrectaEcuacion) {
    if (req.body.respuesta.toLowerCase() === respuestaCorrectaEcuacion.toLowerCase()) {

      alerta.esValido = 1;

      actualizarPuntosCliente(puntos + PUNTOS_ECUACION, idUser).catch((error) => {});

      puntos = puntos + PUNTOS_ECUACION;

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


