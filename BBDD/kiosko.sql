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
    Password VARCHAR(200) NOT NULL,
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
	Respuesta VARCHAR(20) NOT NULL,
    CONSTRAINT pk_ecuaciones PRIMARY KEY(ID)
);

#Insertar usuarios y admins
INSERT INTO `USUARIOS` (`User`, `Password`, `Nombre`, `Apellidos`, `Email`, `Admin`) VALUES 
	('admin', '$2b$10$u8tuN78/XTW22g2NcnpqbOqzBlPCtscu3uzIURZdANGUd1mCnF3jy', 'Alejandro', 'Perez Fernandez', 'aperef04@estudiantes.unileon.es', '1'), 
	('user', '$2b$10$xHtwTdexNi3vSqTFpwI.fOuFhNY.1t2alogTyANLDeu6KE9zki3YW', 'Diego', 'Simon Gonzalez', 'dsimog01@estudiantes.unileon.es', '0'),
    ('user2', '$2b$10$irkbizuts8hDwwN8qXWSr.a.CAnbUPaTRxPpMbkfxktRBV4VfG7kW', 'Marcos','Ferreras Rodriguez', 'mferrr03@estudiantes.unileon.es', '0');
INSERT INTO `ADMINISTRADORES` (`User`) VALUES ('admin');
INSERT INTO `CLIENTES` (`User`, `Puntos`) VALUES ('user', '40'), ('user2', '40');

#INSERTAR LAS COLECCIONES JAVA Y C
INSERT INTO `COLECCIONES` (`Nombre`, `Estado`, `PrecioAlbum`, `FotoAlbum`, `Descripcion`) VALUES 
('Java', 'Activa','5','/dashboard/resources/colecciones/Java/java.JPEG', 'Coleccion de java, uno de los lenguajes de programacion mas importantes actualmente'), 
('C', 'Activa', '5', '/dashboard/resources/colecciones/C/C.JPG', 'Coleccion de C, el lenguaje por excelencia para programacion de Sistemas Operativos');

#INSERTAR LOS CROMOS DE LA COLECCION DE JAVA
INSERT INTO `CROMOS` (`ID`, `Nombre`, `Coleccion`, `RutaImagen`, `Precio`, `Cantidad`, `Descripcion`, `DatoInteresante`, `Frecuencia`) VALUES 
	(NULL, 'ArrayIndexOutOfBoundsException', 'Java', '/dashboard/resources/cromos/Java/ArrayIndexOutOfBoundsException.JPG', '5', '10', 'Se lanza para indicar que se esta intentando acceder a una posicion fuera de un array. El indice elegido es negativo o mayor que la longitud del array', 'Parece que te falta algun elemento en el array amigo', 'Comun'),
	(NULL, 'ClassCastException', 'Java', '/dashboard/resources/cromos/Java/ClassCastException.JPG', '8', '8', 'Se lanza para indicar que el c??digo ha intentado convertir un objeto en una subclase de la que no es una instancia.', 'Parece ser que no eres muy de OOP', 'Raro'),
	(NULL, 'IllegalArgumentException', 'Java', '/dashboard/resources/cromos/Java/IllegalArgumentException.JPG', '8', '8', 'Lanzada cuando a un metodo se le pasa un argumento ilegal o inapropiado', 'Creo que deberias conocer mejor los metodos que has programado campeon', 'Raro'),
	(NULL, 'IllegalStateException', 'Java', '/dashboard/resources/cromos/Java/IllegalStateException.JPG', '10', '5', 'Lanzada cuando se llama a un m??todo en un momento inapropiado o ilegal. Esto quiere decir que el entorno de Java no se encuentra en el estado adecuado para la ejecucion de este metodo', 'Que habras hecho para que te pase esto... Surrealista', 'Excepcional'),   
	(NULL, 'NullPointerException', 'Java', '/dashboard/resources/cromos/Java/NullPointerException.JPG', '5', '10', 'Es una excepcion de tipo RuntimeException. En Java, un valor especial null se puede asignar a un objeto. Se lanzara esta excepcion cuando la aplicacion trate de usar una referencia que apunte a null', 'No te preocupes, nos ha pasado a todos...', 'Comun'),
	(NULL, 'NumberFormatException', 'Java', '/dashboard/resources/cromos/Java/NumberFormatException.JPG', '8', '8', 'Se lanza para alertar de que la aplicacion ha intentado convertir una cadena de texto a algun formato numerico, sin que esta cumpla las condiciones para poder hacerlo', 'Esto te pasa por no usar Python', 'Comun'),
	(NULL, 'AssertionError', 'Java', '/dashboard/resources/cromos/Java/AssertionError.JPG', '5', '10', 'Se lanza al detectar un fallo en alguna afirmacion (assertion), generalmente en el codigo de test de la aplicacion', 'Por lo menos has hecho tests, ni tan mal', 'Comun'),
	(NULL, 'ExceptionInInitializerError', 'Java', '/dashboard/resources/cromos/Java/ExceptionInInitializerError.JPG', '10', '5', 'Lanzada cuando ocurre alguna excepcion inesperada durante la inicializacion de una variable estatica o la evaluacion de un inicializador estatico', 'No me ha pasado en la vida', 'Excepcional'),    
	(NULL, 'StackOverflowError', 'Java', '/dashboard/resources/cromos/Java/StackOverflowError.JPG', '5', '10', 'Lanzada cuando una aplicacion intenta acceder a recursos en memoria que no le han sido asignados. Los permisos concedidos a esta aplicacion por el sistema no permitiran dicho acceso', 'Este error da nombre a la Biblia de la informatica', 'Comun'),    
	(NULL, 'NoClassDefFoundError', 'Java', '/dashboard/resources/cromos/Java/NoClassDefFoundError.JPG', '8', '8', 'Lanzada cuando la Java Virtual Machine no consigue encontrar un fichero .class concreto durante la ejecucion que si fue compilado previamente', 'Vuelve a compilar, crack!', 'Raro');    
 
 #INSERTAR LOS CROMOS DE LA COLECCCION DE C
