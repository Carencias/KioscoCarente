"use strict";

const USUARIO_INCORRECTO = 0;
const USUARIO_ESTANDAR = 1;
const ADMIN = 2;

const express = require("express");
const app = express();
const port = 8000;
const mysql = require("mysql");
const session = require("express-session");
app.use(express.urlencoded());

app.use(express.json());
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "POST");
  next();
});

app.listen(port, () => {
  console.log(`Running ${port}`);
  pruebaBaseDatos();
});

const connection = mysql.createConnection({
  host: 'sistemas.casasoladerueda.es',
  port: 30000,
  user: "kiosko_carente",
  password: "carencias",
  database: "kiosko",
});

function pruebaBaseDatos() {
  connection.connect();
  connection.query(
    "SELECT * FROM ALBUMES ",
    function (err, result, fields) {
      if (err) throw err;
      console.log("The solution is: ", result[0].ID);
    }
  );

  connection.end();
}



//AUTENTICACION
app.use( session( {
  secret: 'carencias', //Firma secreta
  resave: false, //No se para que sirve 
  saveUninitialized: true, //La sesion se almacenara aunque este vacia
  cookie: { 
    //secure: true --> Requiere HTTPS
  },
  expires: new Date(Date.now() + (30 * 60 * 1000)) //miliseconds??
}));

var auth = function(req, res, next) {
  if (req.session && req.session.user==="prueba"/*&& req.session.user === "jose" && req.session.admin*/)
    return next();
  else
    return res.sendStatus(401);

};

//TODO
function comprobarCredenciales(username, password){
  return USUARIO_ESTANDAR;
}

app.get('/login', function (req, res) {
  if (!req.query.username || !req.query.password) {
    res.send('No se han rellenado ambos campos');
  } else {

    let tipoUsuario = comprobarCredenciales(req.query.username, req.query.password);

    if(tipoUsuario===USUARIO_ESTANDAR){
      req.session.user = req.query.username;
    }else if(tipoUsuario===ADMIN){
      req.session.user = req.query.username;
      req.session.admin = true;
    }else{
      res.send("Autenticación incorrecta"); //Unauthorized --> Usuario Incorrecto
    }

  }
});

app.get('/logout', function (req, res) {
  req.session.destroy();
});

//PARA REQUERIR LA AUTENTICACION AL ACCEDER A LAS PAGINAS HAY QUE AGREGAR auth COMO AQUI
app.get('/content', auth, function (req, res) {
  res.send("You can only see this after you've logged in.");
});


