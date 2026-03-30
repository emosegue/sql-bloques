-- 1. Crear la base de datos
CREATE DATABASE IF NOT EXISTS hospital;
USE hospital;

-- 2. Crear tabla de Especialidades
CREATE TABLE especialidades (
    id_especialidad INT AUTO_INCREMENT PRIMARY KEY,
    nombre          VARCHAR(100) NOT NULL,
    descripcion     VARCHAR(255)
);

-- 3. Crear tabla de Médicos
CREATE TABLE medicos (
    id_medico       INT AUTO_INCREMENT PRIMARY KEY,
    nombre          VARCHAR(50)  NOT NULL,
    apellido        VARCHAR(50)  NOT NULL,
    matricula       VARCHAR(20)  UNIQUE NOT NULL,
    id_especialidad INT          NOT NULL,
    telefono        VARCHAR(20),
    email           VARCHAR(100),
    fecha_ingreso   DATE         NOT NULL,
    FOREIGN KEY (id_especialidad) REFERENCES especialidades(id_especialidad)
);

-- 4. Crear tabla de Pacientes
CREATE TABLE pacientes (
    id_paciente      INT AUTO_INCREMENT PRIMARY KEY,
    nombre           VARCHAR(50)  NOT NULL,
    apellido         VARCHAR(50)  NOT NULL,
    dni              VARCHAR(15)  UNIQUE NOT NULL,
    fecha_nacimiento DATE         NOT NULL,
    sexo             CHAR(1)      NOT NULL,
    telefono         VARCHAR(20),
    email            VARCHAR(100),
    direccion        VARCHAR(150),
    obra_social      VARCHAR(100),
    fecha_registro   DATE         NOT NULL
);

-- 5. Crear tabla de Turnos
CREATE TABLE turnos (
    id_turno    INT AUTO_INCREMENT PRIMARY KEY,
    id_paciente INT          NOT NULL,
    id_medico   INT          NOT NULL,
    fecha_hora  DATETIME     NOT NULL,
    motivo      VARCHAR(200),
    estado      VARCHAR(20)  NOT NULL DEFAULT 'PENDIENTE',
    observaciones TEXT,
    FOREIGN KEY (id_paciente) REFERENCES pacientes(id_paciente),
    FOREIGN KEY (id_medico)   REFERENCES medicos(id_medico)
);

-- 6. Crear tabla de Internaciones
CREATE TABLE internaciones (
    id_internacion INT AUTO_INCREMENT PRIMARY KEY,
    id_paciente    INT          NOT NULL,
    id_medico      INT          NOT NULL,
    fecha_ingreso  DATETIME     NOT NULL,
    fecha_egreso   DATETIME,
    habitacion     VARCHAR(10)  NOT NULL,
    motivo         VARCHAR(200) NOT NULL,
    estado         VARCHAR(20)  NOT NULL DEFAULT 'ACTIVA',
    FOREIGN KEY (id_paciente) REFERENCES pacientes(id_paciente),
    FOREIGN KEY (id_medico)   REFERENCES medicos(id_medico)
);

-- 7. Crear tabla de Diagnósticos
CREATE TABLE diagnosticos (
    id_diagnostico INT AUTO_INCREMENT PRIMARY KEY,
    id_turno       INT          NOT NULL,
    descripcion    TEXT         NOT NULL,
    codigo_cie     VARCHAR(10),
    fecha          DATE         NOT NULL,
    FOREIGN KEY (id_turno) REFERENCES turnos(id_turno)
);

-- 8. Crear tabla de Medicamentos
CREATE TABLE medicamentos (
    id_medicamento  INT AUTO_INCREMENT PRIMARY KEY,
    nombre          VARCHAR(100) NOT NULL,
    principio_activo VARCHAR(100) NOT NULL,
    presentacion    VARCHAR(100),
    laboratorio     VARCHAR(100)
);

-- 9. Crear tabla de Prescripciones
CREATE TABLE prescripciones (
    id_prescripcion INT AUTO_INCREMENT PRIMARY KEY,
    id_diagnostico  INT          NOT NULL,
    id_medicamento  INT          NOT NULL,
    dosis           VARCHAR(50)  NOT NULL,
    frecuencia      VARCHAR(50)  NOT NULL,
    duracion_dias   INT          NOT NULL,
    FOREIGN KEY (id_diagnostico) REFERENCES diagnosticos(id_diagnostico),
    FOREIGN KEY (id_medicamento) REFERENCES medicamentos(id_medicamento)
);

