"use strict";

const USUARIO_INCORRECTO = -1;
const USUARIO_ESTANDAR = 0;
const ADMIN = 1;

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
    //pruebaBaseDatos();
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
app.use(session({
    secret: 'carencias', //Firma secreta
    resave: false, //No se para que sirve 
    saveUninitialized: false, //La sesion no se almacena si está vacia
    cookie: {
        //secure: true --> Requiere HTTPS
    },
    expires: new Date(Date.now() + (30 * 60 * 1000)) //miliseconds??
}));

//Autenticación comun
var auth = function (req, res, next) {
    if (req.session && req.session.userType !== undefined)
        return next();
    else
        return res.sendStatus(401);

};

var userAuth = function (req, res, next) {
    if (req.session && req.session.userType === USUARIO_ESTANDAR ){
        console.log(req.session);
        console.log(req.session.userType);
        return next();
    } else{
        return res.sendStatus(401);
    }

};


var adminAuth = function (req, res, next) {
    if (req.session && req.session.userType === ADMIN)
        return next();
    else
        return res.sendStatus(401);

};

//TODO
//Permite acceder a los recursos de una carpeta. El primer parametro es la ruta virtual sobre la que se monta, el segundo el real.
app.use('/', express.static(__dirname + '/webpage'));
app.use('/dashboard/admin', adminAuth);
app.use('/dashboard/user', userAuth);
app.use('/dashboard/user', express.static(__dirname + '/dashboard/user'));
app.use('/dashboard/admin', express.static(__dirname + '/dashboard/admin'));

function comprobarCredenciales(req, res) {
    let username = req.body.username;
    let password = req.body.password;

    connection.query("SELECT User, Password, Admin FROM USUARIOS WHERE User='" + username + "'", function (err, result) {

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
    });
}

app.post('/login', function (req, res) {

    //Comprobar si ya está logueado
    console.log(req.session);
    if (checkSesionIniciada(req)) {
        res.redirect("/dashboard");
    } else {
        if (!req.body.username || !req.body.password) {
            //TODO Con javascript del lado del cliente se avisa si no introduce usuario o contraseña
            res.send('Usuario o contraseña no introducido' + req.body.username + req.body.password);
        } else {
            comprobarCredenciales(req, res);
        }
    }
});

//Dashboard es la URL sobre la que se mostrará el area privada del usuario normal
app.get('/dashboard', function (req, res) {
    if (checkSesionIniciada(req)) {
        abrirSesionIniciada(req, res);
    } else {
        res.redirect("/login");
    }
});

app.get('/login', function (req, res) {
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
            res.redirect("/dashboard/admin");
        }
    }
}
app.get('/dashboard/logout', auth, function (req, res) {
    req.session.destroy();
    res.redirect("/index.html");
    //res.send("Sesión Finalizada correctamente");
});

//PARA REQUERIR LA AUTENTICACION AL ACCEDER A LAS PAGINAS HAY QUE AGREGAR auth COMO AQUI
app.get('/content', auth, function (req, res) {
    res.send("You can only see this after you've logged in.");
});