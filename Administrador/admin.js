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
  console.log(estado)
  $.post(
    "http://localhost:8000/editarColeccion",
    { nombre: nombre, precio: precioAlbum, foto: fotoAlbum, estado: estado },
    function (result) {
      alert(result)
    }
  );
}