-- 10. Insertar especialidades
INSERT INTO especialidades (nombre, descripcion) VALUES
('Clínica Médica',      'Diagnóstico y tratamiento de enfermedades internas generales'),
('Cardiología',         'Enfermedades del corazón y sistema cardiovascular'),
('Pediatría',           'Atención médica de niños y adolescentes'),
('Traumatología',       'Lesiones del sistema musculoesquelético'),
('Ginecología',         'Salud del sistema reproductor femenino'),
('Neurología',          'Enfermedades del sistema nervioso'),
('Oftalmología',        'Enfermedades y cirugía de los ojos'),
('Gastroenterología',   'Enfermedades del sistema digestivo');

-- 11. Insertar médicos
INSERT INTO medicos (nombre, apellido, matricula, id_especialidad, telefono, email, fecha_ingreso) VALUES
('Carlos',    'Mendoza',    'MP-12345', 1, '555-2001', 'c.mendoza@hospital.com',    '2015-03-01'),
('Patricia',  'Álvarez',    'MP-12346', 2, '555-2002', 'p.alvarez@hospital.com',    '2013-06-15'),
('Rodrigo',   'Fernández',  'MP-12347', 3, '555-2003', 'r.fernandez@hospital.com',  '2018-01-10'),
('Daniela',   'Suárez',     'MP-12348', 4, '555-2004', 'd.suarez@hospital.com',     '2016-09-20'),
('Martín',    'Castillo',   'MP-12349', 5, '555-2005', 'm.castillo@hospital.com',   '2017-04-05'),
('Valeria',   'Ríos',       'MP-12350', 6, '555-2006', 'v.rios@hospital.com',       '2019-11-12'),
('Sebastián', 'Moreno',     'MP-12351', 7, '555-2007', 's.moreno@hospital.com',     '2014-07-22'),
('Laura',     'Gutiérrez',  'MP-12352', 8, '555-2008', 'l.gutierrez@hospital.com',  '2020-02-28'),
('Andrés',    'Ramírez',    'MP-12353', 1, '555-2009', 'a.ramirez@hospital.com',    '2012-05-14'),
('Cecilia',   'Vega',       'MP-12354', 2, '555-2010', 'c.vega@hospital.com',       '2015-08-30'),
('Ignacio',   'Herrera',    'MP-12355', 3, '555-2011', 'i.herrera@hospital.com',    '2021-01-05'),
('Florencia', 'Medina',     'MP-12356', 4, '555-2012', 'f.medina@hospital.com',     '2016-03-18'),
('Diego',     'Acosta',     'MP-12357', 5, '555-2013', 'd.acosta@hospital.com',     '2018-10-07'),
('Natalia',   'Pereyra',    'MP-12358', 6, '555-2014', 'n.pereyra@hospital.com',    '2017-06-25'),
('Ezequiel',  'Soria',      'MP-12359', 8, '555-2015', 'e.soria@hospital.com',      '2019-09-15');

