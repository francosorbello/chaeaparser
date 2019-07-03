-- phpMyAdmin SQL Dump
-- version 4.8.5
-- https://www.phpmyadmin.net/
--
-- Servidor: localhost
-- Tiempo de generación: 02-07-2019 a las 15:37:08
-- Versión del servidor: 10.1.39-MariaDB
-- Versión de PHP: 7.3.5

ALTER USER 'root'@'%' IDENTIFIED WITH mysql_native_password BY 'pass123';

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `proyectodb`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `actividad`
--
USE proyectodb;
CREATE TABLE `actividad` (
  `id` int(11) NOT NULL COMMENT 'ID de la actividad.',
  `idSeccion` int(11) NOT NULL COMMENT 'ID de la sección a la que pertenece.',
  `idTipo` int(11) NOT NULL COMMENT 'ID del tipo de actividad que es.',
  `nombre` varchar(50) NOT NULL COMMENT 'Nombre de la actividad.'
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `evento`
--

CREATE TABLE `evento` (
  `idUser` int(11) NOT NULL COMMENT 'ID del user que produjo el evento.',
  `idActividad` int(11) NOT NULL COMMENT 'ID de la actividad en la que se produjo el evento.',
  `fecha` date NOT NULL COMMENT 'Momento en el que se produjo el evento.'
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `logs`
--

CREATE TABLE `logs` (
  `id` int(11) NOT NULL COMMENT 'ID del log.',
  `roleid` int(11) NOT NULL COMMENT 'Tipo de usuario que produjo el log.',
  `student` varchar(20) NOT NULL COMMENT 'Nombre del usuario que produjo el log.',
  `email` varchar(50) NOT NULL COMMENT 'Email del usuario que produjo el log.',
  `module type` varchar(15) NOT NULL COMMENT 'Tipo de actividad realizada. Puede ser url, form, resource o quiz.',
  `module id` text NOT NULL COMMENT 'ID de la actividad con la que se interactuó.',
  `nombre evento` text NOT NULL COMMENT 'Evento que se realizó sobre la actividad.',
  `hora` varchar(20) NOT NULL COMMENT 'Momento en el que se registró el log.',
  `module name` text NOT NULL COMMENT 'Nombre de la actividad.',
  `user groups` varchar(20) NOT NULL COMMENT 'Grupo al que pertenece el usuario.',
  `section name` text NOT NULL COMMENT 'Nombre del módulo.'
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `modtipo`
--

CREATE TABLE `modtipo` (
  `id` int(11) NOT NULL COMMENT 'ID que identifica cada tipo de módulo.',
  `nombre` varchar(255) NOT NULL COMMENT 'Nombre asociado al tipo de módulo.'
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `seccion`
--

CREATE TABLE `seccion` (
  `id` int(11) NOT NULL COMMENT 'ID de la sección.',
  `idCurso` int(11) NOT NULL COMMENT 'ID del curso al que pertenece.',
  `nombre` varchar(255) NOT NULL COMMENT 'Nombre de la sección.'
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `testCHAEA`
--

CREATE TABLE `testCHAEA` (
  `tiempo` text COMMENT 'Momento en el que se registró el test.',
  `email` varchar(100) NOT NULL COMMENT 'Email del alumno que realizó el test.',
  `dni` varchar(15) DEFAULT NULL COMMENT 'DNI del alumno que realizó el test.',
  `activo` varchar(10) NOT NULL COMMENT 'Resultado para estilo activo.',
  `teorico` varchar(10) NOT NULL COMMENT 'Resultado para estilo teórico.',
  `pragmatico` varchar(10) NOT NULL COMMENT 'Resultado para estilo pragmático.',
  `reflexivo` varchar(10) NOT NULL COMMENT 'Resultado para estilo reflexivo.'
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuario`
--

CREATE TABLE `usuario` (
  `id` int(11) NOT NULL COMMENT 'ID del usuario.',
  `nombre` varchar(20) NOT NULL COMMENT 'Nombre del usuario.',
  `email` varchar(255) NOT NULL COMMENT 'Apellido del usuario.',
  `dni` varchar(15) NOT NULL COMMENT 'DNI del usuario.'
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `actividad`
--
ALTER TABLE `actividad`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idTipo` (`idTipo`),
  ADD KEY `idSeccion` (`idSeccion`);

--
-- Indices de la tabla `evento`
--
ALTER TABLE `evento`
  ADD PRIMARY KEY (`idUser`,`idActividad`,`fecha`),
  ADD KEY `idActividad` (`idActividad`);

--
-- Indices de la tabla `modtipo`
--
ALTER TABLE `modtipo`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `seccion`
--
ALTER TABLE `seccion`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idCurso` (`idCurso`);

--
-- Indices de la tabla `usuario`
--
ALTER TABLE `usuario`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `actividad`
--
ALTER TABLE `actividad`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'ID de la actividad.';

--
-- AUTO_INCREMENT de la tabla `modtipo`
--
ALTER TABLE `modtipo`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'ID que identifica cada tipo de módulo.';

--
-- AUTO_INCREMENT de la tabla `seccion`
--
ALTER TABLE `seccion`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'ID de la sección.';

--
-- AUTO_INCREMENT de la tabla `usuario`
--
ALTER TABLE `usuario`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'ID del usuario.';

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `actividad`
--
ALTER TABLE `actividad`
  ADD CONSTRAINT `actividad_ibfk_1` FOREIGN KEY (`idTipo`) REFERENCES `modtipo` (`id`),
  ADD CONSTRAINT `actividad_ibfk_2` FOREIGN KEY (`idSeccion`) REFERENCES `seccion` (`id`),
  ADD CONSTRAINT `actividad_ibfk_3` FOREIGN KEY (`idSeccion`) REFERENCES `seccion` (`id`);

--
-- Filtros para la tabla `evento`
--
ALTER TABLE `evento`
  ADD CONSTRAINT `evento_ibfk_1` FOREIGN KEY (`idUser`) REFERENCES `usuario` (`id`),
  ADD CONSTRAINT `evento_ibfk_2` FOREIGN KEY (`idActividad`) REFERENCES `actividad` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
