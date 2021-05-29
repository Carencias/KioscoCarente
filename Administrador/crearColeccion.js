const mysql = require("mysql");

const connection = mysql.createConnection({
    host: 'sistemas.casasoladerueda.es',
    port: 30000,
    user: "kiosko_carente",
    password: "carencias",
    database: "kiosko",
});


function crearColeccion(){

    let nombre = document.getElementById("nombreColeccion").value;
    let precioAlbum = parseInt(document.getElementById("precioAlbum").value); 

    //TODO comprobar entrada??

    connection.connect();
    connection.query(
        "INSERT INTO COLECCIONES ('Nombre','PrecioAlbum') VALUES ('" + nombre + "'," + precioAlbum + ")",
        function (err, result, fields) {
            if (err) throw err;
        }
    );

    connection.end();
}