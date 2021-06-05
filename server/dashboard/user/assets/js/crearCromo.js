var formulario_crear_cromo = {}, cromo_crear_cromo = {};

function cargarDatosFomularioCrear(){
    formulario_crear_cromo.nombre = document.getElementById("formulario_crear_cromo_nombre").value;
    formulario_crear_cromo.imagen = document.getElementById("formulario_crear_cromo_imagen").value;
    formulario_crear_cromo.stock = document.getElementById("formulario_crear_cromo_stock").value;
    formulario_crear_cromo.descripcion = document.getElementById("formulario_crear_cromo_descripcion").value;
    formulario_crear_cromo.dato = document.getElementById("formulario_crear_cromo_dato").value;
    formulario_crear_cromo.frecuencia = document.getElementById("formulario_crear_cromo_frecuencia").value;
}

function cargarDatosCromoCrear(){
    inicializarCamposCromoCrear();
    cargarDatosFomularioCrear();
    cromo_crear_cromo.nombre.innerHTML = formulario_crear_cromo.nombre;
    cromo_crear_cromo.imagen.source = formulario_crear_cromo.imagen;
    cromo_crear_cromo.descripcion.innerHTML = formulario_crear_cromo.descripcion;
    cromo_crear_cromo.dato.innerHTML = "\""+formulario_crear_cromo.dato+"\"";
    cromo_crear_cromo.frecuencia.innerHTML = formulario_crear_cromo.frecuencia;
    let url = window.location.search;
    const urlParams = new URLSearchParams(url);
    cromo_crear_cromo.lenguaje.innerHTML = urlParams.get('nombreColeccion');
}

function inicializarCamposCromoCrear(){
    cromo_crear_cromo.nombre = document.getElementById("nombre_cromo");
    cromo_crear_cromo.imagen = document.getElementById("imagen_cromo");
    cromo_crear_cromo.descripcion = document.getElementById("descripcion_cromo");
    cromo_crear_cromo.dato = document.getElementById("dato_cromo");
    cromo_crear_cromo.frecuencia = document.getElementById("frecuencia_cromo");
    cromo_crear_cromo.lenguaje = document.getElementById("lenguaje_cromo");
}