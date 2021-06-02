#Primero se borran las tablas por si existieran ya en la BBDD
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS USUARIOS;
DROP TABLE IF EXISTS CLIENTES;
DROP TABLE IF EXISTS ADMINISTRADORES;
DROP TABLE IF EXISTS ALBUMES;
DROP TABLE IF EXISTS COLECCIONES;
DROP TABLE IF EXISTS CROMOS;
DROP TABLE IF EXISTS CROMOS_ALBUMES;
DROP TABLE IF EXISTS PREGUNTAS;
DROP TABLE IF EXISTS ECUACIONES;

SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE USUARIOS(
    User VARCHAR(20),
    Password VARCHAR(50) NOT NULL,
    Nombre VARCHAR(20) NOT NULL,
    Apellidos VARCHAR(30) NOT NULL,
    Email VARCHAR(35) NOT NULL,
    Admin BOOLEAN DEFAULT FALSE, #TODO LO DEJO DE MOMENTO PARA QUE FUNCIONE LOGIN
	CONSTRAINT pk_usuarios PRIMARY KEY(User)
);

CREATE TABLE CLIENTES(
	User VARCHAR(20),
	Puntos INT DEFAULT 0,
    CONSTRAINT fk_clientes FOREIGN KEY(User) REFERENCES USUARIOS(User) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT pk_clientes PRIMARY KEY(User)
);

CREATE TABLE ADMINISTRADORES(
	User VARCHAR(20),
	CONSTRAINT fk_administradores FOREIGN KEY(User) REFERENCES USUARIOS(User) ON UPDATE CASCADE ON DELETE CASCADE,
	CONSTRAINT pk_administradores PRIMARY KEY(User)
);


CREATE TABLE COLECCIONES(
    	Nombre VARCHAR(20),
    	Estado ENUM('Activa','Agotada') DEFAULT 'Activa' NOT NULL, #No se si se puede poner not null aqui
        PrecioAlbum INT DEFAULT 1,
        FotoAlbum VARCHAR(50),
    	CONSTRAINT pk_colecciones PRIMARY KEY(Nombre)
);

CREATE TABLE ALBUMES(
        User VARCHAR(20),
        Coleccion VARCHAR(20),
    	Estado ENUM('No iniciada', 'Completada parcialmente','Finalizada') DEFAULT 'No iniciada',
        CONSTRAINT fk_coleccion FOREIGN KEY(Coleccion) REFERENCES COLECCIONES(Nombre)  ON UPDATE CASCADE ON DELETE CASCADE,
		CONSTRAINT fk_user FOREIGN KEY(User) REFERENCES CLIENTES(User)  ON UPDATE CASCADE ON DELETE CASCADE,
        CONSTRAINT pk_album PRIMARY KEY(User, Coleccion) #Teniendo en cuenta que un usuario solo pueda tener un album por coleccion
);

CREATE TABLE CROMOS(
    ID INT AUTO_INCREMENT,
	Nombre VARCHAR(40) NOT NULL,
    Coleccion VARCHAR(20),
    RutaImagen VARCHAR(100),
    Precio INT UNSIGNED NOT NULL,
    Cantidad SMALLINT UNSIGNED NOT NULL,
    Descripcion VARCHAR(400),
    DatoInteresante VARCHAR(100),
    Frecuencia ENUM('Comun','Raro','Excepcional') DEFAULT 'Comun',
    CONSTRAINT pk_cromos PRIMARY KEY(ID),
	CONSTRAINT fk_coleccionCromos FOREIGN KEY(Coleccion) REFERENCES COLECCIONES(Nombre)  ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT u_cromos UNIQUE(Nombre, Coleccion) #No puede haber dos cromos con el mismo nombre en la misma coleccion
);

CREATE TABLE CROMOS_ALBUMES(
	CromoID INT,
    AlbumUser VARCHAR(20),
    AlbumColeccion VARCHAR(20),
	CONSTRAINT fk_cromo FOREIGN KEY(CromoID) REFERENCES CROMOS(ID)  ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_album FOREIGN KEY(AlbumUser, AlbumColeccion) REFERENCES ALBUMES(User, Coleccion)  ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT pk_cromos_albumes PRIMARY KEY(CromoID, AlbumUser, AlbumColeccion)
);

