function obtenerNombreColeccion() {
  if (typeof nombreColeccion === "undefined") {
    var urlParams = new URLSearchParams(window.location.search);
    nombreColeccion = urlParams.get("nombreColeccion");
  }

  return nombreColeccion;
}

function eliminarCromo(id){
    $.post(
        "./borrarCromo",
        { id: id},
        function (result) {
          alert(result)
        }
      );
}
function borrarColeccion(){
    let coleccion = obtenerNombreColeccion();
    $.post(
        "./borrarColeccion",
        { nombre: coleccion},
        function (result) {
          alert(result)
          document.location.href= "/dashboard/admin";
        }
      );
}