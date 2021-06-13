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

          if(result.charAt(0)!=='<'){
            alert(result)
            document.location.href= "/dashboard/admin/editarColeccion?nombreColeccion=" + obtenerNombreColeccion();
          }else{
            $('body').html(result);
          }

        }
      );
}

function borrarColeccion(){
    let coleccion = obtenerNombreColeccion();
    $.post(
        "./borrarColeccion",
        { nombre: coleccion},
        function (result) {

          if(result.charAt(0)!=='<'){
            alert(result)
            document.location.href= "/dashboard/admin";
          }else{
            $('body').html(result);
          }
        }
      );
}