CREATE TABLE PREGUNTAS(
    ID INT AUTO_INCREMENT,
	Pregunta VARCHAR(200) NOT NULL,
	Respuesta VARCHAR(200) NOT NULL,
    CONSTRAINT pk_preguntas PRIMARY KEY(ID)
);

CREATE TABLE ECUACIONES(
    ID INT AUTO_INCREMENT,
	Ecuacion VARCHAR(200) NOT NULL,
	x VARCHAR(20) NOT NULL,
    CONSTRAINT pk_ecuaciones PRIMARY KEY(ID)
);

#Insertar usuarios y admins
INSERT INTO `USUARIOS` (`User`, `Password`, `Nombre`, `Apellidos`, `Email`, `Admin`) VALUES 
	('admin', 'admin', 'Alejandro', 'Perez Fernandez', 'aperef04@estudiantes.unileon.es', '1'), 
	('user', 'user', 'Diego', 'Simon Gonzalez', 'dsimog01@estudiantes.unileon.es', '0');
INSERT INTO `ADMINISTRADORES` (`User`) VALUES ('admin');
INSERT INTO `CLIENTES` (`User`, `Puntos`) VALUES ('user', '100');

#INSERTAR LAS COLECCIONES JAVA Y C
INSERT INTO `COLECCIONES` (`Nombre`, `Estado`) VALUES ('Java', 'Activa'), ('C', 'Activa');

#INSERTAR LOS CROMOS DE LA COLECCION DE JAVA
INSERT INTO `CROMOS` (`ID`, `Nombre`, `Coleccion`, `RutaImagen`, `Precio`, `Cantidad`, `Descripcion`, `DatoInteresante`, `Frecuencia`) VALUES 
	(NULL, 'ArrayIndexOutOfBoundsException', 'Java', './resources/colecciones/java/imagenes/ArrayIndexOutOfBoundsException.JPG', '1', '3', 'Se lanza para indicar que se esta intentando acceder a una posicion fuera de un array. El indice elegido es negativo o mayor que la longitud del array', 'Parece que te falta algun elemento en el array amigo', 'Comun'),
	(NULL, 'ClassCastException', 'Java', './resources/colecciones/java/imagenes/ClassCastException.JPG', '2', '2', 'Se lanza para indicar que el código ha intentado convertir un objeto en una subclase de la que no es una instancia.', 'Parece ser que no eres muy de OOP', 'Raro'),
	(NULL, 'IllegalArgumentException', 'Java', './resources/colecciones/java/imagenes/IllegalArgumentException.JPG', '2', '2', 'Lanzada cuando a un metodo se le pasa un argumento ilegal o inapropiado', 'Creo que deberias conocer mejor los metodos que has programado campeon', 'Raro'),
	(NULL, 'IllegalStateException', 'Java', './resources/colecciones/java/imagenes/IllegalStateException.JPG', '3', '1', 'Lanzada cuando se llama a un método en un momento inapropiado o ilegal. Esto quiere decir que el entorno de Java no se encuentra en el estado adecuado para la ejecucion de este metodo', 'Que habras hecho para que te pase esto... Surrealista', 'Excepcional'),   
	(NULL, 'NullPointerException', 'Java', './resources/colecciones/java/imagenes/NullPointerException.JPG', '1', '3', 'Es una excepcion de tipo RuntimeException. En java, un valor especial null se puede asignar a un objeto. Se lanzara esta excepcion cuando la aplicacion trate de usar una referencia que apunte a null', 'No te preocupes, nos ha pasado a todos...', 'Comun'),
	(NULL, 'NumberFormatException', 'Java', './resources/colecciones/java/imagenes/NumberFormatException.JPG', '2', '2', 'Se lanza para alertar de que la aplicacion ha intentado convertir una cadena de texto a algun formato numerico, sin que esta cumpla las condiciones para poder hacerlo', 'Esto te pasa por no usar Python', 'Comun'),
	(NULL, 'AssertionError', 'Java', './resources/colecciones/java/imagenes/AssertionError.JPG', '1', '3', 'Se lanza al detectar un fallo en alguna afirmacion (assertion), generalmente en el codigo de test de la aplicacion', 'Por lo menos has hecho tests, ni tan mal', 'Comun'),
	(NULL, 'ExceptionInInitializerError', 'Java', './resources/colecciones/java/imagenes/ExceptionInInitializerError.JPG', '3', '1', 'Lanzada cuando ocurre alguna excepcion inesperada durante la inicializacion de una variable estatica o la evaluacion de un inicializador estatico', 'No me ha pasado en la vida', 'Excepcional'),    
	(NULL, 'StackOverflowError', 'Java', './resources/colecciones/java/imagenes/StackOverflowError.JPG', '1', '3', 'Lanzada cuando una aplicacion intenta acceder a recursos en memoria que no le han sido asignados. Los permisos concedidos a esta aplicacion por el sistema no permitiran dicho acceso', 'Este error da nombre a la Biblia de la informatica', 'Comun'),    
	(NULL, 'NoClassDefFoundError', 'Java', './resources/colecciones/java/imagenes/NoClassDefFoundError.JPG', '2', '2', 'Lanzada cuando la Java Virtual Machine no consigue encontrar un fichero .class concreto durante la ejecucion que si fue compilado previamente', 'Vuelve a compilar, crack!', 'Raro');    
 
 #INSERTAR LOS CROMOS DE LA COLECCCION DE C
