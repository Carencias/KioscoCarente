function crearColeccion() {
  let nombre = document.getElementById("nombreColeccion").value;
  let precioAlbum = parseInt(document.getElementById("precioAlbum").value);
  let fotoAlbum = document.getElementById("foto").value;
  $.post(
    "http://localhost:8000/crearColeccion",
    { nombre: nombre, precio: precioAlbum, foto: fotoAlbum },
    function (result) {}
  );
}

function editarColeccion(){
  let nombre = document.getElementById("nombreColeccion").value; 
  let precioAlbum = parseInt(document.getElementById("precioAlbum").value);
  let estado = document.getElementById("estado").value;
  let fotoAlbum = document.getElementById("foto").value;
  $.post(
    "http://localhost:8000/editarColeccion",
    { nombre: nombre, precio: precioAlbum, foto: fotoAlbum, estado: estado },
    function (result) {
      alert(result)
    }
  );
}

function crearCromo(){
  let nombre = document.getElementById("textoNombreCromo").value; 
  let precio = parseInt(document.getElementById("textoPrecioCromo").value);
  let rutaImagen = document.getElementById("textoFotoCromo").value;
  //let coleccion = document.getElementById("foto").value;
  let cantidad = parseInt(document.getElementById("textoCantidadCromos").value); 
  let descripcion = document.getElementById("textoDescripcionCromo").value;
  let datoInteresante = document.getElementById("textoDatoInteresanteCromo").value;
  let frecuencia = parseInt(document.getElementById("textoFrecuenciaCromo").value);

  //TODO
  let coleccion = "C";
  $.post(
    "http://localhost:8000/crearCromo",
    { nombre: nombre, precio: precio, rutaImagen: rutaImagen, cantidad: cantidad,  descripcion: descripcion, datoInteresante: datoInteresante, frecuencia: frecuencia, coleccion: coleccion},
    function (result) {
    }
  );
}


