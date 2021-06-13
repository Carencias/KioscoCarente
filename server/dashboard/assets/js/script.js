var arrayPalabras4 = [];
var arrayPalabras6 = [];
var casillas = [];
var valorCasillas = [];
var filasErroneas = [];
var letras = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];
var guardarDatos = false;
var pistas = 3;
var infoPasatiempo = {'valores': '', 'pistas': ''};
var soluciones = {'0': 'clan', '5':'pena', '6':'remato', '11':'torero'};
var colores = {'verde':'#A7F270', 'rojo':'#E66852'};

const removeAccents = (str) => {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  } 

/*FUNCIONES DE LA CARGA DEL DICCIONARIO Y DEMÁS INFORMACIÓN INICIAL */

function cargarDiccionario(){
    //let url = "https://ordenalfabetix.unileon.es/aw/diccionario.txt";
    let url = "https://diccionario.casasoladerueda.es/diccionario.txt";
    fetch(url)
        .then(response => response.text())
        .then((response) => {
            almacenarPalabras(response);
        })
        .catch(function(){
            e => console.log(`Error :  ${e}`)
        });
}

function almacenarPalabras(texto){
    let palabras = texto.split("\n");
    palabras.forEach(function(elemento, indice, array) {
        if(elemento.length == 4){
            arrayPalabras4.push(removeAccents(elemento));
        }else if(elemento.length == 6){
            arrayPalabras6.push(removeAccents(elemento));
        }
    });
    //console.log("Arrays cargados, ya se puede resolver");
    document.getElementById("botonResolver").disabled = false;
    document.getElementById("botonResolver").enabled = true;
}

function guardarReferenciasCasillas(){
    let fila = [];
    let id = "celda";
    for(var l=0; l<12; l++){
        if(l<6){
            for(var i=0; i<4; i++){
                fila.push(document.getElementById(id + letras[l] + i));
            }
            casillas.push(fila);
            fila = [];
        }else{
            for(var i=0; i<6; i++){
                fila.push(document.getElementById(id + letras[l] + i));
            }
            casillas.push(fila);
            fila = [];
        }
    }
}

/*FUNCIONES DE LA CARGA Y DESCARGA DE INFORMACIÓN GUARDADA */

function cargarInfoGuardada(){
    guardarReferenciasCasillas();
    if (typeof(Storage) !== "undefined") {
        let info = localStorage.getItem("pasatiempo");
        //console.log(JSON.parse(info));
        if(info !== null){
            infoPasatiempo = JSON.parse(info);
            document.getElementById("guardar").checked = true;
            guardarDatos = true;
            if(infoPasatiempo.valores.length > 0)
                cargarValoresCasillas(infoPasatiempo.valores);
            this.pistas = parseInt(infoPasatiempo.pistas);
            actualizarPistas();
        }else{
            document.getElementById("guardar").checked = false;
        }
    } else {
        alert("Sorry, your browser does not support Web Storage...");
    }
    //console.log("Quedan " + this.pistas + " pistas")
}

function cargarValoresCasillas(valores){
    let fila = [];
    valorCasillas = [];
    for(var l=0; l<12; l++){
        if(l<6){
            for(var i=0; i<4; i++){
                fila.push(valores[l][i]);
                casillas[l][i].value = valores[l][i];
            }
            valorCasillas.push(fila);
            fila = [];
        }else{
            for(var i=0; i<6; i++){
                fila.push(valores[l][i]);
                casillas[l][i].value = valores[l][i];
            }
            valorCasillas.push(fila);
            fila = [];
        }
    }
}

function almacenamiento(){
    let valor = document.getElementById("guardar");
    let guardarDatos = valor.checked;
    if(guardarDatos){
        alert("SE GUARDARÁ EL PROGRESO");
        guardarEnMemoria();
    }else{
        localStorage.removeItem("pasatiempo");
        alert("EL PROGRESO NO SE GUARDARÁ");
    }
}

function guardarEnMemoria(){
    
    infoPasatiempo.valores = valorCasillas;
    infoPasatiempo.pistas = pistas;
    
    if (typeof(Storage) !== "undefined") {
        localStorage.setItem("pasatiempo", JSON.stringify(infoPasatiempo));
    } else {
        alert("Sorry, your browser does not support Web Storage...");
    }
}

function guardarCasillas(){
    guardarValorCasillas();
    if(guardarDatos){
        guardarEnMemoria();
    }
}

function guardarValorCasillas(){
    let fila = [];
    valorCasillas = [];
    for(var l=0; l<12; l++){
        if(l<6){
            for(var i=0; i<4; i++){
                fila.push(casillas[l][i].value);
            }
            valorCasillas.push(fila);
            fila = [];
        }else{
            for(var i=0; i<6; i++){
                fila.push(casillas[l][i].value);
            }
            valorCasillas.push(fila);
            fila = [];
        }
    }
}

/*FUNCIONES DE PISTAS DE PALABRAS*/

function otorgarPista(){
    if(pistas>0){
        var letras = document.getElementById("letrasPista").value;
        letras = letras.toLowerCase();
        var palabras = [];
        var palabra = "";
        var coincide;

        arrayPalabras4.forEach(function(elemento, indice, array){
            coincide = true;
            palabra = elemento;
            console.log(palabra);
            for(var i=0; i<letras.length; i++){
                if(coincide && !palabra.includes(letras[i])){
                    coincide = false;
                }else{
                    palabra = eliminarCaracter(palabra,letras[i]);
                }
            }
            if(coincide) palabras.push(elemento);        
        });
        arrayPalabras6.forEach(function(elemento, indice, array){
            coincide = true;
            palabra = elemento;
            for(var i=0; i<letras.length; i++){
                if(coincide && !palabra.includes(letras[i])){
                    coincide = false;
                }else{
                    palabra = eliminarCaracter(palabra,letras[i]);
                }
            }
            if(coincide) palabras.push(elemento);
        });
        var texto = "";
        palabras.forEach(function(elemento, indice, array){
            texto = texto + elemento + "\n";
        });
        document.getElementById("pista").value = texto;
        this.pistas--;
        actualizarPistas();
    }else{
        alert("NO HAY MÁS PISTAS DISPONIBLES");
    }
    guardarEnMemoria();
}

