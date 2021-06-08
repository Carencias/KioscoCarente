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
        FotoAlbum VARCHAR(200),
        Descripcion VARCHAR(400),
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
    RutaImagen VARCHAR(200),
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
INSERT INTO `COLECCIONES` (`Nombre`, `Estado`, `PrecioAlbum`, `FotoAlbum`, `Descripcion`) VALUES 
('Java', 'Activa','5','/dashboard/resources/colecciones/Java/java.JPEG', 'Coleccion de java, uno de los lenguajes de programacion mas importantes actualmente'), 
('C', 'Activa', '5', '/dashboard/resources/colecciones/C/C.JPG', 'Coleccion de C, el lenguaje por excelencia para programacion de Sistemas Operativos');

#INSERTAR LOS CROMOS DE LA COLECCION DE JAVA
INSERT INTO `CROMOS` (`ID`, `Nombre`, `Coleccion`, `RutaImagen`, `Precio`, `Cantidad`, `Descripcion`, `DatoInteresante`, `Frecuencia`) VALUES 
	(NULL, 'ArrayIndexOutOfBoundsException', 'Java', '/dashboard/resources/cromos/Java/ArrayIndexOutOfBoundsException.JPG', '1', '3', 'Se lanza para indicar que se esta intentando acceder a una posicion fuera de un array. El indice elegido es negativo o mayor que la longitud del array', 'Parece que te falta algun elemento en el array amigo', 'Comun'),
	(NULL, 'ClassCastException', 'Java', '/dashboard/resources/cromos/Java/ClassCastException.JPG', '2', '2', 'Se lanza para indicar que el código ha intentado convertir un objeto en una subclase de la que no es una instancia.', 'Parece ser que no eres muy de OOP', 'Raro'),
	(NULL, 'IllegalArgumentException', 'Java', '/dashboard/resources/cromos/Java/IllegalArgumentException.JPG', '2', '2', 'Lanzada cuando a un metodo se le pasa un argumento ilegal o inapropiado', 'Creo que deberias conocer mejor los metodos que has programado campeon', 'Raro'),
	(NULL, 'IllegalStateException', 'Java', '/dashboard/resources/cromos/Java/IllegalStateException.JPG', '3', '1', 'Lanzada cuando se llama a un método en un momento inapropiado o ilegal. Esto quiere decir que el entorno de Java no se encuentra en el estado adecuado para la ejecucion de este metodo', 'Que habras hecho para que te pase esto... Surrealista', 'Excepcional'),   
	(NULL, 'NullPointerException', 'Java', '/dashboard/resources/cromos/Java/NullPointerException.JPG', '1', '3', 'Es una excepcion de tipo RuntimeException. En Java, un valor especial null se puede asignar a un objeto. Se lanzara esta excepcion cuando la aplicacion trate de usar una referencia que apunte a null', 'No te preocupes, nos ha pasado a todos...', 'Comun'),
	(NULL, 'NumberFormatException', 'Java', '/dashboard/resources/cromos/Java/NumberFormatException.JPG', '2', '2', 'Se lanza para alertar de que la aplicacion ha intentado convertir una cadena de texto a algun formato numerico, sin que esta cumpla las condiciones para poder hacerlo', 'Esto te pasa por no usar Python', 'Comun'),
	(NULL, 'AssertionError', 'Java', '/dashboard/resources/cromos/Java/AssertionError.JPG', '1', '3', 'Se lanza al detectar un fallo en alguna afirmacion (assertion), generalmente en el codigo de test de la aplicacion', 'Por lo menos has hecho tests, ni tan mal', 'Comun'),
	(NULL, 'ExceptionInInitializerError', 'Java', '/dashboard/resources/cromos/Java/ExceptionInInitializerError.JPG', '3', '1', 'Lanzada cuando ocurre alguna excepcion inesperada durante la inicializacion de una variable estatica o la evaluacion de un inicializador estatico', 'No me ha pasado en la vida', 'Excepcional'),    
	(NULL, 'StackOverflowError', 'Java', '/dashboard/resources/cromos/Java/StackOverflowError.JPG', '1', '3', 'Lanzada cuando una aplicacion intenta acceder a recursos en memoria que no le han sido asignados. Los permisos concedidos a esta aplicacion por el sistema no permitiran dicho acceso', 'Este error da nombre a la Biblia de la informatica', 'Comun'),    
	(NULL, 'NoClassDefFoundError', 'Java', '/dashboard/resources/cromos/Java/NoClassDefFoundError.JPG', '2', '2', 'Lanzada cuando la Java Virtual Machine no consigue encontrar un fichero .class concreto durante la ejecucion que si fue compilado previamente', 'Vuelve a compilar, crack!', 'Raro');    
 
 #INSERTAR LOS CROMOS DE LA COLECCCION DE C
