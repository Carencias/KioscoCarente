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
const jsdom = require("jsdom");
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
  //pruebaBaseDatos();
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

//Autenticación comun
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

function comprobarCredenciales(req, res) {
  let username = req.body.username;
  let password = req.body.password;

  connection.query(
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
  );
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
    res.sendFile(__dirname + "/webpage/login.html");
  }
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
  // This prints "My First JSDOM!"

  //res.send("Sesión Finalizada correctamente");
});

//Para requerir la autenticacion al acceder a las paginas hay que agregar auth como aqui
app.get("/content", auth, function (req, res) {
  res.send("You can only see this after you've logged in.");
});

app.post("/registro", function (req, res) {
  let nombre = req.body.nombre;
  let username = req.body.username;
  let password = req.body.password;
  let apellidos = req.body.apellidos;
  let email = req.body.email;
  
  connection.connect();
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

  res.send("Se ha creado el usuario exitosamente");
});

//METODOS PARA LA GESTION DE CROMOS
app.post("/crearColeccion", function (req, res) {
  //TODO comprobar entrada??
  let nombre = req.body.nombre;
  let precioAlbum = req.body.precio;
  let foto = req.body.foto;

  connection.connect();
  let string = "INSERT INTO COLECCIONES (Nombre,PrecioAlbum,FotoAlbum) VALUES ('" +
    nombre + "'," +
    precioAlbum + ",'" +
    foto +"')";
  connection.query(string, function (err, result, fields) {
    if (err) {
      response.send(err);
    }
  });

  connection.end();
});

app.post("/crearColeccion", function (req, res) {
  //TODO comprobar entrada??
  let nombre = req.body.nombre;
  let precioAlbum = req.body.precio;
  let foto = req.body.foto;

  let string = "INSERT INTO COLECCIONES (Nombre,PrecioAlbum,FotoAlbum) VALUES ('" +
    nombre + "'," +
    precioAlbum + ",'" +
    foto + "')";
  connection.query(string, function (err, result, fields) {
    if (err) {
      res.send(err);
    }
  });
});

app.post("/editarColeccion", function (req, res) {
  //TODO comprobar entrada??
  let nombre = req.body.nombre;
  let precioAlbum = req.body.precio;
  let foto = req.body.foto;
  let estado = req.body.estado;
  let coleccion = req.body.coleccion;

  let string =
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
  });
});

app.set('views', path.join(__dirname, '/dashboard/views'));
app.use("/dashboard/resources/colecciones/java/imagenes/", express.static(__dirname + "/dashboard/resources/colecciones/java/imagenes/"));
app.use("/dashboard/resources/media", express.static(__dirname + "/dashboard/resources/media"));

app.get("/dashboard/admin/editarColeccion", function (req, res) {
  //TODO comprobar entrada??
  let coleccion = req.query.nombreColeccion;

  let string = "SELECT * FROM CROMOS WHERE Coleccion = '" + coleccion + "'";
  connection.query(string, function (err, result, fields) {
    if (err) {
      throw err;
    }

    res.render('admin/Editar-Coleccion', {
      cromos: result
    });

  });

});

app.post("/crearCromo", function (req, res) {
  //TODO comprobar entrada??
  let nombre = req.body.nombre;
  let coleccion = req.body.coleccion;
  let rutaImagen = req.body.rutaImagen;
  let precio = req.body.precio;
  let cantidad = req.body.cantidad;
  let descripcion = req.body.descripcion;
  let datoInteresante = req.body.datoInteresante;
  let frecuencia = req.body.frecuencia;


  let string =
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
  });
});

app.post("/borrarCromo", function (req, res) {
  let nombre = req.body.nombre;
  let coleccion = req.body.coleccion;

  let string =
    "DELETE FROM CROMOS WHERE Nombre = '" + nombre +"' AND Coleccion='"+ coleccion +"'";
  try {
    connection.query(string, function (err, result, fields) {
      if (err) {
        throw err;
      }
    });
  } catch (error) {
    console.log(error);
  }
    res.send("El cromo ha sido borrado");
});

app.post("/borrarColeccion", function (req, res) {
  let nombre = req.body.nombre;
  
  let string =
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
  res.send("La coleccion ha sido borrada");

});

