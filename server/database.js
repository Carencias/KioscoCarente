const mysql = require("mysql");
const connection = mysql.createConnection({
    host: "sistemas.casasoladerueda.es",
    port: 30000,
    user: "kiosko_carente",
    password: "carencias",
    database: "kiosko",
  });

module.exports = connection;