-- 12. Insertar pacientes
INSERT INTO pacientes (nombre, apellido, dni, fecha_nacimiento, sexo, telefono, email, direccion, obra_social, fecha_registro) VALUES
('Juan',       'Pérez',      '28001001', '1985-04-12', 'M', '555-3001', 'juan.perez@email.com',      'Av. San Martín 101',    'OSDE',       '2020-01-10'),
('María',      'González',   '30002002', '1990-07-23', 'F', '555-3002', 'maria.gonzalez@email.com',  'Calle Belgrano 202',    'Swiss Medical','2020-01-15'),
('Carlos',     'López',      '25003003', '1978-11-05', 'M', '555-3003', 'carlos.lopez@email.com',    'Av. Rivadavia 303',     'PAMI',       '2020-02-01'),
('Ana',        'Martínez',   '33004004', '1995-02-18', 'F', '555-3004', 'ana.martinez@email.com',    'Calle Mitre 404',       'Galeno',     '2020-02-20'),
('Luis',       'Rodríguez',  '27005005', '1982-09-30', 'M', '555-3005', 'luis.rodriguez@email.com',  'Pasaje Tucumán 505',    'OSDE',       '2020-03-05'),
('Laura',      'Hernández',  '31006006', '1992-06-14', 'F', '555-3006', 'laura.hernandez@email.com', 'Av. Corrientes 606',    'Swiss Medical','2020-03-18'),
('Pedro',      'García',     '24007007', '1975-01-28', 'M', '555-3007', 'pedro.garcia@email.com',    'Calle Sarmiento 707',   'Particular', '2020-04-02'),
('Sofía',      'Fernández',  '35008008', '1998-12-09', 'F', '555-3008', 'sofia.fernandez@email.com', 'Av. Callao 808',        'IOMA',       '2020-04-22'),
('Jorge',      'Díaz',       '29009009', '1987-03-21', 'M', '555-3009', 'jorge.diaz@email.com',      'Calle Florida 909',     'Galeno',     '2020-05-10'),
('Mónica',     'Sánchez',    '26010010', '1980-08-16', 'F', '555-3010', 'monica.sanchez@email.com',  'Av. Santa Fe 1010',     'PAMI',       '2020-05-28'),
('Ricardo',    'Romero',     '32011011', '1993-05-04', 'M', '555-3011', 'ricardo.romero@email.com',  'Calle Lavalle 1111',    'OSDE',       '2020-06-15'),
('Elena',      'Álvarez',    '23012012', '1973-10-19', 'F', '555-3012', 'elena.alvarez@email.com',   'Av. de Mayo 1212',      'Swiss Medical','2020-07-01'),
('Fernando',   'Torres',     '34013013', '1996-04-07', 'M', '555-3013', 'fernando.torres@email.com', 'Calle Córdoba 1313',    'IOMA',       '2020-07-20'),
('Gabriela',   'Ruiz',       '28014014', '1985-12-25', 'F', '555-3014', 'gabriela.ruiz@email.com',   'Av. Entre Ríos 1414',   'Particular', '2020-08-08'),
('Diego',      'Jiménez',    '30015015', '1990-02-11', 'M', '555-3015', 'diego.jimenez@email.com',   'Pasaje Junín 1515',     'Galeno',     '2020-08-25'),
('Patricia',   'Vargas',     '22016016', '1971-07-30', 'F', '555-3016', 'patricia.vargas@email.com', 'Av. Pueyrredón 1616',   'PAMI',       '2020-09-12'),
('Roberto',    'Mendoza',    '36017017', '1999-03-15', 'M', '555-3017', 'roberto.mendoza@email.com', 'Calle Thames 1717',     'OSDE',       '2020-09-30'),
('Lucía',      'Castro',     '27018018', '1982-11-22', 'F', '555-3018', 'lucia.castro@email.com',    'Av. Scalabrini Ortiz 1818','Swiss Medical','2020-10-18'),
('Oscar',      'Ortega',     '31019019', '1991-06-08', 'M', '555-3019', 'oscar.ortega@email.com',    'Calle Serrano 1919',    'Galeno',     '2020-11-05'),
('Claudia',    'Ríos',       '25020020', '1978-01-17', 'F', '555-3020', 'claudia.rios@email.com',    'Av. Corrientes 2020',   'IOMA',       '2020-11-22'),
('Raúl',       'Medina',     '33021021', '1994-09-03', 'M', '555-3021', 'raul.medina@email.com',     'Calle Borges 2121',     'Particular', '2020-12-10'),
('Verónica',   'Cortés',     '29022022', '1988-04-26', 'F', '555-3022', 'veronica.cortes@email.com', 'Av. Cabildo 2222',      'OSDE',       '2021-01-05'),
('Manuel',     'Guerrero',   '24023023', '1976-08-14', 'M', '555-3023', 'manuel.guerrero@email.com', 'Calle Rivadavia 2323',  'PAMI',       '2021-01-20'),
('Isabel',     'Paredes',    '35024024', '1997-12-01', 'F', '555-3024', 'isabel.paredes@email.com',  'Av. Libertador 2424',   'Swiss Medical','2021-02-08'),
('Francisco',  'Silva',      '28025025', '1984-05-20', 'M', '555-3025', 'francisco.silva@email.com', 'Calle Uriarte 2525',    'Galeno',     '2021-02-25'),
('Carmen',     'Luna',       '32026026', '1992-10-09', 'F', '555-3026', 'carmen.luna@email.com',     'Av. Honduras 2626',     'IOMA',       '2021-03-15'),
('Antonio',    'Reyes',      '26027027', '1980-03-28', 'M', '555-3027', 'antonio.reyes@email.com',   'Pasaje El Salvador 2727','OSDE',      '2021-04-02'),
('Adriana',    'Navarro',    '30028028', '1989-07-17', 'F', '555-3028', 'adriana.navarro@email.com', 'Calle Costa Rica 2828', 'Particular', '2021-04-20'),
('Javier',     'Molina',     '34029029', '1996-01-06', 'M', '555-3029', 'javier.molina@email.com',   'Av. Corrientes 2929',   'Swiss Medical','2021-05-08'),
('Daniela',    'Salazar',    '23030030', '1972-06-24', 'F', '555-3030', 'daniela.salazar@email.com', 'Calle Cabrera 3030',    'PAMI',       '2021-05-25'),
('Arturo',     'Vega',       '31031031', '1991-11-13', 'M', '555-3031', 'arturo.vega@email.com',     'Av. Scalabrini 3131',   'Galeno',     '2021-06-12'),
('Teresa',     'Campos',     '25032032', '1977-04-02', 'F', '555-3032', 'teresa.campos@email.com',   'Calle Gurruchaga 3232', 'IOMA',       '2021-07-01'),
('Alejandro',  'Soto',       '36033033', '1999-08-21', 'M', '555-3033', 'alejandro.soto@email.com',  'Av. Dorrego 3333',      'OSDE',       '2021-07-18'),
('Rosa',       'Contreras',  '27034034', '1983-02-10', 'F', '555-3034', 'rosa.contreras@email.com',  'Calle Malabia 3434',    'Swiss Medical','2021-08-05'),
('Héctor',     'Miranda',    '29035035', '1986-07-29', 'M', '555-3035', 'hector.miranda@email.com',  'Av. Warnes 3535',       'Particular', '2021-08-22'),
('Silvia',     'Santos',     '33036036', '1994-12-18', 'F', '555-3036', 'silvia.santos@email.com',   'Calle Acevedo 3636',    'PAMI',       '2021-09-10'),
('Miguel',     'Cervantes',  '24037037', '1974-05-07', 'M', '555-3037', 'miguel.cervantes@email.com','Av. Corrientes 3737',   'Galeno',     '2021-09-28'),
('Lourdes',    'Mejía',      '35038038', '1997-10-26', 'F', '555-3038', 'lourdes.mejia@email.com',   'Calle Corrientes 3838', 'IOMA',       '2021-10-15'),
('Guillermo',  'Aguirre',    '28039039', '1985-03-15', 'M', '555-3039', 'guillermo.aguirre@email.com','Pasaje Thames 3939',   'OSDE',       '2021-11-02'),
('Norma',      'Rosales',    '31040040', '1990-08-04', 'F', '555-3040', 'norma.rosales@email.com',   'Av. Santa Fe 4040',     'Swiss Medical','2021-11-20');

