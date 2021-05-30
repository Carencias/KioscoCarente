var nombreColeccion;

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

function editarColeccion() {
  let nombre = document.getElementById("nombreColeccion").value;
  let precioAlbum = parseInt(document.getElementById("precioAlbum").value);
  let estado = document.getElementById("estado").value;
  let fotoAlbum = document.getElementById("foto").value;
  let coleccion = obtenerNombreColeccion();
  $.post(
    "http://localhost:8000/editarColeccion",
    {
      nombre: nombre,
      precio: precioAlbum,
      foto: fotoAlbum,
      estado: estado,
      coleccion: coleccion,
    },
    function (result) {
      alert(result);
    }
  );
}

function crearCromo() {
  let nombre = document.getElementById("textoNombreCromo").value;
  let precio = parseInt(document.getElementById("textoPrecioCromo").value);
  let rutaImagen = document.getElementById("textoFotoCromo").value;
  let coleccion = obtenerNombreColeccion();
  let cantidad = parseInt(document.getElementById("textoCantidadCromos").value);
  let descripcion = document.getElementById("textoDescripcionCromo").value;
  let datoInteresante = document.getElementById(
    "textoDatoInteresanteCromo"
  ).value;
  let frecuencia = document.getElementById("textoFrecuenciaCromo").value;

  $.post(
    "http://localhost:8000/crearCromo",
    {
      nombre: nombre,
      precio: precio,
      rutaImagen: rutaImagen,
      cantidad: cantidad,
      descripcion: descripcion,
      datoInteresante: datoInteresante,
      frecuencia: frecuencia,
      coleccion: coleccion,
    },
    function (result) {}
  );
}

function obtenerNombreColeccion() {
  if (typeof nombreColeccion === "undefined") {
    var urlParams = new URLSearchParams(window.location.search);
    nombreColeccion = urlParams.get("nombreColeccion");
  }

  return nombreColeccion;
}

function cargarCromos() {
  let coleccion = obtenerNombreColeccion();
  let array;
  $.post(
    "http://localhost:8000/cargarCromos",
    { coleccion: coleccion },
    function (result) {
      pintarCromos(result);
    }
  );
}
function pintarCromos(vectorCromos) {
  let contador = 1;
  let string="";
  console.log(vectorCromos);
  for(let i =0;i< vectorCromos.length ; i++ ){
    let j = i+1;
    /*string += '<div class="u-align-left u-container-style u-list-item u-repeater-item u-shape-rectangle"> <div class="u-container-layout u-similar-container u-container-layout-' +1+ '">'+
        '<div class="u-clearfix u-custom-html u-custom-html-' + '1'+'">'+
        '<div class="cromo"> <div class="decoracion"> <div class="top"> <div class="nombreCromo">  <h3>'+ vectorCromos[i].Nombre +'</h3></div>'+
        '<div class="border"><img src="'+ vectorCromos[i].RutaImagen +'" alt="imagen"></div></div>'+
        '<div class="bottom"><p class="dato">"'+vectorCromos[i].DatoInteresante+'"</p>'+
        '<p class="descripcion">'+vectorCromos[i].Descripcion+'</p><ul><li>'+
        '<span class="frecuencia">Frecuencia</span>:'+ vectorCromos[i].Frecuencia+'</li><li>'+
        '<span class="lenguaje">Lenguaje</span>:'+ vectorCromos[i].Coleccion+'</li></ul><p class="info"></p></div></div></div></div>'+
        '<a href="" class="u-btn u-btn-round u-button-style u-palette-2-base u-radius-4 u-text-body-alt-color u-btn-'+'1' +'">'+
        '<span class="u-icon u-icon-'+'1'+'"><svg class="u-svg-content" viewBox="0 0 492.49284 492" style="width: 1em; height: 1em;">'+
        '<path d="m304.140625 82.472656-270.976563 270.996094c-1.363281 1.367188-2.347656 3.09375-2.816406 4.949219l-30.035156 120.554687c-.898438 3.628906.167969 7.488282 2.816406 10.136719 2.003906 2.003906 4.734375 3.113281 7.527344 3.113281.855469 0 1.730469-.105468 2.582031-.320312l120.554688-30.039063c1.878906-.46875 3.585937-1.449219 4.949219-2.8125l271-270.976562zm0 0"></path><path d="m476.875 45.523438-30.164062-30.164063c-20.160157-20.160156-55.296876-20.140625-75.433594 0l-36.949219 36.949219 105.597656 105.597656 36.949219-36.949219c10.070312-10.066406 15.617188-23.464843 15.617188-37.714843s-5.546876-27.648438-15.617188-37.71875zm0 0"></path></svg><img></span>&nbsp;EDITAR'+
        '</a> <a href="" class="u-btn u-btn-round u-button-style u-custom-color-4 u-radius-4 u-text-body-alt-color u-btn-'+'1'+'">'+
        '<span class="u-icon u-icon-'+'1'+'"><svg class="u-svg-content" viewBox="0 0 492.49284 492" style="width: 1em; height: 1em;"><path d="m304.140625 82.472656-270.976563 270.996094c-1.363281 1.367188-2.347656 3.09375-2.816406 4.949219l-30.035156 120.554687c-.898438 3.628906.167969 7.488282 2.816406 10.136719 2.003906 2.003906 4.734375 3.113281 7.527344 3.113281.855469 0 1.730469-.105468 2.582031-.320312l120.554688-30.039063c1.878906-.46875 3.585937-1.449219 4.949219-2.8125l271-270.976562zm0 0"></path><path d="m476.875 45.523438-30.164062-30.164063c-20.160157-20.160156-55.296876-20.140625-75.433594 0l-36.949219 36.949219 105.597656 105.597656 36.949219-36.949219c10.070312-10.066406 15.617188-23.464843 15.617188-37.714843s-5.546876-27.648438-15.617188-37.71875zm0 0"></path></svg><img></span>&nbsp;BORRAR'+
        '</a></div></div>';
    */

  }
  string+="";
  document.getElementById("zonaCromos").innerHTML = string;  
}
