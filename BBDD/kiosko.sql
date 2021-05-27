/*CREATE DATABASE IF NOT EXISTS kiosko;

use kiosko;*/

/*
*Primero borra todas las tablas por si existieran en la bbdd
*/
/*SET FOREIGN_KEY_CHECKS = 0;
SET GROUP_CONCAT_MAX_LEN=32768;
SET @tables = NULL;
SELECT GROUP_CONCAT('`', table_name, '`') INTO @tables
  FROM information_schema.tables
  WHERE table_schema = (SELECT DATABASE());
SELECT IFNULL(@tables,'dummy') INTO @tables;

SET @tables = CONCAT('DROP TABLE IF EXISTS ', @tables);
PREPARE stmt FROM @tables;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
SET FOREIGN_KEY_CHECKS = 1;*/

CREATE TABLE USUARIOS(
    User VARCHAR(20),
    Password VARCHAR(50) NOT NULL,
    Nombre VARCHAR(20) NOT NULL,
    Apellidos VARCHAR(30) NOT NULL,
    Email VARCHAR(35) NOT NULL,
    Puntos INT DEFAULT 0,
    Admin BOOLEAN DEFAULT FALSE,
	CONSTRAINT pk_usuarios PRIMARY KEY(User)
);


CREATE TABLE COLECCIONES(
    	Nombre VARCHAR(20),
    	Estado ENUM('Activa','Agotada') NOT NULL, #No se si se puede poner not null aqui
    	CONSTRAINT pk_colecciones PRIMARY KEY(Nombre)
);

CREATE TABLE ALBUMES(
        ID INT AUTO_INCREMENT, #Se podria quitar
        User VARCHAR(20),
        Coleccion VARCHAR(20),
    	Nombre VARCHAR(20) NOT NULL,
    	Estado ENUM('No iniciada', 'Completada parcialmente','Finalizada'),
    	CONSTRAINT pk_albumes PRIMARY KEY(ID),
        CONSTRAINT fk_coleccion FOREIGN KEY(Coleccion) REFERENCES COLECCIONES(Nombre),
		CONSTRAINT fk_user FOREIGN KEY(User) REFERENCES USUARIOS(User),
        CONSTRAINT u_coleccion UNIQUE(User, Coleccion) #Teniendo en cuenta que un usuario solo pueda tener un album por coleccion
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
	CONSTRAINT fk_coleccionCromos FOREIGN KEY(Coleccion) REFERENCES COLECCIONES(Nombre),
    CONSTRAINT u_cromos UNIQUE(Nombre, Coleccion) #No puede haber dos cromos con el mismo nombre en la misma coleccion
);

CREATE TABLE CROMOS_ALBUMES(
	CromoID INT,
    AlbumID INT,
	CONSTRAINT fk_cromo FOREIGN KEY(CromoID) REFERENCES CROMOS(ID),
    CONSTRAINT fk_album FOREIGN KEY(AlbumID) REFERENCES ALBUMES(ID),
    CONSTRAINT pk_cromos_albumes PRIMARY KEY(CromoID, AlbumID)
);

INSERT INTO `COLECCIONES` (`Nombre`, `Estado`) VALUES ('Java', 'Activa'), ('C', 'Activa');

INSERT INTO `CROMOS` (`ID`, `Nombre`, `Coleccion`, `RutaImagen`, `Precio`, `Cantidad`, `Descripcion`, `DatoInteresante`, `Frecuencia`) 
	VALUES (NULL, 'ArrayIndexOutOfBoundsException', 'Java', './resources/colecciones/java/imagenes/ArrayIndexOutOfBoundsException.JPG', '1', '3', 'Se lanza para indicar que se esta intentando acceder a una posicion fuera de un array. El indice elegido es negativo o mayor que la longitud del array', 'Parece que te falta algun elemento en el array amigo', 'Comun');

INSERT INTO `CROMOS` (`ID`, `Nombre`, `Coleccion`, `RutaImagen`, `Precio`, `Cantidad`, `Descripcion`, `DatoInteresante`, `Frecuencia`) 
	VALUES (NULL, 'ClassCastException', 'Java', './resources/colecciones/java/imagenes/ClassCastException.JPG', '2', '2', 'Se lanza para indicar que el código ha intentado convertir un objeto en una subclase de la que no es una instancia.', 'Parece ser que no eres muy de OOP', 'Raro');