INSERT INTO `CROMOS` (`ID`, `Nombre`, `Coleccion`, `RutaImagen`, `Precio`, `Cantidad`, `Descripcion`, `DatoInteresante`, `Frecuencia`) VALUES 
	(NULL, 'var_undeclared', 'C', './resources/colecciones/C/imagenes/var_undeclared.JPG', '1', '3', 'Mostrado cuando en el codigo desarrollado en C se utiliza una variable que no ha sido declarada previamente', 'Vayamos por partes... Lo primero es delcarar las variables!', 'Comun'),
	(NULL, 'implicit_declaration_of_function', 'C', './resources/colecciones/C/imagenes/implicit_declaration_of_function.JPG', '1', '3', 'Mostrado cuando en el codigo desarrollado en C se utiliza una funcion que no ha sido declarada previamente o que ha sido definida posterior a su llamada', 'Estas programando en C melon, esto no es Java', 'Comun'),
	(NULL, 'undefined_reference_to', 'C', './resources/colecciones/C/imagenes/undefined_reference_to.JPG', '2', '2', 'Mostrado cuando en el codigo desarrollado en C se utiliza una funcion propia de una libreria que no se ha indicado al compilar', 'Compilando en consola es lo que hay', 'Raro'),
	(NULL, 'conflicting_types_for', 'C', './resources/colecciones/C/imagenes/conflicting_types_for.JPG', '2', '2', 'Normalmente se muestra cuando en la declaracion de una funcion los parametros entran en conflicto con los de su definicion', 'Copia y pega, pones ; al final y listo!', 'Raro'),
	(NULL, 'segmentation_fault(core_dumped)', 'C', './resources/colecciones/C/imagenes/segmentation_fault(core_dumped).JPG', '1', '3', 'Mostrado cuando una aplicacion intenta acceder a recursos en memoria que no le han sido asignados. Los permisos concedidos a esta aplicacion por el sistema no permitiran dicho acceso', 'Cuidado con el core dump que la puedes liar parda', 'Comun'),    
	(NULL, 'integer_from_pointer_without_a_cast', 'C', './resources/colecciones/C/imagenes/integer_from_pointer_without_a_cast.JPG', '1', '3', 'Cuando se intenta utilizar un puntero en un contexto en el que se espera un entero, se muestra este error', 'Aunque lo diga el error, no tiene pinta de que castear sea la solucion', 'Comun'),    
	(NULL, 'dereferencing_pointer_to_incomplete_type', 'C', './resources/colecciones/C/imagenes/dereferencing_pointer_to_incomplete_type.JPG', '3', '1', 'Aparece cuando se utiliza un puntero a una estructura de datos para acceder a alguno de sus campos, pero el compilador no tiene información suficiente sobre esa estructura de datos', 'Puede que tengas la definicion de la estructura en otro fichero, espabila!', 'Excepcional'),  
	(NULL, 'unused_variable', 'C', './resources/colecciones/C/imagenes/unused_variable.JPG', '1', '3', 'Advertencia que se muestra cuando se ha declarado una variable que no se usa posteriormente', 'Si el programa funciona, borra sin miedo', 'Comun'),  
	(NULL, 'syntax_error_before_token', 'C', './resources/colecciones/C/imagenes/syntax_error_before_token.JPG', '1', '3', 'Hay algun error en algun punto anterior al token que se te indica, normalmente previo a ; o }', 'El error puede estar en cualquier sitio anterior al token, a buscar!', 'Comun'),  
	(NULL, 'invalid_operands', 'C', './resources/colecciones/C/imagenes/invalid_operands.JPG', '2', '2', 'Este error indica que se esta intentando operar con dos operandos que no son compatibles entre si para dicha operacion', 'Procura fijarte en los tipos de las variables que operas', 'Raro'); 
    