INSERT INTO `CROMOS` (`ID`, `Nombre`, `Coleccion`, `RutaImagen`, `Precio`, `Cantidad`, `Descripcion`, `DatoInteresante`, `Frecuencia`) VALUES 
	(NULL, 'var_undeclared', 'C', '/dashboard/resources/cromos/C/var_undeclared.JPG', '1', '3', 'Mostrado cuando en el codigo desarrollado en C se utiliza una variable que no ha sido declarada previamente', 'Vayamos por partes... Lo primero es delcarar las variables!', 'Comun'),
	(NULL, 'implicit_declaration_of_function', 'C', '/dashboard/resources/cromos/C/implicit_declaration_of_function.JPG', '1', '3', 'Mostrado cuando en el codigo desarrollado en C se utiliza una funcion que no ha sido declarada previamente o que ha sido definida posterior a su llamada', 'Estas programando en C melon, esto no es Java', 'Comun'),
	(NULL, 'undefined_reference_to', 'C', '/dashboard/resources/cromos/C/undefined_reference_to.JPG', '2', '2', 'Mostrado cuando en el codigo desarrollado en C se utiliza una funcion propia de una libreria que no se ha indicado al compilar', 'Compilando en consola es lo que hay', 'Raro'),
	(NULL, 'conflicting_types_for', 'C', '/dashboard/resources/cromos/C/conflicting_types_for.JPG', '2', '2', 'Normalmente se muestra cuando en la declaracion de una funcion los parametros entran en conflicto con los de su definicion', 'Copia y pega, pones ; al final y listo!', 'Raro'),
	(NULL, 'segmentation_fault(core_dumped)', 'C', '/dashboard/resources/cromos/C/segmentation_fault(core_dumped).JPG', '1', '3', 'Mostrado cuando una aplicacion intenta acceder a recursos en memoria que no le han sido asignados. Los permisos concedidos a esta aplicacion por el sistema no permitiran dicho acceso', 'Cuidado con el core dump que la puedes liar parda', 'Comun'),    
	(NULL, 'integer_from_pointer_without_a_cast', 'C', '/dashboard/resources/cromos/C/integer_from_pointer_without_a_cast.JPG', '1', '3', 'Cuando se intenta utilizar un puntero en un contexto en el que se espera un entero, se muestra este error', 'Aunque lo diga el error, no tiene pinta de que castear sea la solucion', 'Comun'),    
	(NULL, 'dereferencing_pointer_to_incomplete_type', 'C', '/dashboard/resources/cromos/C/dereferencing_pointer_to_incomplete_type.JPG', '3', '1', 'Aparece cuando se utiliza un puntero a una estructura de datos para acceder a alguno de sus campos, pero el compilador no tiene información suficiente sobre esa estructura de datos', 'Puede que tengas la definicion de la estructura en otro fichero, espabila!', 'Excepcional'),  
	(NULL, 'unused_variable', 'C', '/dashboard/resources/cromos/C/unused_variable.JPG', '1', '3', 'Advertencia que se muestra cuando se ha declarado una variable que no se usa posteriormente', 'Si el programa funciona, borra sin miedo', 'Comun'),  
	(NULL, 'syntax_error_before_token', 'C', '/dashboard/resources/cromos/C/syntax_error_before_token.JPG', '1', '3', 'Hay algun error en algun punto anterior al token que se te indica, normalmente previo a ; o }', 'El error puede estar en cualquier sitio anterior al token, a buscar!', 'Comun'),  
	(NULL, 'invalid_operands', 'C', '/dashboard/resources/cromos/C/invalid_operands.JPG', '2', '2', 'Este error indica que se esta intentando operar con dos operandos que no son compatibles entre si para dicha operacion', 'Procura fijarte en los tipos de las variables que operas', 'Raro'); 
    