INSERT INTO `CROMOS` (`ID`, `Nombre`, `Coleccion`, `RutaImagen`, `Precio`, `Cantidad`, `Descripcion`, `DatoInteresante`, `Frecuencia`) 
	VALUES (NULL, 'IllegalArgumentException', 'Java', './resources/colecciones/java/imagenes/IllegalArgumentException.JPG', '2', '2', 'Lanzada cuando a un metodo se le pasa un argumento ilegal o inapropiado', 'Creo que deberias conocer mejor los metodos que has programado campeon', 'Raro');
    
INSERT INTO `CROMOS` (`ID`, `Nombre`, `Coleccion`, `RutaImagen`, `Precio`, `Cantidad`, `Descripcion`, `DatoInteresante`, `Frecuencia`) 
	VALUES (NULL, 'IllegalStateException', 'Java', './resources/colecciones/java/imagenes/IllegalStateException.JPG', '3', '1', 'Lanzada cuando se llama a un método en un momento inapropiado o ilegal. Esto quiere decir que el entorno de Java no se encuentra en el estado adecuado para la ejecucion de este metodo', 'Que habras hecho para que te pase esto... Surrealista', 'Excepcional');    

INSERT INTO `CROMOS` (`ID`, `Nombre`, `Coleccion`, `RutaImagen`, `Precio`, `Cantidad`, `Descripcion`, `DatoInteresante`, `Frecuencia`) 
	VALUES (NULL, 'NullPointerException', 'Java', './resources/colecciones/java/imagenes/NullPointerException.JPG', '1', '3', 'Es una excepcion de tipo RuntimeException. En java, un valor especial null se puede asignar a un objeto. Se lanzara esta excepcion cuando la aplicacion trate de usar una referencia que apunte a null', 'No te preocupes, nos ha pasado a todos...', 'Comun');

INSERT INTO `CROMOS` (`ID`, `Nombre`, `Coleccion`, `RutaImagen`, `Precio`, `Cantidad`, `Descripcion`, `DatoInteresante`, `Frecuencia`) 
	VALUES (NULL, 'NumberFormatException', 'Java', './resources/colecciones/java/imagenes/NumberFormatException.JPG', '2', '2', 'Se lanza para alertar de que la aplicacion ha intentado convertir una cadena de texto a algun formato numerico, sin que esta cumpla las condiciones para poder hacerlo', 'Esto te pasa por no usar Python', 'Comun');
    
INSERT INTO `CROMOS` (`ID`, `Nombre`, `Coleccion`, `RutaImagen`, `Precio`, `Cantidad`, `Descripcion`, `DatoInteresante`, `Frecuencia`) 
	VALUES (NULL, 'AssertionError', 'Java', './resources/colecciones/java/imagenes/AssertionError.JPG', '1', '3', 'Se lanza al detectar un fallo en alguna afirmacion (assertion), generalmente en el codigo de test de la aplicacion', 'Por lo menos has hecho tests, ni tan mal', 'Comun');
    
INSERT INTO `CROMOS` (`ID`, `Nombre`, `Coleccion`, `RutaImagen`, `Precio`, `Cantidad`, `Descripcion`, `DatoInteresante`, `Frecuencia`) 
	VALUES (NULL, 'ExceptionInInitializerError', 'Java', './resources/colecciones/java/imagenes/ExceptionInInitializerError.JPG', '3', '1', 'Lanzada cuando ocurre alguna excepcion inesperada durante la inicializacion de una variable estatica o la evaluacion de un inicializador estatico', 'No me ha pasado en la vida', 'Excepcional');    
    
INSERT INTO `CROMOS` (`ID`, `Nombre`, `Coleccion`, `RutaImagen`, `Precio`, `Cantidad`, `Descripcion`, `DatoInteresante`, `Frecuencia`) 
	VALUES (NULL, 'StackOverflowError', 'Java', './resources/colecciones/java/imagenes/StackOverflowError.JPG', '1', '3', 'Lanzada cuando una aplicacion intenta acceder a recursos en memoria que no le han sido asignados. Los permisos concedidos a esta aplicacion por el sistema no permitiran dicho acceso', 'Este error da nombre a la Biblia de la informatica', 'Comun');    
    
INSERT INTO `CROMOS` (`ID`, `Nombre`, `Coleccion`, `RutaImagen`, `Precio`, `Cantidad`, `Descripcion`, `DatoInteresante`, `Frecuencia`) 
	VALUES (NULL, 'NoClassDefFoundError', 'Java', './resources/colecciones/java/imagenes/NoClassDefFoundError.JPG', '2', '2', 'Lanzada cuando la Java Virtual Machine no consigue encontrar un fichero .class concreto durante la ejecucion que si fue compilado previamente', 'Vuelve a compilar, crack!', 'Raro');
    
    
    
    