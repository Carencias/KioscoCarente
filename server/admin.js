const express = require('express');
var app = express();
var mime = require('mime-types');
const fileUpload = require('express-fileupload');
var path = require('path');

const fs = require('fs');
const connection  = require('./database.js')

const router = express.Router();
app.use(fileUpload());
app.set('views', path.join(__dirname, '/dashboard/views'));


  router.get("/dashboard/admin/editarColeccion", function (req, res) {
    //TODO comprobar entrada??
  
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

  router.post("/dashboard/admin/editarColeccion", function (req, res) {
    //TODO comprobar entrada??
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
            //fs.mkdirSync(newParentPath, {recursive: true}); 
            res.send("No existe el directorio en el que se almacena la imagen");
            return;
            //Renombro carpeta
          } else {
            //fs.renameSync(oldParentPath, newParentPath);
  
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
  
  router.post("/dashboard/admin/crearColeccion", function (req, res) {
    //TODO comprobar entrada??
    let nombreColeccion = req.body.titulo_coleccion;
    let precioAlbum = req.body.precio_coleccion;
    let EDFile = req.files;
    //let foto = req.body.imagen_album;
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

  router.get("/dashboard/admin/editarCromo", function (req, res) {
    //TODO comprobar entrada??
  
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
  
  router.post("/dashboard/admin/editarCromo", function (req, res) {
    //TODO comprobar entrada??
  
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
                //fs.mkdirSync(newParentPath, {recursive: true}); 
                res.send("No existe el directorio en el que se almacena la imagen");
                return;
                //Renombro carpeta
              } else {
                //fs.renameSync(oldParentPath, newParentPath);
  
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

  router.get("/dashboard/admin/crearCromo", function (req, res) {

    res.render('admin/administradorCrearCromo', {
      lenguaje: req.query.nombreColeccion
    });
  
  });
  
  router.post("/dashboard/admin/crearCromo", function (req, res) {
    //TODO comprobar entrada??
    let nombre = req.body.nombre;
    let coleccion = req.query.nombreColeccion;
    //let rutaImagen = req.body.imagen_cromo_formulario;
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
  
  router.post("/dashboard/admin/borrarCromo", function (req, res) {
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

  function cromosComprados(idCromo){
    return ejecutarQueryBBDD("SELECT * FROM CROMOS_ALBUMES WHERE CromoID = ?", [idCromo], "Comprobar si cromo esta comprado", true);
  }

  function cromosCompradosColeccion(coleccion){
    return ejecutarQueryBBDD("SELECT * FROM CROMOS_ALBUMES WHERE AlbumColeccion = ?", [coleccion], "Comprobar si la coleccion tiene algun cromo esta comprado", true);
  }
  
  router.post("/dashboard/admin/borrarColeccion", function (req, res) {
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

  function ejecutarQueryBBDD(query, arrayDatos, operacion, devolverResultado) {
    return new Promise(function (resolve, reject) {
      connection.query(query, arrayDatos, function (err, result) {
        if (err) {
          //reject (Error("Operacion " + operacion + " no completada"));
          reject(err);
  
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

  
  function lanzarError(res, mensaje) {
    res.render(__dirname + '/error/views/error', {
      error: mensaje
    });
  }

module.exports = router;