-- 13. Insertar turnos
INSERT INTO turnos (id_paciente, id_medico, fecha_hora, motivo, estado, observaciones) VALUES
(1,  1,  '2024-01-08 09:00:00', 'Control general',               'REALIZADO',  'Paciente en buen estado'),
(2,  2,  '2024-01-08 10:00:00', 'Dolor en el pecho',             'REALIZADO',  'Se solicita ECG'),
(3,  1,  '2024-01-09 09:30:00', 'Hipertensión arterial',         'REALIZADO',  'Ajuste de medicación'),
(4,  3,  '2024-01-09 11:00:00', 'Control pediátrico',            'REALIZADO',  'Desarrollo normal'),
(5,  4,  '2024-01-10 08:00:00', 'Fractura muñeca derecha',       'REALIZADO',  'Yeso aplicado'),
(6,  5,  '2024-01-10 10:30:00', 'Control ginecológico',          'REALIZADO',  'Sin novedades'),
(7,  6,  '2024-01-11 09:00:00', 'Cefalea crónica',               'REALIZADO',  'Se indica resonancia'),
(8,  7,  '2024-01-11 11:00:00', 'Disminución de visión',         'REALIZADO',  'Miopía leve detectada'),
(9,  8,  '2024-01-12 09:00:00', 'Dolor abdominal',               'REALIZADO',  'Gastritis diagnosticada'),
(10, 1,  '2024-01-12 10:30:00', 'Control diabetes',              'REALIZADO',  'Glucemia dentro de rango'),
(11, 2,  '2024-01-15 09:00:00', 'Arritmia cardíaca',             'REALIZADO',  'Se indica Holter'),
(12, 9,  '2024-01-15 11:00:00', 'Fatiga crónica',                'REALIZADO',  'Se solicitan análisis'),
(13, 3,  '2024-01-16 09:30:00', 'Vacunación anual',              'REALIZADO',  'Vacunas aplicadas'),
(14, 4,  '2024-01-16 10:00:00', 'Dolor rodilla izquierda',       'REALIZADO',  'Menisco comprometido'),
(15, 10, '2024-01-17 09:00:00', 'Palpitaciones',                 'REALIZADO',  'ECG normal'),
(16, 5,  '2024-01-17 11:30:00', 'Control embarazo',              'REALIZADO',  'Embarazo de 12 semanas'),
(17, 6,  '2024-01-18 09:00:00', 'Mareos frecuentes',             'REALIZADO',  'Posible vértigo'),
(18, 11, '2024-01-18 10:00:00', 'Tos persistente',               'REALIZADO',  'Bronquitis diagnosticada'),
(19, 8,  '2024-01-19 09:30:00', 'Acidez estomacal',              'REALIZADO',  'ERGE confirmada'),
(20, 1,  '2024-01-19 11:00:00', 'Control colesterol',            'REALIZADO',  'Colesterol elevado'),
(21, 12, '2024-01-22 09:00:00', 'Esguince tobillo',              'REALIZADO',  'Inmovilización indicada'),
(22, 13, '2024-01-22 10:30:00', 'Control postoperatorio',        'REALIZADO',  'Evolución favorable'),
(23, 14, '2024-01-23 09:00:00', 'Epilepsia',                     'REALIZADO',  'Ajuste de medicación anticonvulsivante'),
(24, 7,  '2024-01-23 11:00:00', 'Conjuntivitis',                 'REALIZADO',  'Infección bacteriana'),
(25, 15, '2024-01-24 09:30:00', 'Cólico biliar',                 'REALIZADO',  'Ecografía solicitada'),
(26, 2,  '2024-01-24 10:00:00', 'Control hipertensión',          'REALIZADO',  'Tensión controlada'),
(27, 9,  '2024-01-25 09:00:00', 'Astenia',                       'REALIZADO',  'Se solicita hemograma'),
(28, 3,  '2024-01-25 11:30:00', 'Otitis',                        'REALIZADO',  'Infección tratada con antibióticos'),
(29, 4,  '2024-01-26 09:00:00', 'Lumbalgia',                     'REALIZADO',  'Fisioterapia indicada'),
(30, 5,  '2024-01-26 10:00:00', 'Menstruación irregular',        'REALIZADO',  'Estudio hormonal solicitado'),
(31, 6,  '2024-02-05 09:00:00', 'Migraña',                       'REALIZADO',  'Tratamiento preventivo iniciado'),
(32, 7,  '2024-02-05 11:00:00', 'Glaucoma',                      'REALIZADO',  'Tratamiento con gotas indicado'),
(33, 8,  '2024-02-06 09:30:00', 'Úlcera gástrica',               'REALIZADO',  'Tratamiento con IBP'),
(34, 1,  '2024-02-06 10:30:00', 'Gripe',                         'REALIZADO',  'Tratamiento sintomático'),
(35, 10, '2024-02-07 09:00:00', 'Dolor torácico',                'REALIZADO',  'Descartado IAM'),
(36, 11, '2024-02-07 11:00:00', 'Neumonía',                      'REALIZADO',  'Internación indicada'),
(37, 12, '2024-02-08 09:00:00', 'Luxación hombro',               'REALIZADO',  'Reducción realizada'),
(38, 13, '2024-02-08 10:30:00', 'Control postparto',             'REALIZADO',  'Evolución normal'),
(39, 14, '2024-02-09 09:00:00', 'Esclerosis múltiple',           'REALIZADO',  'Control periódico'),
(40, 15, '2024-02-09 11:00:00', 'Colitis',                       'REALIZADO',  'Tratamiento indicado'),
(1,  9,  '2024-02-12 09:30:00', 'Seguimiento análisis',          'REALIZADO',  'Anemia ferropénica confirmada'),
(5,  4,  '2024-02-12 11:00:00', 'Control fractura',              'REALIZADO',  'Buena consolidación'),
(10, 2,  '2024-02-13 09:00:00', 'Control cardíaco',              'REALIZADO',  'Sin novedades'),
(15, 1,  '2024-02-13 10:30:00', 'Fiebre alta',                   'REALIZADO',  'Infección viral'),
(20, 8,  '2024-02-14 09:00:00', 'Seguimiento ERGE',              'REALIZADO',  'Mejora con tratamiento'),
(25, 15, '2024-02-14 11:00:00', 'Resultados ecografía',          'REALIZADO',  'Colelitiasis confirmada'),
(30, 5,  '2024-02-15 09:30:00', 'Resultados hormonales',         'REALIZADO',  'Hipotiroidismo detectado'),
(35, 10, '2024-02-15 10:00:00', 'Control post estrés',           'REALIZADO',  'ECG de esfuerzo normal'),
(8,  7,  '2024-03-01 09:00:00', 'Control miopía',                'PENDIENTE',  NULL),
(12, 9,  '2024-03-01 10:30:00', 'Resultados análisis',           'PENDIENTE',  NULL),
(18, 11, '2024-03-02 09:00:00', 'Seguimiento bronquitis',        'PENDIENTE',  NULL),
(22, 13, '2024-03-02 11:00:00', 'Nuevo control',                 'PENDIENTE',  NULL),
(28, 3,  '2024-03-03 09:30:00', 'Control otitis',                'CANCELADO',  'Paciente canceló turno'),
(33, 8,  '2024-03-03 10:00:00', 'Control úlcera',                'PENDIENTE',  NULL),
(38, 13, '2024-03-04 09:00:00', 'Control ginecológico',          'PENDIENTE',  NULL),
(3,  1,  '2024-03-04 11:30:00', 'Control hipertensión',          'PENDIENTE',  NULL),
(7,  6,  '2024-03-05 09:00:00', 'Resultados resonancia',         'PENDIENTE',  NULL),
(14, 4,  '2024-03-05 10:00:00', 'Control menisco',               'CANCELADO',  'Médico no disponible'),
(19, 8,  '2024-03-06 09:30:00', 'Control ERGE',                  'PENDIENTE',  NULL),
(24, 7,  '2024-03-06 11:00:00', 'Control conjuntivitis',         'PENDIENTE',  NULL);