#INSERTAR LAS PREGUNTAS    
INSERT INTO `PREGUNTAS` (`Pregunta`,`Respuesta`) VALUES
('¿Cuántos minutos tiene un día?', '1440'),
('¿Cuántas patas tiene una araña?', '8'),
('¿Cuál es el río más caudaloso del mundo?', 'Amazonas'),
('¿Cada cuántos años tenemos un año bisiesto?', '4'),    
('¿Cuántos meses tienen 28 días?', '12'),
('¿Qué planeta es el más cercano al Sol?', 'Mercurio'),
('¿Cuál es la montaña más alta en la actualidad?', 'Everest'),
('¿Que nombre tiene el sonido que hace una oveja?', 'Balido'),
('Si alguien de España habla español, alguien de Portugal portugués y alguien de Francia francés. ¿Qué habla alguien de Brasil?', 'Portugués'),
('¿Qué tipo de palabra es “aquí”?', 'Adverbio'),
('Si decimos que estamos en el XIX/XI/MMXVIII, ¿de qué fecha estamos hablando?', '19/11/2018'),
('¿A qué temperatura se congela el agua?', '0'),
('¿A qué temperatura hierve y se evapora el agua?', '100'),
('¿Cuál es el personaje más conocido de Miguel de Cervantes?', 'Don Quijote'),
('En música, ¿A cuántos tiempos equivale una blanca?', '2'),
('¿Cuál es el país con mayor población del mundo?', 'China'),
('¿Cuántas sílabas tiene la palabra abecedario?', '5'),
('¿Cuál es la sílaba tónica de la palabra amanecer?', 'cer'),
('¿Cuánto suman los ángulos de un triángulo?', '180'),
('¿Cuánto suman los ángulos de un cuadrado?', '360'),
('Si tengo 25 manzanas y le doy a mi mejor amigo el 20% de ellas. ¿Cuántas manzanas le he dado?', '5'),
('Si en una carrera adelanto al que va segundo… ¿en qué posición estaba antes y en cuál estoy 
ahora?', 'Segundo'),
('¿Cuántos kilos son una tonelada?', '1000'),
('¿Cuál es la capital de Italia?', 'Roma'),
('En un texto narrativo, ¿cómo se denomina al personaje principal?', 'Protagonista'),
('En un texto narrativo, ¿cómo se denomina a aquel que se opone al protagonista?', 'Antagonista'),
('¿Quién pintó la Mona Lisa?', 'Leonardo da Vinci'),
('Una señorita muy señoritada, vive bajo techo y siempre va mojada. ¿Qué cosita es?', 'Lengua'),
('París empieza con P y termina con…¿?', 'T'),
('Todos me quieren para descansar. Si ya te lo he dicho, no lo pienses más. ¿Qué soy?', 'Silla'),
('El padre de María tiene 5 hijas, que se llaman Nana, Nene, Nini, Nono y… ¿cómo se llama la quinta hijo?', 'María'),
('¿Qué es aquello que todo el mundo toma para nadie se lleva?', 'Sol'),
('¿De qué podemos llenar un barril para que pese menos?', 'Agujeros'),
('Si Pedro tiene seis manzanas, lava cuatro para comer y su hermano se come dos. ¿Cuántas manzanas tiene Pedro?', '4'),
('Tengo agujas pero no sé coser, tengo números pero no sé leer, las horas te doy. ¿Sabes quién soy?', 'Reloj'),
('¿Cuál es el animal que es dos veces animal?', 'Gato'),
('¿Cuál es el día más largo de la semana?', 'Miércoles'),
('¿Cuántas veces aparece la letra A entre cero y cien?', '0'),
('¿Quién es el único que nunca pierde un partido de fútbol?', 'Árbitro'),
('¿En qué momento se vuelve fruta una persona?', 'Cuando espera'),
('Dos hermanas, mentira no es. La una es mi tía, la otra no lo es. ¿Quién es?', 'Mi madre'),  
('¿Cuántos animales metió Moisés en el Arca?', 'Ninguno'),
('¿Antes de que el monte Everest fuera descubierto, cuál era la montaña más alta?', 'El Everest'),
('¿Cuál es la cosa que aunque se diga no puede ser nunca escuchada?', 'El silencio'),
('En una habitación hay cuatro esquinas, y en cada uno de ellos hay un gato. Cada uno de los gatos tiene enfrente a otros tres. ¿Cuántos gatos hay?', '4'),
('Si son las cinco menos cinco y sólo faltan cinco para las cinco… ¿Cuántas veces dije cinco sin contar el último cinco?', 'Cinco'),
('¿Es posible pinchar un globo sin que se escape el aire y sin que haga ruido?', 'Sí'),       
('Blanco es, la gallina lo pone, con aceite se fríe y con pan se come. ¿Qué es?', 'El huevo'),('Van hacia arriba, van hacia abajo, siempre de arriba a abajo y de abajo a arriba, pero nunca se mueven de su sitio. ¿De qué estamos hablando?', 'Escalera'),
('Algo tuyo que te pertenece, que casi no usas, pero que los demás utilizan casi a diario por 
ti. ¿Qué es?', 'Tu nombre'),
('¿Cómo se llama un polígono de 6 lados?', 'Hexágono'),
('¿Cómo se llama el conjunto de montañas que forman una unidad?', 'Cordillera'),
('¿Cómo se llaman los animales que solo se alimentan de vegetales y plantas?', 'Hervívoros'), 
('¿Es lo mismo multiplicar 3x4 que 4x3?', 'Sí');
    
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