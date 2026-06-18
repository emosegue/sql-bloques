SET NAMES utf8mb4;
-- Crear la base de datos
CREATE DATABASE universidad;
USE universidad;

-- Crear la tabla de alumnos
CREATE TABLE alumnos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    dni VARCHAR(15) UNIQUE NOT NULL,
    fecha_nacimiento DATE NOT NULL
);

-- Crear la tabla de docentes
CREATE TABLE docentes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE
);

-- Crear la tabla de materias
CREATE TABLE materias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    codigo VARCHAR(10) UNIQUE NOT NULL,
    docente_id INT,
    FOREIGN KEY (docente_id) REFERENCES docentes(id) ON DELETE SET NULL
);

-- Crear la tabla de inscripciones (relación entre alumnos y materias)
CREATE TABLE inscripciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    alumno_id INT NOT NULL,
    materia_id INT NOT NULL,
    fecha_inscripcion DATE NOT NULL,
    FOREIGN KEY (alumno_id) REFERENCES alumnos(id) ON DELETE CASCADE,
    FOREIGN KEY (materia_id) REFERENCES materias(id) ON DELETE CASCADE
);

-- Crear la tabla de exámenes
CREATE TABLE examenes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    materia_id INT NOT NULL,
    fecha DATE NOT NULL,
    tipo ENUM('Parcial', 'Final') NOT NULL,
    FOREIGN KEY (materia_id) REFERENCES materias(id) ON DELETE CASCADE
);

-- Crear la tabla de notas (relación entre alumnos y exámenes)
CREATE TABLE notas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    alumno_id INT NOT NULL,
    examen_id INT NOT NULL,
    nota DECIMAL(4,2) NOT NULL CHECK(nota BETWEEN 0 AND 10),
    FOREIGN KEY (alumno_id) REFERENCES alumnos(id) ON DELETE CASCADE,
    FOREIGN KEY (examen_id) REFERENCES examenes(id) ON DELETE CASCADE
);

-- Insertar datos en la tabla alumnos
INSERT INTO alumnos (nombre, apellido, dni, fecha_nacimiento) VALUES
('Emanuel', 'Mosegue', '12345678', '2000-05-15'),
('María', 'Gómez', '23456789', '1999-08-22'),
('Carlos', 'López', '34567890', '2001-03-10');

-- Insertar docentes de la exposición
INSERT INTO docentes (nombre, apellido, email) VALUES
('Jorge', 'Rodríguez', 'jorge.rodriguez@universidad.edu'),
('Gerardo', 'Parra', 'gerardo.parra@universidad.edu'),
('Laura', 'Cecchi', 'laura.cecchi@universidad.edu'),
('Ignacio', 'Sampedro', 'ignacio.sampedro@universidad.edu');

-- Insertar datos en la tabla materias
INSERT INTO materias (nombre, codigo, docente_id) VALUES
('Matemática', 'MAT101', NULL),
('Física', 'FIS102', NULL),
('Programación', 'PROG103', NULL),
('Técnicas de Meditación I', 'MED101', 1),
('Jardinería Avanzada', 'JAR301', 2),
('Lógica en Fórmulas de Helado', 'HEL201', 3),
('Teoría de Juegos… de Mesa', 'JUE401', 4);

-- Insertar inscripciones de alumnos en materias
INSERT INTO inscripciones (alumno_id, materia_id, fecha_inscripcion) VALUES
(1, 1, '2024-03-01'),
(1, 3, '2024-03-02'),
(1, 6, '2024-03-06'),
(2, 2, '2024-03-03'),
(2, 5, '2024-03-07'),
(3, 1, '2024-03-04'),
(3, 2, '2024-03-05'),
(3, 7, '2024-03-08');

-- Insertar exámenes en materias
INSERT INTO examenes (materia_id, fecha, tipo) VALUES
(1, '2024-06-10', 'Parcial'),
(1, '2024-07-15', 'Final'),
(2, '2024-06-12', 'Parcial'),
(3, '2024-06-20', 'Final'),
(4, '2025-06-10', 'Parcial'),
(7, '2025-06-15', 'Parcial');

-- Insertar notas de alumnos en exámenes
INSERT INTO notas (alumno_id, examen_id, nota) VALUES
(1, 1, 8.50),
(1, 2, 7.00),
(2, 3, 9.00),
(3, 4, 6.50),
(3, 6, 10.00);