INSERT INTO `CROMOS` (`ID`, `Nombre`, `Coleccion`, `RutaImagen`, `Precio`, `Cantidad`, `Descripcion`, `DatoInteresante`, `Frecuencia`) VALUES 
	(NULL, 'var_undeclared', 'C', '/dashboard/resources/cromos/C/var_undeclared.JPG', '5', '10', 'Mostrado cuando en el codigo desarrollado en C se utiliza una variable que no ha sido declarada previamente', 'Vayamos por partes... Lo primero es delcarar las variables!', 'Comun'),
	(NULL, 'implicit_declaration_of_function', 'C', '/dashboard/resources/cromos/C/implicit_declaration_of_function.JPG', '5', '10', 'Mostrado cuando en el codigo desarrollado en C se utiliza una funcion que no ha sido declarada previamente o que ha sido definida posterior a su llamada', 'Estas programando en C melon, esto no es Java', 'Comun'),
	(NULL, 'undefined_reference_to', 'C', '/dashboard/resources/cromos/C/undefined_reference_to.JPG', '8', '8', 'Mostrado cuando en el codigo desarrollado en C se utiliza una funcion propia de una libreria que no se ha indicado al compilar', 'Compilando en consola es lo que hay', 'Raro'),
	(NULL, 'conflicting_types_for', 'C', '/dashboard/resources/cromos/C/conflicting_types_for.JPG', '8', '8', 'Normalmente se muestra cuando en la declaracion de una funcion los parametros entran en conflicto con los de su definicion', 'Copia y pega, pones ; al final y listo!', 'Raro'),
	(NULL, 'segmentation_fault(core_dumped)', 'C', '/dashboard/resources/cromos/C/segmentation_fault(core_dumped).JPG', '5', '10', 'Mostrado cuando una aplicacion intenta acceder a recursos en memoria que no le han sido asignados. Los permisos concedidos a esta aplicacion por el sistema no permitiran dicho acceso', 'Cuidado con el core dump que la puedes liar parda', 'Comun'),    
	(NULL, 'integer_from_pointer_without_a_cast', 'C', '/dashboard/resources/cromos/C/integer_from_pointer_without_a_cast.JPG', '5', '10', 'Cuando se intenta utilizar un puntero en un contexto en el que se espera un entero, se muestra este error', 'Aunque lo diga el error, no tiene pinta de que castear sea la solucion', 'Comun'),    
	(NULL, 'dereferencing_pointer_to_incomplete_type', 'C', '/dashboard/resources/cromos/C/dereferencing_pointer_to_incomplete_type.JPG', '10', '5', 'Aparece cuando se utiliza un puntero a una estructura de datos para acceder a alguno de sus campos, pero el compilador no tiene informaci??n suficiente sobre esa estructura de datos', 'Puede que tengas la definicion de la estructura en otro fichero, espabila!', 'Excepcional'),  
	(NULL, 'unused_variable', 'C', '/dashboard/resources/cromos/C/unused_variable.JPG', '5', '10', 'Advertencia que se muestra cuando se ha declarado una variable que no se usa posteriormente', 'Si el programa funciona, borra sin miedo', 'Comun'),  
	(NULL, 'syntax_error_before_token', 'C', '/dashboard/resources/cromos/C/syntax_error_before_token.JPG', '5', '10', 'Hay algun error en algun punto anterior al token que se te indica, normalmente previo a ; o }', 'El error puede estar en cualquier sitio anterior al token, a buscar!', 'Comun'),  
	(NULL, 'invalid_operands', 'C', '/dashboard/resources/cromos/C/invalid_operands.JPG', '8', '8', 'Este error indica que se esta intentando operar con dos operandos que no son compatibles entre si para dicha operacion', 'Procura fijarte en los tipos de las variables que operas', 'Raro'); 
    
   