function actualizarPistas(){
    let texto = document.getElementById("botonPista").innerText;
    let nuevo = "";
    nuevo = nuevo + texto.slice(0, 13) + pistas + ")";
    document.getElementById("botonPista").innerText = nuevo;
    if(pistas<1){
        document.getElementById("botonPista").enabled = false;
        document.getElementById("botonPista").disabled = true;
    }
}

function eliminarCaracter(palabra, car){
    let final = "";
    let indice = palabra.indexOf(car);
    //console.log(palabra + ", " + car + " -> " + indice);
    final = final + palabra.slice(0,indice);
    if(indice+1 < palabra.length){
        final = final + palabra.slice(indice+1, palabra.length);
    }
    return final;
}

/*FUNCIONES DE RESOLUCIÓN DEL TABLERO */

function resolverPasatiempo(){
    /*Comprobar si todas las palabras son correctas y si cumplen las condiciones de
    cambio de letra y permutacion */
    
    let palabra = "";
    let anterior = null;
    filasErroneas = [];
    var error = false;

    valorCasillas.forEach(function(elemento, indice, array){
        elemento.forEach(function(elemento, indice, array){
            palabra += elemento;
        });
        if(indice<6){
            if(error){
                if(indice == 4 && indice != 5) error = false;
                filasErroneas.push(indice);
            }else{
                if(!validarFila(palabra,indice,anterior)){
                    filasErroneas.push(indice);
                    error = true;
                }
            }
        }else{
            if(error && indice != 11){
                if(indice == 10) error = false;
                filasErroneas.push(indice);
            }else{
                if(!validarFila(palabra,indice,anterior)){
                    filasErroneas.push(indice);
                    error = true;
                }
            }
        }
        anterior = palabra;
        palabra = "";
    });
    if(filasErroneas.length == 0){
        $.ajax({
            type: "POST",
            url: "http://localhost:8000/dashboard/user/retoPasatiempo",
            success: function(data) {
                console.log('success');
                 $('body').html(data); 
                 document.getElementById("mensajeAcierto").style.display = "block";
                 document.getElementById("mensajeAcierto").style.marginTop = "10px";
            }
        
        });        
        //TODO FUNCION RESETEAR PASATIEMPO
    }
    //console.log("Filas erroneas: " + filasErroneas)
    corregirTablero();
}

function validarFila(palabra, indice, anterior){
    let solucion = null;
    palabra = palabra.toLowerCase();
    if(soluciones.hasOwnProperty(indice)){
        //console.log("Es de las incluidas --> " + indice);
        solucion = soluciones[indice];
        if(solucion == palabra){
            return true;
        }else{
            return false;
        }
    }else{
        //console.log("Es del usuario incluidas --> " + indice);
        if(existe(palabra)){
            if(validarCambio(palabra, anterior)){
                return true;
            }else{
                return false;
            }
        }else{
            return false;
        }
    }
}

function existe(palabra){
    if(palabra.length == 4){
        return arrayPalabras4.includes(palabra);
    }else if(palabra.length == 6){
        return arrayPalabras6.includes(palabra);
    }else{
        return false;
    }
}

function validarCambio(palabra, anterior){
    anterior = anterior.toLowerCase();
    //console.log("palabra > " + palabra + " - anterior > " + anterior);
    var longitud = palabra.length;
    let palabraMod, todasLetras;
    let ant;
    for(var i=0; i<longitud; i++){
        ant = anterior;
        palabraMod = eliminarCaracter(palabra, palabra.charAt(i));
        //console.log("palabra-1 letra --> " + palabraMod);
        todasLetras = true
        //anterior.slice(0,i) + anterior.slice(i+1,longitud);
        for(var j=0; j<longitud-1; j++){
            //console.log(palabraMod[j]);
            //console.log(ant);
            if(!ant.includes(palabraMod[j])){
                todasLetras = false;
            }else{
                ant = eliminarCaracter(ant, palabraMod[j]);
            }
           // console.log("ant --> " + ant);
            //console.log(todasLetras);
        }
        if(todasLetras) return true;
    }
    return false;
}

function corregirTablero(){
    //console.log(casillas);
    casillas.forEach(function(elemento, indice, array){
        //console.log(elemento);
        var funcion = pintarVerde;
        if(filasErroneas.includes(indice))
            funcion = pintarRojo;
        elemento.forEach(function(elemento, indice, array){
            //console.log(elemento);
            funcion(elemento);
        });
    });
}

function pintarVerde(elemento){
    //console.log(elemento);
    elemento.style.backgroundColor=colores.verde;
}

function pintarRojo(elemento){
    //console.log(elemento);
    elemento.style.backgroundColor=colores.rojo;
}

//FUNCIONES NUEVAS
function vaciarTablero(){
    let fila = [];
    valorCasillas = [];
    for(var l=0; l<12; l++){
        if(l<6){
            for(var i=0; i<4; i++){
                fila.push("");
                casillas[l][i].value = "";
            }
            valorCasillas.push(fila);
            fila = [];
        }else{
            for(var i=0; i<6; i++){
                fila.push("");
                casillas[l][i].value = "";
            }
            valorCasillas.push(fila);
            fila = [];
        }
    }
    guardarEnMemoria();
}