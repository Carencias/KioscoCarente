function crearColeccion() {
  let nombre = document.getElementById("nombreColeccion").value;
  let precioAlbum = parseInt(document.getElementById("precioAlbum").value);
  $.post(
    "http://localhost:8000/crearColeccion",
    { nombre: nombre, precio: precioAlbum },
    function (result) {}
  );
}