INSERT INTO `ALBUMES` (`User`, `Coleccion`, `Estado`) VALUES
	('user', 'C', 'Completada parcialmente');   
   
INSERT INTO `CROMOS_ALBUMES` (`CromoID`, `AlbumUser`, `AlbumColeccion`) VALUES
	(11, 'user', 'C'),
	(12, 'user', 'C'),
	(13, 'user', 'C'),
	(14, 'user', 'C'),
	(15, 'user', 'C'),
	(16, 'user', 'C'),
	(17, 'user', 'C'),
	(18, 'user', 'C'),
	(19, 'user', 'C');    
    
#INSERTAR LAS PREGUNTAS    
INSERT INTO `PREGUNTAS` (`Pregunta`,`Respuesta`) VALUES
('??Cu??ntos minutos tiene un d??a?', '1440'),
('??Cu??ntas patas tiene una ara??a?', '8'),
('??Cu??l es el r??o m??s caudaloso del mundo?', 'Amazonas'),
('??Cada cu??ntos a??os tenemos un a??o bisiesto?', '4'),    
('??Cu??ntos meses tienen 28 d??as?', '12'),
('??Qu?? planeta es el m??s cercano al Sol?', 'Mercurio'),
('??Cu??l es la monta??a m??s alta en la actualidad?', 'Everest'),
('??Que nombre tiene el sonido que hace una oveja?', 'Balido'),
('Si alguien de Espa??a habla espa??ol, alguien de Portugal portugu??s y alguien de Francia franc??s. ??Qu?? habla alguien de Brasil?', 'Portugu??s'),
('??Qu?? tipo de palabra es ???aqu??????', 'Adverbio'),
('Si decimos que estamos en el XIX/XI/MMXVIII, ??de qu?? fecha estamos hablando?', '19/11/2018'),
('??A qu?? temperatura se congela el agua?', '0'),
('??A qu?? temperatura hierve y se evapora el agua?', '100'),
('??Cu??l es el personaje m??s conocido de Miguel de Cervantes?', 'Don Quijote'),
('En m??sica, ??A cu??ntos tiempos equivale una blanca?', '2'),
('??Cu??l es el pa??s con mayor poblaci??n del mundo?', 'China'),
('??Cu??ntas s??labas tiene la palabra abecedario?', '5'),
('??Cu??l es la s??laba t??nica de la palabra amanecer?', 'cer'),
('??Cu??nto suman los ??ngulos de un tri??ngulo?', '180'),
('??Cu??nto suman los ??ngulos de un cuadrado?', '360'),
('Si tengo 25 manzanas y le doy a mi mejor amigo el 20% de ellas. ??Cu??ntas manzanas le he dado?', '5'),
('Si en una carrera adelanto al que va segundo??? ??en qu?? posici??n estaba antes y en cu??l estoy ahora?', 'Segundo'),
('??Cu??ntos kilos son una tonelada?', '1000'),
('??Cu??l es la capital de Italia?', 'Roma'),
('En un texto narrativo, ??c??mo se denomina al personaje principal?', 'Protagonista'),
('En un texto narrativo, ??c??mo se denomina a aquel que se opone al protagonista?', 'Antagonista'),
('??Qui??n pint?? la Mona Lisa?', 'Leonardo da Vinci'),
('Una se??orita muy se??oritada, vive bajo techo y siempre va mojada. ??Qu?? cosita es?', 'Lengua'),
('Par??s empieza con P y termina con??????', 'T'),
('Todos me quieren para descansar. Si ya te lo he dicho, no lo pienses m??s. ??Qu?? soy?', 'Silla'),
('El padre de Mar??a tiene 5 hijas, que se llaman Nana, Nene, Nini, Nono y??? ??c??mo se llama la quinta hijo?', 'Mar??a'),
('??Qu?? es aquello que todo el mundo toma para nadie se lleva?', 'Sol'),
('??De qu?? podemos llenar un barril para que pese menos?', 'Agujeros'),
('Si Pedro tiene seis manzanas, lava cuatro para comer y su hermano se come dos. ??Cu??ntas manzanas tiene Pedro?', '4'),
('Tengo agujas pero no s?? coser, tengo n??meros pero no s?? leer, las horas te doy. ??Sabes qui??n soy?', 'Reloj'),
('??Cu??l es el animal que es dos veces animal?', 'Gato'),
('??Cu??l es el d??a m??s largo de la semana?', 'Mi??rcoles'),
('??Cu??ntas veces aparece la letra A entre cero y cien?', '0'),
('??Qui??n es el ??nico que nunca pierde un partido de f??tbol?', '??rbitro'),
('??En qu?? momento se vuelve fruta una persona?', 'Cuando espera'),
('Dos hermanas, mentira no es. La una es mi t??a, la otra no lo es. ??Qui??n es?', 'Mi madre'),  
('??Cu??ntos animales meti?? Mois??s en el Arca?', 'Ninguno'),
('??Antes de que el monte Everest fuera descubierto, cu??l era la monta??a m??s alta?', 'El Everest'),
('??Cu??l es la cosa que aunque se diga no puede ser nunca escuchada?', 'El silencio'),
('En una habitaci??n hay cuatro esquinas, y en cada uno de ellos hay un gato. Cada uno de los gatos tiene enfrente a otros tres. ??Cu??ntos gatos hay?', '4'),
('Si son las cinco menos cinco y s??lo faltan cinco para las cinco??? ??Cu??ntas veces dije cinco sin contar el ??ltimo cinco?', '5'),
('??Es posible pinchar un globo sin que se escape el aire y sin que haga ruido?', 'S??'),       
('Blanco es, la gallina lo pone, con aceite se fr??e y con pan se come. ??Qu?? es?', 'El huevo'),('Van hacia arriba, van hacia abajo, siempre de arriba a abajo y de abajo a arriba, pero nunca se mueven de su sitio. ??De qu?? estamos hablando?', 'Escalera'),
('Algo tuyo que te pertenece, que casi no usas, pero que los dem??s utilizan casi a diario por ti. ??Qu?? es?', 'Nombre'),
('??C??mo se llama un pol??gono de 6 lados?', 'Hex??gono'),
('??C??mo se llama el conjunto de monta??as que forman una unidad?', 'Cordillera'),
('??C??mo se llaman los animales que solo se alimentan de vegetales y plantas?', 'Herb??voros'), 
('??Es lo mismo multiplicar 3x4 que 4x3?', 'S??');
    
#INSERTAR LAS ECUACIONES
INSERT INTO `ECUACIONES` (`Ecuacion`,`Respuesta`) VALUES 
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
        
CREATE TRIGGER actualizarEstadoAlbum
	AFTER INSERT ON CROMOS FOR EACH ROW
	UPDATE ALBUMES SET Estado = 'Completada parcialmente' WHERE (Estado = 'Finalizada' AND Coleccion = NEW.Coleccion);
    
CREATE TRIGGER actualizarEstadoColeccionInsert
	AFTER INSERT ON CROMOS_ALBUMES FOR EACH ROW
    UPDATE COLECCIONES SET Estado = 'Agotada' WHERE (SELECT SUM(Cantidad) FROM CROMOS WHERE Coleccion = NEW.AlbumColeccion) = 0 AND Nombre = NEW.AlbumColeccion;
    
    
    
