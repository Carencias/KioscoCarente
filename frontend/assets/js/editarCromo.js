var formulario_editar_cromo = {}, cromo_editar_cromo = {};

function cargarDatosFomularioEditarCromo(){
    formulario_editar_cromo.nombre = document.getElementById("formulario_editar_cromo_nombre").value;
    formulario_editar_cromo.imagen = document.getElementById("formulario_editar_cromo_imagen").value;
    formulario_editar_cromo.stock = document.getElementById("formulario_editar_cromo_stock").value;
    formulario_editar_cromo.descripcion = document.getElementById("formulario_editar_cromo_descripcion").value;
    formulario_editar_cromo.dato = document.getElementById("formulario_editar_cromo_dato").value;
    formulario_editar_cromo.frecuencia = document.getElementById("formulario_editar_cromo_frecuencia").value;
}

function cargarDatosCromoEditar(){
    inicializarCamposCromoEditar();
    cargarDatosFomularioEditarCromo();
    cromo_editar_cromo.nombre.innerHTML = formulario_editar_cromo.nombre;
    cromo_editar_cromo.imagen.source = formulario_editar_cromo.imagen;
    cromo_editar_cromo.descripcion.innerHTML = formulario_editar_cromo.descripcion;
    cromo_editar_cromo.dato.innerHTML = "\""+formulario_editar_cromo.dato+"\"";
    cromo_editar_cromo.frecuencia.innerHTML = formulario_editar_cromo.frecuencia;
    let url = window.location.search;
    const urlParams = new URLSearchParams(url);
    cromo_editar_cromo.lenguaje.innerHTML = urlParams.get('nombreColeccion');
}

function inicializarCamposCromoEditar(){
    cromo_editar_cromo.nombre = document.getElementById("nombre_cromo");
    cromo_editar_cromo.imagen = document.getElementById("imagen_cromo");
    cromo_editar_cromo.descripcion = document.getElementById("descripcion_cromo");
    cromo_editar_cromo.dato = document.getElementById("dato_cromo");
    cromo_editar_cromo.frecuencia = document.getElementById("frecuencia_cromo");
    cromo_editar_cromo.lenguaje = document.getElementById("lenguaje_cromo");
}