-- 14. Insertar internaciones
INSERT INTO internaciones (id_paciente, id_medico, fecha_ingreso, fecha_egreso, habitacion, motivo, estado) VALUES
(2,  2,  '2024-01-08 14:00:00', '2024-01-12 10:00:00', '101-A', 'Angina inestable',              'ALTA'),
(5,  4,  '2024-01-10 12:00:00', '2024-01-13 09:00:00', '204-B', 'Fractura expuesta muñeca',      'ALTA'),
(9,  8,  '2024-01-15 16:00:00', '2024-01-18 11:00:00', '305-C', 'Gastritis hemorrágica',         'ALTA'),
(11, 10, '2024-01-20 10:00:00', '2024-01-24 09:00:00', '102-A', 'Arritmia severa',               'ALTA'),
(16, 5,  '2024-01-22 08:00:00', '2024-01-25 12:00:00', '201-B', 'Embarazo de alto riesgo',       'ALTA'),
(18, 11, '2024-01-25 20:00:00', '2024-01-30 10:00:00', '306-C', 'Neumonía bacteriana',           'ALTA'),
(23, 14, '2024-01-28 11:00:00', '2024-02-02 09:00:00', '103-A', 'Crisis epiléptica severa',      'ALTA'),
(29, 4,  '2024-02-01 15:00:00', '2024-02-05 11:00:00', '205-B', 'Hernia de disco lumbar',        'ALTA'),
(36, 11, '2024-02-07 22:00:00', '2024-02-14 10:00:00', '307-C', 'Neumonía grave',                'ALTA'),
(37, 12, '2024-02-08 09:00:00', '2024-02-09 12:00:00', '206-B', 'Luxación de hombro',            'ALTA'),
(7,  6,  '2024-02-10 14:00:00', '2024-02-15 10:00:00', '104-A', 'ACV isquémico',                 'ALTA'),
(14, 4,  '2024-02-12 10:00:00', '2024-02-18 11:00:00', '207-B', 'Cirugía de menisco',            'ALTA'),
(25, 15, '2024-02-20 09:00:00', '2024-02-23 12:00:00', '308-C', 'Colecistectomía laparoscópica', 'ALTA'),
(1,  9,  '2024-02-25 16:00:00', '2024-02-28 10:00:00', '105-A', 'Anemia severa',                 'ALTA'),
(33, 8,  '2024-03-01 11:00:00', NULL,                   '309-C', 'Úlcera con hemorragia',         'ACTIVA');

