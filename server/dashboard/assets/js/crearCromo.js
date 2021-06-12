const rutaImagen = document.getElementById("imagen_cromo").src;

function editarCromo() {

    setTimeout(() =>{

        document.getElementById("nombre_cromo").innerHTML = document.getElementById("nombre").value;
        document.getElementById("descripcion_cromo").innerHTML = document.getElementById("descripcion").value;
        document.getElementById("dato_cromo").innerHTML = document.getElementById("dato").value;
        document.getElementById("frecuencia_cromo").innerHTML = document.getElementById("frecuencia").value;

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