app.post("/comprarCromo", function (req, res) {
  //TODO comprobar entrada??
  let idCromo = req.body.idCromo;
  let idAlbum = req.body.idAlbum;
  //let idUser = req.session.user
  let idUser = "user";
  try {
    connection.query("SELECT * FROM CROMOS WHERE ID = ?", [idCromo], function (err, result) {
      if (err) {
        throw new Error("No existe ningun cromo con el ID indicado");
        //return;
      }
      let precio = result[0].Precio;
      let cantidad = result[0].Cantidad;
      if (cantidad <= 0) {
        throw new Error("No hay existencias de ese cromo");
        //return;
      }

      try {
        connection.query("SELECT * FROM CLIENTES WHERE User = ?", [idUser], function (err, result) {
          if (err) {
            throw new Error("No existe ningun cliente con ese nombre de usuario");
            //throw err;
            //return;
          }
  
          let puntos = result[0].Puntos;
          if (puntos < precio) {
            throw new Error("Puntos insuficientes para comprar el cromo");
            //return;
          }
  
          try {
            actualizarBBDDCromoComprado(idUser, idCromo, idAlbum, puntos, precio, cantidad);
          } catch (error) {
            console.log(error);
          }
  
        });
      } catch (error) {
        console.log(error);
      }
      
    });
  } catch (error) {
    console.log(error);
    //res.send(error);
  }

});


function actualizarBBDDCromoComprado(idUser,idCromo,idAlbum,puntos,precio,cantidad){
  connection.query("SELECT * FROM CROMOS_ALBUMES WHERE CromoID = ? AND AlbumID = ?", [idCromo, idAlbum], function (err, result) {
    if (result.length !== 0) {
      throw new Error("Cromo ya comprado");
      //return;
    }

    try{
      actualizarPuntosCliente(puntos-precio, idUser);
      actualizarCantidadCromo(--cantidad, idCromo);
      agregarCromoAAlbum(idCromo, idAlbum);
    }catch(err){
      console.log(err);
    }
  });
}

function agregarCromoAAlbum(idCromo, idAlbum){
  connection.query("INSERT INTO CROMOS_ALBUMES (CromoID, AlbumID) VALUES (?, ?)", [idCromo, idAlbum], function (err, result) {
    if (err) {
      throw new Error("No se ha podido agregar el cromo al album");
      //return;
    }

  });
}

function actualizarCantidadCromo(nuevaCantidad, idCromo){
  connection.query("UPDATE CROMOS SET Cantidad = ? WHERE ID = ?", [nuevaCantidad, idCromo], function (err, result) {
    if (err) {
      throw new Error("No se ha podido actualizar la cantidad de los cromos");
      //return;
    }

  });
}

function actualizarPuntosCliente(nuevosPuntos, idUser){
  connection.query("UPDATE CLIENTES SET Puntos = ? WHERE User = ?", [nuevosPuntos, idUser], function (err, result) {
    if (err) {
      throw new Error("No se han podido actualizar los puntos del cliente");
      //return;
    }

  });
}


app.post("/comprarAlbum", function (req, res) {
  //TODO comprobar entrada??
  let nombreColeccion = req.body.nombreColeccion;
  let idUser = "user";
  //let idUser = req.session.user
  try {
    connection.query("SELECT * FROM COLECCIONES WHERE Nombre = ?", [nombreColeccion], function (err, result) {
      if (err) {
        //TODO ERROR BBDD
        //throw err;
        let mal;
        return;
      }
      let precio = result[0].PrecioAlbum;
      let estado = result[0].Estado;
      if(estado ==="Agotado"){
        return;
      }
      connection.query("SELECT * FROM CLIENTES WHERE User = ?", [idUser], function (err, result) {
        if (err) {
          //TODO ERROR BBDD
          //throw err;
          return;
        }

        let puntos = result[0].Puntos;
        if (puntos < precio) {
          //TODO send post error
          //throw new Error("Puntos insuficientes");
          return;
        }
        connection.query("INSERT INTO ALBUMES (User, Coleccion) VALUES (?, ?)", [idUser, nombreColeccion], function (err, result) {
          if (err) {
            //TODO ERROR BBDD
            //throw err;
            return;
          }

        });
      });
    });
  } catch (error) {
    res.send(error);
  }

});