-- 15. Insertar diagnósticos
INSERT INTO diagnosticos (id_turno, descripcion, codigo_cie, fecha) VALUES
(1,  'Paciente sin patologías relevantes. Control de rutina normal.',                                       'Z00.0',  '2024-01-08'),
(2,  'Dolor precordial atípico. Se solicita ECG y enzimas cardíacas.',                                      'R07.4',  '2024-01-08'),
(3,  'Hipertensión arterial esencial estadio II. Se ajusta dosis de enalapril.',                            'I10',    '2024-01-09'),
(5,  'Fractura de radio distal derecho. Se aplica yeso antebraquial.',                                      'S52.5',  '2024-01-10'),
(7,  'Cefalea tensional crónica. Se solicita RMN cerebral.',                                                'G44.2',  '2024-01-11'),
(8,  'Miopía leve OD -1.00 OI -1.25. Se indica corrección con lentes.',                                    'H52.1',  '2024-01-11'),
(9,  'Gastritis crónica antral. Se indica tratamiento con IBP y dieta.',                                    'K29.5',  '2024-01-12'),
(10, 'Diabetes mellitus tipo 2 controlada. HbA1c 6.8%.',                                                   'E11.9',  '2024-01-12'),
(11, 'Fibrilación auricular paroxística. Se indica Holter 24hs.',                                          'I48.0',  '2024-01-15'),
(14, 'Lesión meniscal interna rodilla izquierda. Se solicita RMN.',                                        'S83.2',  '2024-01-16'),
(16, 'Embarazo de 12 semanas evolución normal. Se solicita ecografía del primer trimestre.',               'Z34.1',  '2024-01-17'),
(17, 'Vértigo posicional benigno. Se indica maniobra de Epley y rehabilitación.',                          'H81.1',  '2024-01-18'),
(19, 'Enfermedad por reflujo gastroesofágico. Se indica omeprazol y cambios dietéticos.',                  'K21.0',  '2024-01-19'),
(20, 'Hiperlipidemia mixta. LDL 180 mg/dl. Se inicia estatina.',                                          'E78.2',  '2024-01-19'),
(23, 'Epilepsia generalizada en tratamiento. Se ajusta dosis de valproato.',                               'G40.3',  '2024-01-23'),
(24, 'Conjuntivitis bacteriana bilateral. Se indica colirio antibiótico.',                                 'H10.0',  '2024-01-23'),
(25, 'Cólico biliar. Ecografía sugiere colelitiasis. Derivación a cirugía.',                              'K80.2',  '2024-01-24'),
(29, 'Lumbalgia mecánica aguda. Se indica reposo relativo y fisioterapia.',                                'M54.5',  '2024-01-26'),
(33, 'Úlcera péptica gástrica activa. Se indica omeprazol y erradicación H. pylori.',                     'K25.3',  '2024-02-06'),
(36, 'Neumonía bacteriana lóbulo inferior derecho. Internación para antibioticoterapia IV.',               'J18.1',  '2024-02-07'),
(39, 'Esclerosis múltiple remitente-recidivante. Control neurológico periódico.',                          'G35',    '2024-02-09'),
(41, 'Anemia ferropénica moderada. Hb 9.2 g/dl. Se indica hierro oral.',                                  'D50.9',  '2024-02-12'),
(44, 'Síndrome febril viral autolimitado. Tratamiento sintomático.',                                      'J06.9',  '2024-02-13'),
(47, 'Hipotiroidismo primario. TSH 8.5 uUI/ml. Se inicia levotiroxina.',                                  'E03.9',  '2024-02-15'),
(50, 'Bronquitis aguda en resolución. Control en 10 días.',                                                'J20.9',  '2024-03-01');

