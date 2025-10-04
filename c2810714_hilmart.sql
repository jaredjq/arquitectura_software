
-- phpMyAdmin SQL Dump
-- version 4.9.11
-- https://www.phpmyadmin.net/
--
-- Servidor: localhost
-- Tiempo de generación: 01-05-2025 a las 04:17:24
-- Versión del servidor: 8.0.35
-- Versión de PHP: 7.4.33

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `c2810714_hilmart`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `PROCESOS`
--

CREATE TABLE `PROCESOS` (
  `id_proceso` int NOT NULL,
  `nombre_proceso` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

--
-- Volcado de datos para la tabla `PROCESOS`
--

INSERT INTO `PROCESOS` (`id_proceso`, `nombre_proceso`) VALUES
(1, 'PRIMER CORTE'),
(2, 'IMPRESIÓN'),
(3, 'DOBLADO'),
(4, 'COMPAGINADO'),
(5, 'ENGRAPADO'),
(6, 'SEGUNDO CORTE'),
(7, 'EMPAQUETADO');

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `REPORTE_MERMA`
-- (Véase abajo para la vista actual)
--
CREATE TABLE `REPORTE_MERMA` (
`costo_merma` decimal(20,2)
,`hojas_ingresadas` int
,`id_trabajo` int
,`merma` int
,`nombre_proceso` varchar(50)
,`nombre_trabajo` varchar(100)
);

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `REPORTE_MERMA_TOTAL`
-- (Véase abajo para la vista actual)
--
CREATE TABLE `REPORTE_MERMA_TOTAL` (
`costo_total` decimal(42,2)
,`id_trabajo` int
,`merma_total` decimal(32,0)
,`nombre_trabajo` varchar(100)
);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `TRABAJOS`
--

CREATE TABLE `TRABAJOS` (
  `id_trabajo` int NOT NULL,
  `nombre_trabajo` varchar(100) NOT NULL,
  `cantidad_total_hojas` int NOT NULL,
  `precio_por_hoja` decimal(10,2) NOT NULL,
  `fecha_inicio` date NOT NULL,
  `fecha_fin` date NOT NULL,
  `creado_por` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `TRABAJO_PROCESO`
--

CREATE TABLE `TRABAJO_PROCESO` (
  `id_trabajo_proceso` int NOT NULL,
  `id_trabajo` int NOT NULL,
  `id_proceso` int NOT NULL,
  `hojas_ingresadas` int NOT NULL,
  `merma` int DEFAULT '0',
  `fecha_registro` datetime DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `USUARIOS`
--

CREATE TABLE `USUARIOS` (
  `id_usuario` int NOT NULL,
  `email` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `fecha_creacion` datetime DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

--
-- Volcado de datos para la tabla `USUARIOS`
--

INSERT INTO `USUARIOS` (`id_usuario`, `email`, `password_hash`, `fecha_creacion`) VALUES
(1, 'empleojared99@gmail.com', '$2b$10$QScdBrV.gA/jMtjAZr3AbOHcN7FjfljeV9/K69xJtWPB2juuWpAB2', '2025-04-22 18:08:24'),
(3, 'jiquhack@gmail.com', '$2b$10$kEZZzzJFDhBanz5tOnhor.86H3u4O5P8YGIxGChKxtApZfj56fCrS', '2025-04-30 20:14:06');

-- --------------------------------------------------------

--
-- Estructura para la vista `REPORTE_MERMA`
--
DROP TABLE IF EXISTS `REPORTE_MERMA`;

CREATE ALGORITHM=UNDEFINED DEFINER=`c2810714_hilmart`@`%` SQL SECURITY DEFINER VIEW `REPORTE_MERMA`  AS SELECT `t`.`id_trabajo` AS `id_trabajo`, `t`.`nombre_trabajo` AS `nombre_trabajo`, `p`.`nombre_proceso` AS `nombre_proceso`, `tp`.`hojas_ingresadas` AS `hojas_ingresadas`, `tp`.`merma` AS `merma`, (`tp`.`merma` * `t`.`precio_por_hoja`) AS `costo_merma` FROM ((`TRABAJO_PROCESO` `tp` join `TRABAJOS` `t` on((`t`.`id_trabajo` = `tp`.`id_trabajo`))) join `PROCESOS` `p` on((`tp`.`id_proceso` = `p`.`id_proceso`))) ;

-- --------------------------------------------------------

--
-- Estructura para la vista `REPORTE_MERMA_TOTAL`
--
DROP TABLE IF EXISTS `REPORTE_MERMA_TOTAL`;

CREATE ALGORITHM=UNDEFINED DEFINER=`c2810714_hilmart`@`%` SQL SECURITY DEFINER VIEW `REPORTE_MERMA_TOTAL`  AS SELECT `t`.`id_trabajo` AS `id_trabajo`, `t`.`nombre_trabajo` AS `nombre_trabajo`, sum(`tp`.`merma`) AS `merma_total`, sum((`tp`.`merma` * `t`.`precio_por_hoja`)) AS `costo_total` FROM (`TRABAJO_PROCESO` `tp` join `TRABAJOS` `t` on((`t`.`id_trabajo` = `tp`.`id_trabajo`))) GROUP BY `t`.`id_trabajo`, `t`.`nombre_trabajo`;

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `PROCESOS`
--
ALTER TABLE `PROCESOS`
  ADD PRIMARY KEY (`id_proceso`);

--
-- Indices de la tabla `TRABAJOS`
--
ALTER TABLE `TRABAJOS`
  ADD PRIMARY KEY (`id_trabajo`),
  ADD KEY `creado_por` (`creado_por`);

--
-- Indices de la tabla `TRABAJO_PROCESO`
--
ALTER TABLE `TRABAJO_PROCESO`
  ADD PRIMARY KEY (`id_trabajo_proceso`),
  ADD KEY `id_trabajo` (`id_trabajo`),
  ADD KEY `id_proceso` (`id_proceso`);

--
-- Indices de la tabla `USUARIOS`
--
ALTER TABLE `USUARIOS`
  ADD PRIMARY KEY (`id_usuario`),
  ADD UNIQUE KEY `nombre_usuario` (`email`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `PROCESOS`
--
ALTER TABLE `PROCESOS`
  MODIFY `id_proceso` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT de la tabla `TRABAJOS`
--
ALTER TABLE `TRABAJOS`
  MODIFY `id_trabajo` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `TRABAJO_PROCESO`
--
ALTER TABLE `TRABAJO_PROCESO`
  MODIFY `id_trabajo_proceso` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `USUARIOS`
--
ALTER TABLE `USUARIOS`
  MODIFY `id_usuario` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `TRABAJOS`
--
ALTER TABLE `TRABAJOS`
  ADD CONSTRAINT `TRABAJOS_ibfk_1` FOREIGN KEY (`creado_por`) REFERENCES `USUARIOS` (`id_usuario`) ON DELETE SET NULL;

--
-- Filtros para la tabla `TRABAJO_PROCESO`
--
ALTER TABLE `TRABAJO_PROCESO`
  ADD CONSTRAINT `TRABAJO_PROCESO_ibfk_1` FOREIGN KEY (`id_trabajo`) REFERENCES `TRABAJOS` (`id_trabajo`) ON DELETE CASCADE,
  ADD CONSTRAINT `TRABAJO_PROCESO_ibfk_2` FOREIGN KEY (`id_proceso`) REFERENCES `PROCESOS` (`id_proceso`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
