var formulario = {}, cromo = {};

function cargarDatosFomulario(){
    formulario.nombre = document.getElementById("nombre_cromo_formulario").value;
    formulario.imagen = document.getElementById("imagen_cromo_formulario").value;
    formulario.stock = document.getElementById("stock_cromo_formulario").value;
    formulario.descripcion = document.getElementById("descripcion_cromo_formulario").value;
    formulario.dato = document.getElementById("dato_cromo_formulario").value;
    formulario.frecuencia = document.getElementById("frecuencia_cromo_formulario").value;
}

function cargarDatosCromo(){
    console.log("cambiandoDatos");
    inicializarCamposCromo();
    cargarDatosFomulario();
    cromo.nombre.innerHTML = formulario.nombre;
    cromo.imagen.source = formulario.imagen;
    cromo.descripcion.innerHTML = formulario.descripcion;
    cromo.dato.innerHTML = "\""+formulario.dato+"\"";
    cromo.frecuencia.innerHTML = formulario.frecuencia;
    let url = window.location.search;
    const urlParams = new URLSearchParams(url);
    cromo.lenguaje.innerHTML = urlParams.get('nombreColeccion');
}

function inicializarCamposCromo(){
    cromo.nombre = document.getElementById("nombre_cromo");
    cromo.imagen = document.getElementById("imagen_cromo");
    cromo.descripcion = document.getElementById("descripcion_cromo");
    cromo.dato = document.getElementById("dato_cromo");
    cromo.frecuencia = document.getElementById("frecuencia_cromo");
    cromo.lenguaje = document.getElementById("lenguaje_cromo");
}