-- 16. Insertar medicamentos
INSERT INTO medicamentos (nombre, principio_activo, presentacion, laboratorio) VALUES
('Enalapril 10mg',      'Enalapril maleato',        'Comprimidos x 30',      'Roemmers'),
('Atenolol 50mg',       'Atenolol',                 'Comprimidos x 30',      'Bago'),
('Omeprazol 20mg',      'Omeprazol',                'Cápsulas x 14',         'Gador'),
('Metformina 850mg',    'Metformina clorhidrato',   'Comprimidos x 30',      'Montpellier'),
('Atorvastatina 20mg',  'Atorvastatina cálcica',    'Comprimidos x 30',      'Pfizer'),
('Levotiroxina 50mcg',  'Levotiroxina sódica',      'Comprimidos x 30',      'Abbott'),
('Amoxicilina 500mg',   'Amoxicilina',              'Cápsulas x 21',         'Bernabo'),
('Ibuprofeno 400mg',    'Ibuprofeno',               'Comprimidos x 20',      'Bayer'),
('Paracetamol 500mg',   'Paracetamol',              'Comprimidos x 20',      'Glaxo'),
('Loratadina 10mg',     'Loratadina',               'Comprimidos x 10',      'Schering'),
('Valproato 500mg',     'Ácido valproico',           'Comprimidos x 30',      'Abbott'),
('Clonazepam 0.5mg',    'Clonazepam',               'Comprimidos x 30',      'Roche'),
('Ciprofloxacina 500mg','Ciprofloxacina',            'Comprimidos x 10',      'Bayer'),
('Claritromicina 500mg','Claritromicina',            'Comprimidos x 14',      'Abbott'),
('Pantoprazol 40mg',    'Pantoprazol sódico',        'Comprimidos x 28',      'Gador'),
('Sulfato ferroso 325mg','Sulfato ferroso',          'Comprimidos x 30',      'Roemmers'),
('Betahistina 16mg',    'Betahistina dihidrocloruro','Comprimidos x 30',      'UCB'),
('Azitromicina 500mg',  'Azitromicina',             'Comprimidos x 3',       'Pfizer'),
('Simvastatina 20mg',   'Simvastatina',             'Comprimidos x 30',      'Merck'),
('Losartán 50mg',       'Losartán potásico',         'Comprimidos x 30',      'Montpellier'),
('Diclofenac 75mg',     'Diclofenac sódico',         'Comprimidos x 20',      'Novartis'),
('Bisoprolol 5mg',      'Bisoprolol fumarato',       'Comprimidos x 30',      'Merck'),
('Metronidazol 500mg',  'Metronidazol',             'Comprimidos x 20',      'Bago'),
('Fluconazol 150mg',    'Fluconazol',               'Cápsulas x 1',          'Pfizer'),
('Cetirizina 10mg',     'Cetirizina dihidrocloruro', 'Comprimidos x 10',      'UCB');

