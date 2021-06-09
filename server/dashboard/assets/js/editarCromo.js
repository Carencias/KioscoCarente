

const rutaImagen = document.getElementById("imagen_cromo").src;

function editarCromo() {

    setTimeout(() =>{

        document.getElementById("descripcion_cromo").innerHTML = document.getElementById("formulario_editar_cromo_descripcion").value;
        document.getElementById("dato_cromo").innerHTML = document.getElementById("formulario_editar_cromo_dato").value;
        document.getElementById("frecuencia_cromo").innerHTML = document.getElementById("formulario_editar_cromo_frecuencia").value;

    } , 300);

}

function editarImagen(file) {

    var input = file.target;

    var reader = new FileReader();
    reader.onload = function () {
        var dataURL = reader.result;
        var output = document.getElementById("imagen_cromo");
        output.src = dataURL;
    };
    reader.readAsDataURL(input.files[0]);
};

function restaurarImagen() {
    document.getElementById("imagen_cromo").setAttribute("src", rutaImagen);
};