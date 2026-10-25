-- MySQL dump 10.13  Distrib 8.4.3, for Win64 (x86_64)
--
-- Host: localhost    Database: sigc
-- ------------------------------------------------------
-- Server version	8.4.3

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `bitacora`
--

DROP TABLE IF EXISTS `bitacora`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bitacora` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `usuario_id` bigint unsigned NOT NULL,
  `modulo` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `accion` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `bitacora_usuario_id_foreign` (`usuario_id`),
  CONSTRAINT `bitacora_usuario_id_foreign` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bitacora`
--

LOCK TABLES `bitacora` WRITE;
/*!40000 ALTER TABLE `bitacora` DISABLE KEYS */;
INSERT INTO `bitacora` VALUES (1,1,'Autenticacion','Inicio de sesion','Admin Sistema (produccionroman@gmail.com)','2026-10-10 17:35:52'),(2,1,'Configuración','Actualización manual de tipo de cambio','Nuevo tipo de cambio: ₡455.58 por USD.','2026-10-10 21:02:01'),(3,2,'Autenticacion','Inicio de sesion','Usuario de prueba (prueba@gmail.com)','2026-10-10 21:27:54'),(4,2,'Vallas','Creacion de valla','Q-001 - San Carlos - LOS ANGELES (6x2)','2026-10-10 21:30:57'),(5,2,'Vallas','Edicion de valla','Q-001 - San Carlos - LOS ANGELES Fortuna (6x2)','2026-10-10 21:33:31'),(6,1,'Vallas','Creacion de valla','SJ-001 - San Jose - Guadalupe (6x8)','2026-10-10 21:33:33'),(7,1,'Vallas','Edicion de valla','Q-001 - San Carlos - LOS ANGELES Fortuna (6x2)','2026-10-10 21:39:26'),(8,1,'Reservas','Creacion de reserva','Reserva #1 - Valla Q-001','2026-10-10 21:53:24'),(9,1,'Reservas','Creacion de reserva','Reserva #2 - Valla SJ-001','2026-10-10 21:54:35'),(10,1,'Vallas','Creacion de valla','A-001 - Alajuela - Radial Alajuela (10x5m)','2026-10-10 22:39:14'),(11,1,'Reservas','Creacion de reserva','Reserva #3 - Valla A-001','2026-10-10 22:39:44'),(12,1,'Reservas','Cancelacion de reserva','Reserva #2 - Valla SJ-001','2026-10-10 22:41:34'),(13,1,'Reservas','Creacion de reserva','Reserva #4 - Valla SJ-001','2026-10-10 22:41:57'),(14,1,'Autenticacion','Inicio de sesion','Admin Sistema (produccionroman@gmail.com)','2026-10-24 17:59:28'),(15,1,'Solicitudes','Cambio de estado a En seguimiento','SOL-0002 - Jose Alexis Soro','2026-10-24 18:00:09'),(16,1,'Solicitudes','Cambio de estado a Cerrada','SOL-0002 - Jose Alexis Soro','2026-10-24 18:00:36'),(17,1,'Solicitudes','Cambio de estado a En seguimiento','SOL-0003 - Isabella Soro','2026-10-24 18:12:49'),(18,1,'Solicitudes','Cambio de estado a En seguimiento','SOL-0001 - Jose Alexis Soro','2026-10-24 18:13:02'),(19,1,'Vallas','Edicion de valla','Q-001 - San Carlos - LOS ANGELES Fortuna (6x2)','2026-10-24 18:39:34'),(20,1,'Solicitudes','Cambio de estado a En seguimiento','SOL-0004 - Yoselin','2026-10-24 18:41:29'),(21,1,'Solicitudes','Cambio de estado a Cerrada','SOL-0004 - Yoselin','2026-10-24 18:41:32'),(22,1,'Solicitudes','Cambio de estado a Cerrada','SOL-0003 - Isabella Soro','2026-10-24 18:41:36'),(23,1,'Solicitudes','Cambio de estado a Cerrada','SOL-0001 - Jose Alexis Soro','2026-10-24 18:41:42'),(24,1,'Solicitudes','Cambio de estado a En seguimiento','SOL-0005 - Ismael Soro','2026-10-24 18:44:36'),(25,1,'Reservas','Creacion de reserva','Reserva #7 - Valla A-001','2026-10-24 18:45:16'),(26,1,'Reservas','Cancelacion de reserva','Reserva #7 - Valla A-001','2026-10-24 18:47:27');
/*!40000 ALTER TABLE `bitacora` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cache`
--

DROP TABLE IF EXISTS `cache`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cache` (
  `key` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `value` mediumtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiration` bigint NOT NULL,
  PRIMARY KEY (`key`),
  KEY `cache_expiration_index` (`expiration`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cache`
--

LOCK TABLES `cache` WRITE;
/*!40000 ALTER TABLE `cache` DISABLE KEYS */;
/*!40000 ALTER TABLE `cache` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cache_locks`
--

DROP TABLE IF EXISTS `cache_locks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cache_locks` (
  `key` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `owner` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiration` bigint NOT NULL,
  PRIMARY KEY (`key`),
  KEY `cache_locks_expiration_index` (`expiration`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cache_locks`
--

LOCK TABLES `cache_locks` WRITE;
/*!40000 ALTER TABLE `cache_locks` DISABLE KEYS */;
/*!40000 ALTER TABLE `cache_locks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `clientes`
--

DROP TABLE IF EXISTS `clientes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `clientes` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `nombre` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `cedula` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `telefono` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `correo` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `direccion` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `estado` enum('Activo','Inactivo') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Activo',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `clientes_cedula_unique` (`cedula`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `clientes`
--

LOCK TABLES `clientes` WRITE;
/*!40000 ALTER TABLE `clientes` DISABLE KEYS */;
INSERT INTO `clientes` VALUES (1,'Jose Soro',NULL,NULL,NULL,NULL,'Activo','2026-10-10 21:53:24','2026-10-10 21:53:24'),(2,'axel',NULL,NULL,NULL,NULL,'Activo','2026-10-10 21:54:35','2026-10-10 21:54:35'),(3,'Arias Vega','209860548','56543212','aaa@gmail.com','San jose','Activo','2026-10-10 22:39:44','2026-10-10 22:41:09'),(4,'Jose Soro',NULL,NULL,NULL,NULL,'Activo','2026-10-10 22:41:57','2026-10-10 22:41:57'),(5,'Yoselin Salazar Sancho','207130923','7257-6293','aadfgw@correo.com','San Carlos','Activo','2026-10-10 22:42:53','2026-10-10 22:42:53'),(6,'DHL',NULL,'63323368','tp.soro@gmail.com',NULL,'Activo','2026-10-24 18:43:00','2026-10-24 18:43:00'),(7,'Jose Soro',NULL,NULL,NULL,NULL,'Activo','2026-10-24 18:45:16','2026-10-24 18:45:16'),(8,'sara',NULL,'23453456','qqq@qqq.com',NULL,'Activo','2026-10-24 18:50:19','2026-10-24 18:50:19');
/*!40000 ALTER TABLE `clientes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `configuracion`
--

DROP TABLE IF EXISTS `configuracion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `configuracion` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `tipo_cambio` decimal(8,2) NOT NULL COMMENT 'USD -> CRC',
  `tipo_cambio_auto` tinyint(1) NOT NULL DEFAULT '0',
  `tipo_cambio_actualizado_en` timestamp NULL DEFAULT NULL,
  `empresa` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `correo` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `telefono` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `direccion` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `cedula_tipo` enum('fisica','juridica') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'fisica',
  `cedula_numero` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `sitio_web` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `logo` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `comision_ejecutivo_pct` decimal(5,2) NOT NULL DEFAULT '0.00' COMMENT 'Comision fija, igual para todos los ejecutivos',
  `dias_aviso_vencimiento` int unsigned NOT NULL DEFAULT '30',
  `notificaciones_activas` tinyint(1) NOT NULL DEFAULT '0',
  `notificaciones_correo_remitente` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `notificaciones_nombre_remitente` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `scheduler_ultima_corrida` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `configuracion`
--

LOCK TABLES `configuracion` WRITE;
/*!40000 ALTER TABLE `configuracion` DISABLE KEYS */;
INSERT INTO `configuracion` VALUES (1,455.58,1,'2026-10-10 21:02:01','Publicidad Roman Megavallas',NULL,NULL,NULL,'fisica',NULL,'https://www.romanmegavallas.com','logo/fpDS6ZnTlZv2BAJE55qGO2SQnTQxc29fMrznC9mf.png',10.00,30,1,NULL,NULL,'2026-10-25 02:40:10','2026-08-24 05:26:28','2026-10-25 02:40:10');
/*!40000 ALTER TABLE `configuracion` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `contratos`
--

DROP TABLE IF EXISTS `contratos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `contratos` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `reserva_id` bigint unsigned DEFAULT NULL,
  `valla_id` bigint unsigned NOT NULL,
  `cliente_id` bigint unsigned NOT NULL,
  `usuario_id` bigint unsigned NOT NULL,
  `codigo` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `monto_usd` decimal(12,2) NOT NULL COMMENT 'Monto total del contrato, siempre en USD',
  `plazo_meses` smallint unsigned NOT NULL,
  `fecha_inicio` date NOT NULL,
  `fecha_fin` date NOT NULL,
  `estado` enum('Activo','Finalizado') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Activo',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `contratos_codigo_unique` (`codigo`),
  KEY `contratos_reserva_id_foreign` (`reserva_id`),
  KEY `contratos_valla_id_foreign` (`valla_id`),
  KEY `contratos_cliente_id_foreign` (`cliente_id`),
  KEY `contratos_usuario_id_foreign` (`usuario_id`),
  CONSTRAINT `contratos_cliente_id_foreign` FOREIGN KEY (`cliente_id`) REFERENCES `clientes` (`id`),
  CONSTRAINT `contratos_reserva_id_foreign` FOREIGN KEY (`reserva_id`) REFERENCES `reservas` (`id`) ON DELETE SET NULL,
  CONSTRAINT `contratos_usuario_id_foreign` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `contratos_valla_id_foreign` FOREIGN KEY (`valla_id`) REFERENCES `vallas` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `contratos`
--

LOCK TABLES `contratos` WRITE;
/*!40000 ALTER TABLE `contratos` DISABLE KEYS */;
INSERT INTO `contratos` VALUES (1,1,1,1,1,'CT-Q-001-10-26',15000.00,6,'2026-10-11','2027-04-11','Finalizado','2026-10-10 21:55:28','2026-10-24 18:32:31'),(2,3,3,3,1,'CT-A-001-10-26',21000.00,6,'2026-10-11','2027-04-11','Finalizado','2026-10-10 22:41:09','2026-10-24 18:32:35');
/*!40000 ALTER TABLE `contratos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `failed_jobs`
--

DROP TABLE IF EXISTS `failed_jobs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `failed_jobs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `uuid` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `connection` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `queue` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `exception` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`),
  KEY `failed_jobs_connection_queue_failed_at_index` (`connection`,`queue`,`failed_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `failed_jobs`
--

LOCK TABLES `failed_jobs` WRITE;
/*!40000 ALTER TABLE `failed_jobs` DISABLE KEYS */;
/*!40000 ALTER TABLE `failed_jobs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `fotos_vallas`
--

DROP TABLE IF EXISTS `fotos_vallas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `fotos_vallas` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `valla_id` bigint unsigned NOT NULL,
  `ruta_archivo` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fotos_vallas_valla_id_foreign` (`valla_id`),
  CONSTRAINT `fotos_vallas_valla_id_foreign` FOREIGN KEY (`valla_id`) REFERENCES `vallas` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fotos_vallas`
--

LOCK TABLES `fotos_vallas` WRITE;
/*!40000 ALTER TABLE `fotos_vallas` DISABLE KEYS */;
/*!40000 ALTER TABLE `fotos_vallas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `job_batches`
--

DROP TABLE IF EXISTS `job_batches`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `job_batches` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `total_jobs` int NOT NULL,
  `pending_jobs` int NOT NULL,
  `failed_jobs` int NOT NULL,
  `failed_job_ids` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `options` mediumtext COLLATE utf8mb4_unicode_ci,
  `cancelled_at` int DEFAULT NULL,
  `created_at` int NOT NULL,
  `finished_at` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `job_batches`
--

LOCK TABLES `job_batches` WRITE;
/*!40000 ALTER TABLE `job_batches` DISABLE KEYS */;
/*!40000 ALTER TABLE `job_batches` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `jobs`
--

DROP TABLE IF EXISTS `jobs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `jobs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `queue` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `attempts` smallint unsigned NOT NULL,
  `reserved_at` int unsigned DEFAULT NULL,
  `available_at` int unsigned NOT NULL,
  `created_at` int unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `jobs_queue_index` (`queue`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `jobs`
--

LOCK TABLES `jobs` WRITE;
/*!40000 ALTER TABLE `jobs` DISABLE KEYS */;
/*!40000 ALTER TABLE `jobs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `migrations`
--

DROP TABLE IF EXISTS `migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `migrations` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `migration` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `batch` int NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `migrations`
--

LOCK TABLES `migrations` WRITE;
/*!40000 ALTER TABLE `migrations` DISABLE KEYS */;
INSERT INTO `migrations` VALUES (1,'0001_01_01_000001_create_cache_table',1),(2,'0001_01_01_000002_create_jobs_table',1),(3,'2024_01_01_000001_create_roles_table',1),(4,'2024_01_01_000002_create_provincias_table',1),(5,'2024_01_01_000006_create_vallas_table',1),(6,'2024_01_01_000007_create_fotos_vallas_table',1),(7,'2024_01_01_000008_create_usuarios_table',1),(8,'2024_01_01_000009_create_clientes_table',1),(9,'2024_01_01_000010_create_reservas_table',1),(10,'2024_01_01_000011_create_contratos_table',1),(11,'2024_01_01_000012_create_bitacora_table',1),(12,'2024_01_01_000013_create_configuracion_table',1),(13,'2026_07_21_034037_create_personal_access_tokens_table',1),(14,'2026_08_16_060516_add_precios_to_vallas_table',1),(15,'2026_09_03_221414_add_vehiculos_y_precio_instalacion_to_vallas_table',2),(16,'2026_09_04_225340_renombrar_y_agregar_roles',3),(17,'2026_09_12_121639_create_reportes_table',4),(18,'2026_09_20_120000_add_campos_a_configuracion_table',5),(19,'2026_10_10_160000_permitir_cedula_nula_en_clientes',6),(20,'2026_10_11_100000_create_solicitudes_portal_tables',7),(21,'2026_10_11_130000_add_turnos_portal',7),(22,'2026_10_13_100000_create_pagos_portal',8),(23,'2026_10_24_100000_agregar_reserva_a_solicitud_portal_vallas',9);
/*!40000 ALTER TABLE `migrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pagos_portal`
--

DROP TABLE IF EXISTS `pagos_portal`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pagos_portal` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `solicitud_portal_id` bigint unsigned NOT NULL,
  `referencia` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tipo` enum('Adelanto','Completo') COLLATE utf8mb4_unicode_ci NOT NULL,
  `monto` decimal(12,2) NOT NULL,
  `moneda` varchar(3) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'USD',
  `estado` enum('Pendiente','Pagado','Fallido','Cancelado','Reembolsado') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Pendiente',
  `pasarela` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `pasarela_referencia` varchar(120) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `pagado_en` timestamp NULL DEFAULT NULL,
  `datos` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `pagos_portal_referencia_unique` (`referencia`),
  KEY `pagos_portal_solicitud_portal_id_estado_index` (`solicitud_portal_id`,`estado`),
  KEY `pagos_portal_pasarela_pasarela_referencia_index` (`pasarela`,`pasarela_referencia`),
  CONSTRAINT `pagos_portal_solicitud_portal_id_foreign` FOREIGN KEY (`solicitud_portal_id`) REFERENCES `solicitudes_portal` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pagos_portal`
--

LOCK TABLES `pagos_portal` WRITE;
/*!40000 ALTER TABLE `pagos_portal` DISABLE KEYS */;
INSERT INTO `pagos_portal` VALUES (1,2,'PAG-00001','Adelanto',1200.00,'USD','Pagado','simulado','SIM-PAG-00001','2026-10-14 03:23:01',NULL,'2026-10-14 03:22:49','2026-10-14 03:23:01');
/*!40000 ALTER TABLE `pagos_portal` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `personal_access_tokens`
--

DROP TABLE IF EXISTS `personal_access_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `personal_access_tokens` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `tokenable_type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tokenable_id` bigint unsigned NOT NULL,
  `name` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `abilities` text COLLATE utf8mb4_unicode_ci,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`),
  KEY `personal_access_tokens_expires_at_index` (`expires_at`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `personal_access_tokens`
--

LOCK TABLES `personal_access_tokens` WRITE;
/*!40000 ALTER TABLE `personal_access_tokens` DISABLE KEYS */;
INSERT INTO `personal_access_tokens` VALUES (1,'App\\Models\\Usuario',1,'sigc-token','c666c8d50d9d123cae54c0b75c069c2164038f5780dc64a0dae46c4c699919c0','[\"*\"]','2026-10-14 01:12:48',NULL,'2026-10-10 17:35:52','2026-10-14 01:12:48'),(2,'App\\Models\\Usuario',2,'sigc-token','39566382f8a788bf8c55b8f6ab54da21a765e5a9bfb8745f9c4703c75e3bd898','[\"*\"]','2026-10-10 23:20:11',NULL,'2026-10-10 21:27:54','2026-10-10 23:20:11'),(3,'App\\Models\\Usuario',1,'sigc-token','b4a5955c3438010debce70a0b78f3ebea9b0dd8db9048341794b428895acdfc0','[\"*\"]','2026-10-25 00:06:54',NULL,'2026-10-24 17:59:28','2026-10-25 00:06:54');
/*!40000 ALTER TABLE `personal_access_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `provincias`
--

DROP TABLE IF EXISTS `provincias`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `provincias` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `provincias`
--

LOCK TABLES `provincias` WRITE;
/*!40000 ALTER TABLE `provincias` DISABLE KEYS */;
INSERT INTO `provincias` VALUES (1,'San Jose','2026-08-24 05:26:28','2026-08-24 05:26:28'),(2,'Alajuela','2026-08-24 05:26:28','2026-08-24 05:26:28'),(3,'Cartago','2026-08-24 05:26:28','2026-08-24 05:26:28'),(4,'Heredia','2026-08-24 05:26:28','2026-08-24 05:26:28'),(5,'Guanacaste','2026-08-24 05:26:28','2026-08-24 05:26:28'),(6,'Puntarenas','2026-08-24 05:26:28','2026-08-24 05:26:28'),(7,'Limon','2026-08-24 05:26:28','2026-08-24 05:26:28'),(8,'San Carlos','2026-08-25 08:32:14','2026-08-25 08:32:14');
/*!40000 ALTER TABLE `provincias` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reportes`
--

DROP TABLE IF EXISTS `reportes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reportes` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `tipo` enum('Contratos','Reservas','Vallas','Clientes','Financiero') COLLATE utf8mb4_unicode_ci NOT NULL,
  `formato` enum('PDF','Excel','Ambos') COLLATE utf8mb4_unicode_ci NOT NULL,
  `filtros` json DEFAULT NULL,
  `archivo_pdf` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `archivo_excel` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `usuario_id` bigint unsigned NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `reportes_usuario_id_foreign` (`usuario_id`),
  CONSTRAINT `reportes_usuario_id_foreign` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reportes`
--

LOCK TABLES `reportes` WRITE;
/*!40000 ALTER TABLE `reportes` DISABLE KEYS */;
/*!40000 ALTER TABLE `reportes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reservas`
--

DROP TABLE IF EXISTS `reservas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reservas` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `valla_id` bigint unsigned NOT NULL,
  `cliente_id` bigint unsigned NOT NULL,
  `usuario_id` bigint unsigned NOT NULL,
  `fecha_reserva` date NOT NULL,
  `fecha_vencimiento` date NOT NULL,
  `estado` enum('Activa','Convertida','Vencida','Cancelada') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Activa',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `reservas_valla_id_foreign` (`valla_id`),
  KEY `reservas_cliente_id_foreign` (`cliente_id`),
  KEY `reservas_usuario_id_foreign` (`usuario_id`),
  CONSTRAINT `reservas_cliente_id_foreign` FOREIGN KEY (`cliente_id`) REFERENCES `clientes` (`id`),
  CONSTRAINT `reservas_usuario_id_foreign` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `reservas_valla_id_foreign` FOREIGN KEY (`valla_id`) REFERENCES `vallas` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reservas`
--

LOCK TABLES `reservas` WRITE;
/*!40000 ALTER TABLE `reservas` DISABLE KEYS */;
INSERT INTO `reservas` VALUES (1,1,1,1,'2026-10-10','2026-10-13','Convertida','2026-10-10 21:53:24','2026-10-10 21:55:28'),(2,2,2,1,'2026-10-10','2026-10-12','Cancelada','2026-10-10 21:54:35','2026-10-10 22:41:34'),(3,3,3,1,'2026-10-10','2026-10-11','Convertida','2026-10-10 22:39:44','2026-10-10 22:41:09'),(4,2,4,1,'2026-10-10','2026-10-13','Vencida','2026-10-10 22:41:57','2026-10-17 00:45:14'),(5,1,6,2,'2026-10-24','2026-10-27','Activa','2026-10-24 18:43:00','2026-10-24 18:43:00'),(6,2,6,2,'2026-10-24','2026-10-27','Activa','2026-10-24 18:43:00','2026-10-24 18:43:00'),(7,3,7,1,'2026-10-24','2026-10-27','Cancelada','2026-10-24 18:45:16','2026-10-24 18:47:27'),(8,3,8,2,'2026-10-24','2026-10-27','Activa','2026-10-24 18:50:19','2026-10-24 18:50:19');
/*!40000 ALTER TABLE `reservas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `roles` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `nombre` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES (1,'Administrador Sistema','Control total del sistema: usuarios, roles y configuracion tecnica.','2026-08-24 05:26:28','2026-08-24 05:26:28'),(2,'Ejecutivo','Gestiona vallas, reservas, contratos (solo los propios) y clientes.','2026-08-24 05:26:28','2026-08-24 05:26:28'),(3,'Dueño','Solo lectura de toda la informacion, vista general de alto nivel.','2026-08-24 05:26:28','2026-08-24 05:26:28'),(4,'Administrador Empresa','Solo lectura de toda la informacion, con acceso a reportes detallados y exportables.','2026-09-05 04:54:36','2026-09-05 04:54:36'),(5,'Contable','Solo lectura de contratos e informacion financiera, sin acceso a datos operativos.','2026-09-05 04:54:36','2026-09-05 04:54:36');
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `solicitud_portal_vallas`
--

DROP TABLE IF EXISTS `solicitud_portal_vallas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `solicitud_portal_vallas` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `solicitud_portal_id` bigint unsigned NOT NULL,
  `valla_id` bigint unsigned NOT NULL,
  `precio_mostrado` decimal(10,2) DEFAULT NULL COMMENT 'Precio normal que vio el cliente al solicitar',
  `reserva_id` bigint unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `solicitud_portal_vallas_solicitud_portal_id_valla_id_unique` (`solicitud_portal_id`,`valla_id`),
  KEY `solicitud_portal_vallas_valla_id_foreign` (`valla_id`),
  KEY `solicitud_portal_vallas_reserva_id_foreign` (`reserva_id`),
  CONSTRAINT `solicitud_portal_vallas_reserva_id_foreign` FOREIGN KEY (`reserva_id`) REFERENCES `reservas` (`id`) ON DELETE SET NULL,
  CONSTRAINT `solicitud_portal_vallas_solicitud_portal_id_foreign` FOREIGN KEY (`solicitud_portal_id`) REFERENCES `solicitudes_portal` (`id`) ON DELETE CASCADE,
  CONSTRAINT `solicitud_portal_vallas_valla_id_foreign` FOREIGN KEY (`valla_id`) REFERENCES `vallas` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `solicitud_portal_vallas`
--

LOCK TABLES `solicitud_portal_vallas` WRITE;
/*!40000 ALTER TABLE `solicitud_portal_vallas` DISABLE KEYS */;
INSERT INTO `solicitud_portal_vallas` VALUES (1,1,2,2500.00,NULL),(2,1,3,3500.00,NULL),(3,2,2,2500.00,NULL),(4,3,2,2500.00,NULL),(5,4,2,2500.00,NULL),(6,4,3,3500.00,NULL),(7,5,1,500.00,5),(8,5,2,2500.00,6),(9,6,3,3500.00,8);
/*!40000 ALTER TABLE `solicitud_portal_vallas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `solicitudes_portal`
--

DROP TABLE IF EXISTS `solicitudes_portal`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `solicitudes_portal` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `codigo` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `token` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `nombre` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `empresa` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `telefono` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `correo` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `mensaje` text COLLATE utf8mb4_unicode_ci,
  `fecha_inicio_deseada` date DEFAULT NULL,
  `plazo_meses_deseado` smallint unsigned DEFAULT NULL,
  `usuario_id` bigint unsigned DEFAULT NULL,
  `estado` enum('Nueva','En seguimiento','Cerrada') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Nueva',
  `atendida_en` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `usuario_turno_id` bigint unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `solicitudes_portal_codigo_unique` (`codigo`),
  UNIQUE KEY `solicitudes_portal_token_unique` (`token`),
  KEY `solicitudes_portal_usuario_id_foreign` (`usuario_id`),
  KEY `solicitudes_portal_usuario_turno_id_foreign` (`usuario_turno_id`),
  CONSTRAINT `solicitudes_portal_usuario_id_foreign` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL,
  CONSTRAINT `solicitudes_portal_usuario_turno_id_foreign` FOREIGN KEY (`usuario_turno_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `solicitudes_portal`
--

LOCK TABLES `solicitudes_portal` WRITE;
/*!40000 ALTER TABLE `solicitudes_portal` DISABLE KEYS */;
INSERT INTO `solicitudes_portal` VALUES (1,'SOL-0001','cG19dpY89h4Sg27T6uzt4E4MBPH3XKdvScNuVSG2','Jose Alexis Soro',NULL,'+50663323368','tp.soro@gmail.com',NULL,'2026-10-30',3,2,'Cerrada','2026-10-24 18:13:02','2026-10-14 02:45:25','2026-10-24 18:41:42',2),(2,'SOL-0002','hcC8qGU1RRMSk050XeumPwnMunGLDxFXWLFtNoRp','Jose Alexis Soro',NULL,'+50663323368','tp.soro@gmail.com',NULL,NULL,NULL,2,'Cerrada','2026-10-24 18:00:09','2026-10-14 03:22:34','2026-10-24 18:00:36',2),(3,'SOL-0003','l55VU09Puch6fWUmIxcd1M4tb2qvyJfNHAIpsJCn','Isabella Soro',NULL,'72576293','isa@gmail.com',NULL,'2026-10-31',6,2,'Cerrada','2026-10-24 18:12:49','2026-10-24 18:11:56','2026-10-24 18:41:36',2),(4,'SOL-0004','y3rPHytkDlek1oXYkGYbtgjCSgKtQz2tYKryIFIi','Yoselin',NULL,'63323368','tp.soro@gmail.com',NULL,NULL,3,2,'Cerrada','2026-10-24 18:41:29','2026-10-24 18:25:17','2026-10-24 18:41:32',2),(5,'SOL-0005','7tang8YODSPbLaJp5qrJZf1lHRq5aZ5VjsblvC2F','Ismael Soro','DHL','63323368','tp.soro@gmail.com',NULL,NULL,3,2,'En seguimiento','2026-10-24 18:44:36','2026-10-24 18:43:00','2026-10-24 18:44:36',2),(6,'SOL-0006','TKku6OTTWPXxKWPIz7eDO8giR3R3ry7GZuSzsTL2','sara',NULL,'23453456','qqq@qqq.com',NULL,NULL,1,2,'Nueva',NULL,'2026-10-24 18:50:18','2026-10-24 18:50:19',2);
/*!40000 ALTER TABLE `solicitudes_portal` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuarios`
--

DROP TABLE IF EXISTS `usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuarios` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `rol_id` bigint unsigned NOT NULL,
  `nombre` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `correo` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `estado` enum('Activo','Inactivo') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Activo',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `turno_portal` smallint unsigned DEFAULT NULL COMMENT 'Orden de turno (1, 2, 3...) para recibir solicitudes del portal',
  PRIMARY KEY (`id`),
  UNIQUE KEY `usuarios_correo_unique` (`correo`),
  KEY `usuarios_rol_id_foreign` (`rol_id`),
  CONSTRAINT `usuarios_rol_id_foreign` FOREIGN KEY (`rol_id`) REFERENCES `roles` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuarios`
--

LOCK TABLES `usuarios` WRITE;
/*!40000 ALTER TABLE `usuarios` DISABLE KEYS */;
INSERT INTO `usuarios` VALUES (1,1,'Admin Sistema','produccionroman@gmail.com','$2y$12$LEMi/YsZOeQiyxJ0IBWAYehdT3E5OeJZspGdgqFz//6Ta5ZxVzDdy','Activo','2026-10-10 17:35:26','2026-10-24 17:58:42',NULL),(2,2,'Usuario de prueba','prueba@gmail.com','$2y$12$tUw6nbaBgW5gN8Xh4dlDI.1fBc90PtbyFe5YGfwPuPG5wiukcgZc.','Activo','2026-10-10 21:26:29','2026-10-10 21:26:29',NULL);
/*!40000 ALTER TABLE `usuarios` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `vallas`
--

DROP TABLE IF EXISTS `vallas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `vallas` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `provincia_id` bigint unsigned NOT NULL,
  `codigo` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Permanente e inmutable, nunca se reutiliza',
  `referencia` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `latitud` decimal(10,7) NOT NULL,
  `longitud` decimal(10,7) NOT NULL,
  `tamano` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `vehiculos_diarios` int unsigned DEFAULT NULL,
  `precio_normal` decimal(10,2) DEFAULT NULL,
  `precio_minimo` decimal(10,2) DEFAULT NULL,
  `precio_instalacion` decimal(10,2) DEFAULT NULL,
  `estado` enum('Disponible','Reservada','Alquilada','Mantenimiento','Inactiva') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Disponible',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `vallas_codigo_unique` (`codigo`),
  KEY `vallas_provincia_id_foreign` (`provincia_id`),
  CONSTRAINT `vallas_provincia_id_foreign` FOREIGN KEY (`provincia_id`) REFERENCES `provincias` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `vallas`
--

LOCK TABLES `vallas` WRITE;
/*!40000 ALTER TABLE `vallas` DISABLE KEYS */;
INSERT INTO `vallas` VALUES (1,8,'Q-001','LOS ANGELES Fortuna',10.4576350,-84.5495720,'6x2',54876,500.00,500.00,350.00,'Reservada','2026-10-10 21:30:57','2026-10-24 18:43:00'),(2,1,'SJ-001','Guadalupe',9.6500000,-84.1500000,'6x8',89995,2500.00,2000.00,1500.00,'Reservada','2026-10-10 21:33:33','2026-10-24 18:43:00'),(3,2,'A-001','Radial Alajuela',9.7896000,-82.3647000,'10x5m',75000,3500.00,3000.00,1850.00,'Reservada','2026-10-10 22:39:14','2026-10-24 18:50:19');
/*!40000 ALTER TABLE `vallas` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-10-24 20:42:57
