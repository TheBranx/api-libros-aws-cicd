CREATE DATABASE IF NOT EXISTS db_libros CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE db_libros;

CREATE TABLE IF NOT EXISTS libros (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    autor VARCHAR(255) NOT NULL,
    anio_publicacion INT NOT NULL,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO libros (titulo, autor, anio_publicacion) VALUES
('Cien Anos de Soledad', 'Gabriel Garcia Marquez', 1967),
('Don Quijote de la Mancha', 'Miguel de Cervantes', 1605),
('El Principito', 'Antoine de Saint-Exupery', 1943),
('1984', 'George Orwell', 1949),
('Ficciones', 'Jorge Luis Borges', 1944);

SELECT * FROM libros;
