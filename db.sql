-- ==============================================================
-- UNIVERSIDAD MAYOR, REAL Y PONTIFICIA DE SAN FRANCISCO XAVIER
-- MATERIA: Trabajando en la Nube (COM610) - Semestre 2/2026
-- DOCENTE: Ing. Marcelo Quispe Ortega
-- ESTUDIANTE: Vargas Alarcon Brayan Mario
-- EXAMEN: 2do Parcial - Ejercicio 1 (Tema 4)
-- ==============================================================

-- Creación de la base de datos si no existe
CREATE DATABASE IF NOT EXISTS db_libros CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE db_libros;

-- Creación de la tabla libros
CREATE TABLE IF NOT EXISTS libros (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    autor VARCHAR(255) NOT NULL,
    anio_publicacion INT NOT NULL,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Inserción de registros iniciales de prueba
INSERT INTO libros (titulo, autor, anio_publicacion) VALUES
('Cien Anos de Soledad', 'Gabriel Garcia Marquez', 1967),
('Don Quijote de la Mancha', 'Miguel de Cervantes', 1605),
('El Principito', 'Antoine de Saint-Exupery', 1943),
('1984', 'George Orwell', 1949),
('Ficciones', 'Jorge Luis Borges', 1944);

-- Verificación de los datos insertados
SELECT * FROM libros;
