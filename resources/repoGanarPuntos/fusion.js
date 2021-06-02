function preguntasToTxt(){
    let ruta = "./preguntas.json";
    const json = require(ruta);
    
    console.log("INSERT INTO `PREGUNTAS` (`Pregunta`,`Respuesta`) VALUES");

    for (const pregunta in json){
        console.log("('"+pregunta+"', '"+json[pregunta]+"'),");
    }
}

function ecuacionesToTxt(){
    let ruta = "./ecuaciones.json";
    const json = require(ruta);
    
    console.log("INSERT INTO `ECUACIONES` (`Ecuacion`,`Respuesta`) VALUES");

    for (const ecuacion in json){
        console.log("('"+ecuacion+"', '"+json[ecuacion]+"'),");
    }
}

preguntasToTxt();
//ecuacionesToTxt();