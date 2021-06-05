function obtenerNombreColeccion() {
  if (typeof nombreColeccion === "undefined") {
    var urlParams = new URLSearchParams(window.location.search);
    nombreColeccion = urlParams.get("nombreColeccion");
  }

  return nombreColeccion;
}

function eliminarCromo(id){
    $.post(
        "http://localhost:8000/borrarCromo",
        { id: id},
        function (result) {
          alert(result)
        }
      );
}
function borrarColeccion(){
    let coleccion = obtenerNombreColeccion();
    $.post(
        "http://localhost:8000/borrarColeccion",
        { nombre: coleccion},
        function (result) {
          alert(result)
          document.location.href= "/dashboard/admin";
        }
      );
}