#INSERTAR LAS PREGUNTAS    
INSERT INTO `PREGUNTAS` (`Pregunta`, `Respuesta`) VALUES 
	('¿Cuántos minutos tiene un día?', '1440'),
	('¿Cuántas patas tiene una araña?', '8'),
	('¿Cuál es el río más caudaloso del mundo?', 'Amazonas'),
	('¿Cada cuántos años tenemos un año bisiesto?', '4'),
	('¿Cuántos meses tienen 28 días?', '12'),
	('¿Qué planeta es el más cercano al Sol?', 'Mercurio'),
	('¿Cuál es la montaña más alta en la actualidad?', 'El Everest'),
	('¿Que nombre tiene el sonido que hace una oveja?', 'Balido'),
	('Si alguien de España habla español, alguien de Portugal portugués y alguien de Francia francés. ¿Qué habla alguien de Brasil?', 'Portugués'),
	('¿Qué tipo de palabra es “aquí”?', 'Adverbio'),
	('Si decimos que estamos en el XIX/XI/MMXVIII, ¿de qué fecha estamos hablando?', '19/11/2018'),
	('¿A qué temperatura se congela el agua?', '0'),
	('¿A qué temperatura hierve y se evapora el agua?', '100'),
	('¿Cuál es el personaje más conocido de Miguel de Cervantes?', 'El Quijote'),
	('En música, ¿A cuántos tiempos equivale una blanca?', '2'),
	('¿Cuál es el país con mayor población del mundo?', 'China'),
	('¿Cuántas sílabas tiene la palabra abecedario?', '5'),
	('¿Cuál es la sílaba tónica de la palabra amanecer?', 'cer'),
	('¿Cuánto suman los ángulos de un triángulo?', '180'),
	('¿Cuánto suman los ángulos de un cuadrado?', '360'),
	('Si tengo 25 manzanas y le doy a mi mejor amigo el 25% de ellas. ¿Cuántas manzanas le he dado?', '5'),
	('Si en una carrera adelanto al que va segundo… ¿en qué posición estaba antes y en cuál estoy ahora?', 'Segundo'),
	('¿Cuántos kilos son una tonelada?', '1000'),
	('¿Cuál es la capital de Italia?', 'Roma'),
	('En un texto narrativo, ¿cómo se denomina al personaje principal?', 'Protagonista'),
	('En un texto narrativo, ¿cómo se denomina a aquel que se opone al protagonista?', 'Antagonista'),
	('¿Quién pintó la Mona Lisa?', 'Leonardo da Vinci');
    
#INSERTAR LAS ECUACIONES
INSERT INTO `ECUACIONES` (`Ecuacion`,`x`) VALUES 
	('2x-34=-20', '7'),        
	('4x+3=3x+5', '2'),        
	('x-8=2x-11', '3'),        
	('6x+6=4+8x', '1'),        
	('2x+3=3x', '3'),
	('4x+1=3x+3', '2'),        
	('1+8x=-16x+31', '5/4'),   
	('12x-48=-15x-30', '2/3'), 
	('10-5x=x-2', '2'),        
	('48-3x=5x', '6'),
	('10x-15=4x+27', '7'),     
	('3x+1=6x-8', '3'),        
	('47-3x=5+11x', '3'),      
	('30-9x=-7x+21', '9/2'),   
	('3x-10=2x+1', '11'),      
	('25-2x=3x-35', '12'),     
	('75-5x=3x+3', '9'),       
	('5+8x=2x+20', '5/2'),     
	('3(x-5)-2(x+4)=18', '41'),
	('60x-1=3(1+12x)', '1/6'), 
	('2x+3(2x-1)=x+67', '10'), 
	('3[2x-(3x+1)]=x+1', '-1'),
	('3[x+(14-x)]=2[x-(2x-21)]', '0'),
	('3(x+4)=4x+1', '11'),
	('2[3(x+5)-9]=-3(2x-4)', '0'),
	('2(3x+2)=4[2x-5(x-2)]', '2'),
	('3(12-x)-4x=2(11-x)+9x', '1');