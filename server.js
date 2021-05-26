"use strict";
const express = require("express");
const app = express();
const port = 8000;
const mysql = require("mysql");
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
  //host: "sistemas.casasoladerueda.es:30000",
  host: 'sistemas.casasoladerueda.es',
  port: 30000,
  user: "kiosco_carente",
  password: "carencias",
  database: "kiosko",
});

function pruebaBaseDatos() {
  connection.connect();
  connection.query(
    "SELECT * FROM ALBUMES ",
    function (err, result, fields) {
      if (err) throw err;
      console.log("The solution is: ", result[0]);
    }
  );

  connection.end();
}