-- 17. Insertar prescripciones
INSERT INTO prescripciones (id_diagnostico, id_medicamento, dosis, frecuencia, duracion_dias) VALUES
(3,  1,  '10mg',   'Cada 12 horas',     90),
(3,  20, '50mg',   'Cada 24 horas',     90),
(4,  8,  '400mg',  'Cada 8 horas',      14),
(5,  8,  '400mg',  'Cada 8 horas',      10),
(7,  3,  '20mg',   'Cada 24 horas',     30),
(8,  10, '10mg',   'Cada 24 horas',     30),
(9,  3,  '20mg',   'Cada 24 horas',     30),
(10, 4,  '850mg',  'Cada 12 horas',     90),
(10, 5,  '20mg',   'Cada 24 horas',     90),
(12, 17, '16mg',   'Cada 8 horas',      30),
(14, 8,  '400mg',  'Cada 8 horas',      10),
(15, 11, '500mg',  'Cada 12 horas',     90),
(16, 7,  '500mg',  'Cada 8 horas',       7),
(17, 3,  '20mg',   'Cada 24 horas',     30),
(17, 23, '500mg',  'Cada 8 horas',      10),
(18, 21, '75mg',   'Cada 12 horas',     10),
(19, 3,  '20mg',   'Cada 24 horas',     60),
(20, 19, '20mg',   'Cada 24 horas',     90),
(20, 5,  '20mg',   'Cada 24 horas',     90),
(22, 16, '325mg',  'Cada 12 horas',     60),
(23, 9,  '500mg',  'Cada 6 horas',       5),
(24, 6,  '50mcg',  'Cada 24 horas',    365),
(24, 16, '325mg',  'Cada 12 horas',     60),
(25, 9,  '500mg',  'Cada 8 horas',       5),
(25, 3,  '20mg',   'Cada 24 horas',     30);
