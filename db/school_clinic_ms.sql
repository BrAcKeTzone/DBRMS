-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Feb 18, 2026 at 06:04 PM
-- Server version: 10.4.28-MariaDB
-- PHP Version: 8.2.4

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `school_clinic_ms`
--

-- --------------------------------------------------------

--
-- Table structure for table `activitylog`
--

CREATE TABLE `activitylog` (
  `id` int(11) NOT NULL,
  `userId` int(11) DEFAULT NULL,
  `action` varchar(191) NOT NULL,
  `details` text DEFAULT NULL,
  `ipAddress` varchar(191) DEFAULT NULL,
  `userAgent` varchar(191) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `activitylog`
--

INSERT INTO `activitylog` (`id`, `userId`, `action`, `details`, `ipAddress`, `userAgent`, `createdAt`) VALUES
(1, NULL, 'OTP_SENT', 'email:jpskiemaniwang@gmail.com', NULL, NULL, '2026-02-08 19:09:01.434'),
(2, NULL, 'OTP_VERIFIED', 'email:jpskiemaniwang@gmail.com', NULL, NULL, '2026-02-08 19:09:32.383'),
(3, 1, 'USER_REGISTERED', '{\"email\":\"jpskiemaniwang@gmail.com\",\"phone\":\"+639692334163\"}', NULL, NULL, '2026-02-08 19:09:49.508'),
(4, 1, 'USER_LOGIN_SUCCESS', NULL, NULL, NULL, '2026-02-08 19:32:35.058'),
(5, 1, 'USER_LOGIN_SUCCESS', NULL, NULL, NULL, '2026-02-08 19:47:34.910'),
(6, 1, 'USER_LOGIN_SUCCESS', NULL, NULL, NULL, '2026-02-11 13:16:36.690'),
(7, 1, 'PASSWORD_CHANGED', NULL, NULL, NULL, '2026-02-11 14:05:27.912'),
(8, 1, 'USER_LOGIN_SUCCESS', NULL, NULL, NULL, '2026-02-13 00:40:13.594'),
(9, 2, 'USER_LOGIN_SUCCESS', NULL, NULL, NULL, '2026-02-13 13:20:42.847'),
(10, 1, 'USER_LOGIN_SUCCESS', NULL, NULL, NULL, '2026-02-17 14:29:52.876'),
(11, NULL, 'USER_LOGIN_FAILED', 'email:jhulpona@duck.com', NULL, NULL, '2026-02-17 16:32:59.237'),
(12, 2, 'USER_LOGIN_SUCCESS', NULL, NULL, NULL, '2026-02-17 16:33:09.662'),
(13, 1, 'USER_LOGIN_SUCCESS', NULL, NULL, NULL, '2026-02-18 10:33:51.781'),
(14, 1, 'USER_LOGIN_SUCCESS', NULL, NULL, NULL, '2026-02-18 10:46:57.355'),
(15, 1, 'USER_LOGIN_SUCCESS', NULL, NULL, NULL, '2026-02-18 10:47:27.179'),
(16, 1, 'USER_LOGIN_SUCCESS', NULL, NULL, NULL, '2026-02-18 10:47:36.088');

-- --------------------------------------------------------

--
-- Table structure for table `clinicvisit`
--

CREATE TABLE `clinicvisit` (
  `id` int(11) NOT NULL,
  `studentId` int(11) NOT NULL,
  `visitDateTime` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `symptoms` text NOT NULL,
  `bloodPressure` varchar(191) DEFAULT NULL,
  `pulseRate` varchar(191) DEFAULT NULL,
  `diagnosis` text DEFAULT NULL,
  `treatment` text DEFAULT NULL,
  `isEmergency` tinyint(1) NOT NULL DEFAULT 0,
  `isReferredToHospital` tinyint(1) NOT NULL DEFAULT 0,
  `hospitalName` varchar(191) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  `temperature` varchar(191) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `clinicvisit`
--

INSERT INTO `clinicvisit` (`id`, `studentId`, `visitDateTime`, `symptoms`, `bloodPressure`, `pulseRate`, `diagnosis`, `treatment`, `isEmergency`, `isReferredToHospital`, `hospitalName`, `createdAt`, `updatedAt`, `temperature`) VALUES
(1, 5, '2026-02-08 23:29:00.000', 'Sakit Tiyan', '', '', 'Wala ray ligo', 'Gipainom ug Loperamide', 1, 0, '', '2026-02-08 23:32:42.324', '2026-02-08 23:32:42.324', ''),
(2, 5, '2026-02-08 23:37:00.000', 'Sample Symtoms', '', '', 'Walay Ligo', 'Sample Treatment', 0, 0, '', '2026-02-08 23:37:55.916', '2026-02-08 23:37:55.916', '38'),
(4, 5, '2026-02-13 12:43:00.000', 'Sample', '45/88', '66', 'Walay ligo lang', 'Given paracetamol', 1, 0, '', '2026-02-13 12:44:17.483', '2026-02-13 12:44:17.483', '55'),
(5, 5, '2026-02-13 12:51:00.000', 'asdasdasd', '35', '52', 'as faase egs ', 'afsgseth dh', 0, 0, '', '2026-02-13 12:51:45.369', '2026-02-13 12:51:45.369', '23'),
(6, 5, '2026-02-13 13:36:00.000', 'asd', '', '', '', '', 0, 0, '', '2026-02-13 13:36:23.631', '2026-02-13 13:36:23.631', '');

-- --------------------------------------------------------

--
-- Table structure for table `course`
--

CREATE TABLE `course` (
  `id` int(11) NOT NULL,
  `code` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `description` varchar(191) DEFAULT NULL,
  `createdById` int(11) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `course`
--

INSERT INTO `course` (`id`, `code`, `name`, `description`, `createdById`, `createdAt`, `updatedAt`) VALUES
(1, 'BSIT', 'Bachelor of IT', NULL, 1, '2026-02-08 19:10:15.342', '2026-02-08 19:10:15.342');

-- --------------------------------------------------------

--
-- Table structure for table `healthmetric`
--

CREATE TABLE `healthmetric` (
  `id` int(11) NOT NULL,
  `studentId` int(11) NOT NULL,
  `year` int(11) NOT NULL,
  `heightCm` double DEFAULT NULL,
  `weightKg` double DEFAULT NULL,
  `bmi` double DEFAULT NULL,
  `bloodType` varchar(191) DEFAULT NULL,
  `allergies` text DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `otp`
--

CREATE TABLE `otp` (
  `id` int(11) NOT NULL,
  `email` varchar(191) NOT NULL,
  `otp` varchar(191) NOT NULL,
  `verified` tinyint(1) NOT NULL DEFAULT 0,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `expiresAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `otp`
--

INSERT INTO `otp` (`id`, `email`, `otp`, `verified`, `createdAt`, `expiresAt`) VALUES
(2, 'jpskiemaniwang@gmail.com', '486515', 0, '2026-02-11 13:53:52.238', '2026-02-11 14:03:52.236');

-- --------------------------------------------------------

--
-- Table structure for table `smslog`
--

CREATE TABLE `smslog` (
  `id` int(11) NOT NULL,
  `clinicVisitId` int(11) DEFAULT NULL,
  `message` text NOT NULL,
  `status` varchar(191) NOT NULL,
  `sentAt` datetime(3) DEFAULT NULL,
  `failReason` varchar(191) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `recipientName` varchar(191) DEFAULT NULL,
  `recipientPhone` varchar(191) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `smslog`
--

INSERT INTO `smslog` (`id`, `clinicVisitId`, `message`, `status`, `sentAt`, `failReason`, `createdAt`, `recipientName`, `recipientPhone`) VALUES
(1, 1, 'BCFI School Clinic Alert: Your child Juana Sampless visited the clinic on Feb 9, 2026, 7:29 AM. Symptoms: Sakit Tiyan. Diagnosis: Pending.\n\nAutomated message. Please do not reply.', 'SENT', '2026-02-08 23:39:27.375', NULL, '2026-02-08 23:32:42.391', 'JP Nems', '09277992618'),
(2, NULL, 'BCFI School Clinic Management System: This is a test message to verify your SMS configuration. If you received this, your settings are working correctly!', 'SENT', '2026-02-08 23:35:18.253', NULL, '2026-02-08 23:35:18.254', 'Test SMS', '09510091876'),
(3, 2, 'BCFI School Clinic Alert: Your child Juana Sampless visited the clinic on Feb 9, 2026, 7:37 AM. Symptoms: Sample Symtoms. Diagnosis: Pending.\n\nAutomated message. Please do not reply.', 'SENT', '2026-02-08 23:37:58.470', NULL, '2026-02-08 23:37:58.472', 'JP Nems', '09510091876'),
(5, 4, 'BCFI School Clinic Alert: Your child Juana Sampless visited the clinic on Feb 13, 2026, 8:43 PM. Symptoms: Sample. Diagnosis: Pending.\n\nAutomated message. Please do not reply.', 'SENT', '2026-02-13 12:51:06.750', NULL, '2026-02-13 12:44:21.662', 'JP Nems', '09277992618'),
(6, 5, 'BCFI Clinic Update\nStudent: Juana Sampless\nDate: Feb 13, 2026, 8:51 PM\nReason: asdasdasd\nBlood Pressure: 35 mmHg\nTemperature: 23 °C\nPulse: 52 bpm\nDiagnosis: as faase egs \nTreatment: afsgseth dh\nEmergency: NO\nHospital: N/A\n\nAutomated message. Please do not reply.', 'SENT', '2026-02-13 12:51:50.389', NULL, '2026-02-13 12:51:50.392', 'JP Nems', '09277992618'),
(7, NULL, 'BCFI School Clinic Management System: This is a test message to verify your SMS configuration. If you received this, your settings are working correctly!', 'SENT', '2026-02-13 13:05:08.834', NULL, '2026-02-13 13:05:08.835', 'Test SMS', '09277992618'),
(8, 6, 'BCFI Clinic Alert\nStudent: Juana Sampless\nDate: Feb 13, 2026, 9:36 PM\nReason: asd\nBlood Pressure: N/A mmHg\nTemperature: N/A °C\nPulse: N/A bpm\nDiagnosis: Pending\nTreatment: Pending\nEmergency: NO\nHospital: N/A\n\nAutomated message. Please do not reply.', 'SENT', '2026-02-13 13:36:28.111', NULL, '2026-02-13 13:36:28.112', 'JP Nems', '09277992618');

-- --------------------------------------------------------

--
-- Table structure for table `student`
--

CREATE TABLE `student` (
  `id` int(11) NOT NULL,
  `studentId` varchar(191) NOT NULL,
  `firstName` varchar(191) NOT NULL,
  `lastName` varchar(191) NOT NULL,
  `middleName` varchar(191) DEFAULT NULL,
  `sex` enum('MALE','FEMALE') NOT NULL DEFAULT 'MALE',
  `birthDate` datetime(3) NOT NULL,
  `status` enum('ACTIVE','INACTIVE','GRADUATED') NOT NULL DEFAULT 'ACTIVE',
  `courseId` int(11) DEFAULT NULL,
  `parentId` int(11) DEFAULT NULL,
  `linkStatus` enum('PENDING','APPROVED','REJECTED') NOT NULL DEFAULT 'PENDING',
  `relationship` varchar(191) DEFAULT NULL,
  `rejectionReason` varchar(191) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  `allergies` text DEFAULT NULL,
  `bloodType` varchar(5) DEFAULT NULL,
  `height` double DEFAULT NULL,
  `weight` double DEFAULT NULL,
  `yearLevel` varchar(50) DEFAULT NULL,
  `emergencyContactName` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `student`
--

INSERT INTO `student` (`id`, `studentId`, `firstName`, `lastName`, `middleName`, `sex`, `birthDate`, `status`, `courseId`, `parentId`, `linkStatus`, `relationship`, `rejectionReason`, `createdAt`, `updatedAt`, `allergies`, `bloodType`, `height`, `weight`, `yearLevel`, `emergencyContactName`) VALUES
(2, '2025-12345', 'John Paul', 'Maniwang', '', 'MALE', '2003-07-07 00:00:00.000', 'ACTIVE', 1, NULL, 'PENDING', NULL, NULL, '2026-02-08 20:02:40.719', '2026-02-08 20:13:20.029', '', 'A-', 0, 0, '2nd Year College', NULL),
(5, '2024-15345', 'Juana', 'Sampless', NULL, 'FEMALE', '2008-06-08 00:00:00.000', 'ACTIVE', NULL, 2, 'APPROVED', 'PARENT', 'nothing', '2026-02-08 20:43:20.890', '2026-02-13 13:22:12.293', 'Peanuts', 'O+', 150, 45, 'Grade 7', NULL),
(6, '2026-12345', 'Charrize', 'Hista', '', 'FEMALE', '2003-07-07 00:00:00.000', 'ACTIVE', NULL, NULL, 'PENDING', NULL, NULL, '2026-02-08 23:24:18.370', '2026-02-08 23:24:40.961', '', '', 0, 0, 'Grade 10', NULL),
(7, '2024-12045', 'Juan', 'Dela Cruz', 'Santos', 'MALE', '2002-06-08 00:00:00.000', 'ACTIVE', NULL, 2, 'PENDING', 'PARENT', NULL, '2026-02-13 00:46:04.878', '2026-02-17 16:54:22.414', 'Peanuts', 'O+', 150, 45, 'Grade 7', 'Jane Dela Cruzzz'),
(8, '2026-12453', 'Jooh', 'Hey', 'Noo', 'FEMALE', '2003-07-08 00:00:00.000', 'ACTIVE', NULL, NULL, 'PENDING', NULL, NULL, '2026-02-13 00:46:04.878', '2026-02-13 00:46:04.878', NULL, NULL, NULL, NULL, 'Grade 7', NULL),
(9, '2021-09879', 'Noel', 'Leon', '', 'FEMALE', '2003-07-07 00:00:00.000', 'ACTIVE', NULL, NULL, 'PENDING', NULL, NULL, '2026-02-17 16:31:29.249', '2026-02-17 16:31:43.079', '', 'A+', 0, 0, 'Grade 8', 'John Paul Maniwangs'),
(10, '2024-12345', 'Juan', 'Dela Cruz', 'Santos', 'MALE', '2008-06-08 00:00:00.000', 'ACTIVE', NULL, NULL, 'PENDING', NULL, NULL, '2026-02-17 17:09:05.380', '2026-02-17 17:09:05.380', 'Peanuts', 'O+', 150, 45, 'Grade 7', 'Jane Dela Cruz');

-- --------------------------------------------------------

--
-- Table structure for table `studentlinkrequest`
--

CREATE TABLE `studentlinkrequest` (
  `id` int(11) NOT NULL,
  `studentId` int(11) NOT NULL,
  `parentId` int(11) NOT NULL,
  `status` enum('PENDING','APPROVED','REJECTED') NOT NULL DEFAULT 'PENDING',
  `reason` varchar(191) DEFAULT NULL,
  `approvedById` int(11) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `systemsetting`
--

CREATE TABLE `systemsetting` (
  `id` int(11) NOT NULL,
  `key` varchar(191) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  `defaultTemplate` text DEFAULT NULL,
  `enableSMSNotifications` tinyint(1) NOT NULL DEFAULT 1,
  `senderName` varchar(191) DEFAULT NULL,
  `smsApiKey` varchar(191) DEFAULT NULL,
  `updatedById` int(11) DEFAULT NULL,
  `lastBackup` varchar(191) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `systemsetting`
--

INSERT INTO `systemsetting` (`id`, `key`, `createdAt`, `updatedAt`, `defaultTemplate`, `enableSMSNotifications`, `senderName`, `smsApiKey`, `updatedById`, `lastBackup`) VALUES
(1, 'system_config', '2026-02-08 20:46:02.857', '2026-02-08 23:34:39.846', 'BCFI School Clinic Alert: Your child {student} visited the clinic on {date}. Symptoms: {reason}. Diagnosis: Pending.', 1, '6981332e0450813c9a3efe77', '437969e5-c651-4ab3-a3b0-58a58bb16e54', 1, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `user`
--

CREATE TABLE `user` (
  `id` int(11) NOT NULL,
  `email` varchar(191) NOT NULL,
  `password` varchar(191) NOT NULL,
  `firstName` varchar(191) NOT NULL,
  `middleName` varchar(191) DEFAULT NULL,
  `lastName` varchar(191) NOT NULL,
  `phone` varchar(191) NOT NULL,
  `profilePicture` varchar(191) DEFAULT NULL,
  `role` enum('CLINIC_STAFF','PARENT_GUARDIAN') NOT NULL DEFAULT 'PARENT_GUARDIAN',
  `isActive` tinyint(1) NOT NULL DEFAULT 1,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `user`
--

INSERT INTO `user` (`id`, `email`, `password`, `firstName`, `middleName`, `lastName`, `phone`, `profilePicture`, `role`, `isActive`, `createdAt`, `updatedAt`) VALUES
(1, 'jpskiemaniwang@gmail.com', '$2a$12$/q0YLvnakrPu/Inb6RCDfu1EaJvwFIEQBaSajs.it.tQxg8xbWzdW', 'John Paul', 'Aranjuez', 'Maniwang', '+639692334163', NULL, 'CLINIC_STAFF', 1, '2026-02-08 19:09:49.483', '2026-02-11 14:05:27.885'),
(2, 'sample@gmail.com', '$2b$12$m121GLyrphO6FDU5fq3Rqec3reBoocMhD8wodyg67VlV0udVenc6K', 'JP', NULL, 'Nems', '09277992618', NULL, 'PARENT_GUARDIAN', 1, '2026-02-08 23:17:40.278', '2026-02-08 23:17:40.278');

-- --------------------------------------------------------

--
-- Table structure for table `_prisma_migrations`
--

CREATE TABLE `_prisma_migrations` (
  `id` varchar(36) NOT NULL,
  `checksum` varchar(64) NOT NULL,
  `finished_at` datetime(3) DEFAULT NULL,
  `migration_name` varchar(255) NOT NULL,
  `logs` text DEFAULT NULL,
  `rolled_back_at` datetime(3) DEFAULT NULL,
  `started_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `applied_steps_count` int(10) UNSIGNED NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `_prisma_migrations`
--

INSERT INTO `_prisma_migrations` (`id`, `checksum`, `finished_at`, `migration_name`, `logs`, `rolled_back_at`, `started_at`, `applied_steps_count`) VALUES
('1b3a9f78-16f4-47f5-bfac-bfa2a2f7d180', '2d5b8667e7566629743f82a7402861dc7dc79ca8762082cc446eea1ebfc19d0b', '2026-02-08 19:08:34.318', '20260203062553_remove_clinic_admin_role', NULL, NULL, '2026-02-08 19:08:34.251', 1),
('1f08debf-acbb-4b82-809b-3943ed55893e', '05dfc7704166a5279c895a04401678551d63d1bf76e2faf46c1381413c46520f', '2026-02-08 19:08:34.093', '20260121095641_add_year_level_to_student', NULL, NULL, '2026-02-08 19:08:34.081', 1),
('226f0d6c-d7a7-4809-8563-0dd6643fead0', 'a148eb4a9619e650d91fed1a03a282900d650135ccbb6d0015f11f37366940a2', '2026-02-08 19:24:26.731', '20260208192426_add_student_level_and_make_course_optional', NULL, NULL, '2026-02-08 19:24:26.519', 1),
('39c49ff4-20c6-4a29-bbec-f0f2e4d6bc2c', '9e92f4dc69ca9b480a29d9551f33a46f4716f0cafe7bbd7e5394be47daf1e478', '2026-02-08 19:08:34.410', '20260208162923_make_clinic_visit_id_optional_in_sms_log', NULL, NULL, '2026-02-08 19:08:34.358', 1),
('532da0ec-a131-45ec-8e3b-4ec2d77ec238', '53505763d8e7ce33c13f0fff0c3a4eb8086bf2a1458e0d4064a528d7073834a4', '2026-02-08 19:08:34.490', '20260208185044_update_student_year_level_required', NULL, NULL, '2026-02-08 19:08:34.412', 1),
('5c2007a4-a0ed-4e24-b6e7-d187879261b3', '6829b3ba3c835935780ec243b0bb2a2a8c4eb3c6c9bc945adbc02246e48344b8', '2026-02-08 19:08:33.893', '20251227132941', NULL, NULL, '2026-02-08 19:08:33.462', 1),
('6c5c8cff-0dad-41fa-9ec1-e92d1bf47df9', 'c1d64a074adae05cb4552748666003899a24ab779d46c3caa8643e5ba0d85538', '2026-02-08 19:08:34.342', '20260208141316_add_recipient_to_smslog', NULL, NULL, '2026-02-08 19:08:34.320', 1),
('72b3bf51-763a-4ba4-90a9-7dda803cfb8d', 'ef75e40038d2bce6baf62aa382cbdd181dd1c1cb85705a8d0d9d59990ed94c4b', '2026-02-17 16:03:31.833', '20260217160331_add_emergency_contact_name_to_student', NULL, NULL, '2026-02-17 16:03:31.813', 1),
('78816ec4-b3f5-44af-8274-fff0065b626d', '6dd2bf79edd1ddbb0c60543827f908c577a946572a836f6dd0fa2ffec632bb0e', '2026-02-08 19:30:26.662', '20260208193026_make_course_field_optional', NULL, NULL, '2026-02-08 19:30:26.634', 1),
('7ab2ba68-faf2-4f00-9637-99671f51410d', 'eaf72d171f77711f0312ae168cef940f6f231b3c88ad57c38703d7bf17b6fb15', '2026-02-08 19:08:34.357', '20260208141625_add_recipient_fields_to_sms_log', NULL, NULL, '2026-02-08 19:08:34.344', 1),
('968bc2c2-426d-4f1d-afdc-bdc25137d669', '7fee3c9d3bbd87d3af3da00b2da8fefce6a023740413e1a9a83a53a19eac552e', '2026-02-08 19:08:34.227', '20260125094249_add_sms_settings_and_tracking', NULL, NULL, '2026-02-08 19:08:34.095', 1),
('a7e7feb2-70d1-40d9-9c8f-25a2a34a2235', 'ea35f2b2479307e1b77e5b5742a5274a7ee09200eae0472b55a0a29dd84c28cf', '2026-02-08 19:08:34.079', '20260119101339_add_height_and_weight_to_student', NULL, NULL, '2026-02-08 19:08:34.066', 1),
('a960cfcc-a638-4af9-a2ff-f927be17071d', '06e2efe162e3ae4a1021fa7b505037601e28df48cd55dbe6e7b031f3b616dc2c', '2026-02-08 19:08:34.614', '20260208185317_expand_year_level_field', NULL, NULL, '2026-02-08 19:08:34.493', 1),
('c111fb73-eee5-4865-8abc-aac3a4bc85bb', '5e503d60e7cfa503a981faec97b4805008887620818cb0bd8982411fefb17763', '2026-02-08 19:08:34.064', '20260119093730_add_bloodtype_and_allergies_to_student', NULL, NULL, '2026-02-08 19:08:34.043', 1),
('d1f79edc-afd0-4d56-a9b4-60d998db5964', '8b074681fdd3c12d4115a6939966a51525e1ca22a6246d7f8e55ab6005a00759', '2026-02-08 19:08:34.041', '20251227143311_updated_clinic_visit_fields', NULL, NULL, '2026-02-08 19:08:33.895', 1),
('f71c0e0a-d31a-440d-8088-eb68a8368fef', 'ad856603c751efcc5cd0e74285b03e2b8c669e62c73848a04343b1db9560a5b1', '2026-02-08 19:08:34.250', '20260125100536_simplify_system_settings', NULL, NULL, '2026-02-08 19:08:34.229', 1);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `activitylog`
--
ALTER TABLE `activitylog`
  ADD PRIMARY KEY (`id`),
  ADD KEY `ActivityLog_userId_idx` (`userId`),
  ADD KEY `ActivityLog_action_idx` (`action`);

--
-- Indexes for table `clinicvisit`
--
ALTER TABLE `clinicvisit`
  ADD PRIMARY KEY (`id`),
  ADD KEY `ClinicVisit_studentId_idx` (`studentId`),
  ADD KEY `ClinicVisit_visitDateTime_idx` (`visitDateTime`);

--
-- Indexes for table `course`
--
ALTER TABLE `course`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `Course_code_key` (`code`),
  ADD UNIQUE KEY `Course_name_key` (`name`),
  ADD KEY `Course_createdById_fkey` (`createdById`);

--
-- Indexes for table `healthmetric`
--
ALTER TABLE `healthmetric`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `HealthMetric_studentId_year_key` (`studentId`,`year`);

--
-- Indexes for table `otp`
--
ALTER TABLE `otp`
  ADD PRIMARY KEY (`id`),
  ADD KEY `Otp_email_idx` (`email`);

--
-- Indexes for table `smslog`
--
ALTER TABLE `smslog`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `SmsLog_clinicVisitId_key` (`clinicVisitId`);

--
-- Indexes for table `student`
--
ALTER TABLE `student`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `Student_studentId_key` (`studentId`),
  ADD KEY `Student_studentId_idx` (`studentId`),
  ADD KEY `Student_parentId_idx` (`parentId`),
  ADD KEY `Student_courseId_idx` (`courseId`);

--
-- Indexes for table `studentlinkrequest`
--
ALTER TABLE `studentlinkrequest`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `StudentLinkRequest_studentId_parentId_key` (`studentId`,`parentId`),
  ADD KEY `StudentLinkRequest_status_idx` (`status`),
  ADD KEY `StudentLinkRequest_parentId_fkey` (`parentId`),
  ADD KEY `StudentLinkRequest_approvedById_fkey` (`approvedById`);

--
-- Indexes for table `systemsetting`
--
ALTER TABLE `systemsetting`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `SystemSetting_key_key` (`key`),
  ADD KEY `SystemSetting_updatedById_fkey` (`updatedById`);

--
-- Indexes for table `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `User_email_key` (`email`),
  ADD UNIQUE KEY `User_phone_key` (`phone`),
  ADD KEY `User_email_idx` (`email`),
  ADD KEY `User_role_idx` (`role`);

--
-- Indexes for table `_prisma_migrations`
--
ALTER TABLE `_prisma_migrations`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `activitylog`
--
ALTER TABLE `activitylog`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `clinicvisit`
--
ALTER TABLE `clinicvisit`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `course`
--
ALTER TABLE `course`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `healthmetric`
--
ALTER TABLE `healthmetric`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `otp`
--
ALTER TABLE `otp`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `smslog`
--
ALTER TABLE `smslog`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `student`
--
ALTER TABLE `student`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `studentlinkrequest`
--
ALTER TABLE `studentlinkrequest`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `systemsetting`
--
ALTER TABLE `systemsetting`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `user`
--
ALTER TABLE `user`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `activitylog`
--
ALTER TABLE `activitylog`
  ADD CONSTRAINT `ActivityLog_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `clinicvisit`
--
ALTER TABLE `clinicvisit`
  ADD CONSTRAINT `ClinicVisit_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `student` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `course`
--
ALTER TABLE `course`
  ADD CONSTRAINT `Course_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `user` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `healthmetric`
--
ALTER TABLE `healthmetric`
  ADD CONSTRAINT `HealthMetric_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `student` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `smslog`
--
ALTER TABLE `smslog`
  ADD CONSTRAINT `SmsLog_clinicVisitId_fkey` FOREIGN KEY (`clinicVisitId`) REFERENCES `clinicvisit` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `student`
--
ALTER TABLE `student`
  ADD CONSTRAINT `Student_courseId_fkey` FOREIGN KEY (`courseId`) REFERENCES `course` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `Student_parentId_fkey` FOREIGN KEY (`parentId`) REFERENCES `user` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `studentlinkrequest`
--
ALTER TABLE `studentlinkrequest`
  ADD CONSTRAINT `StudentLinkRequest_approvedById_fkey` FOREIGN KEY (`approvedById`) REFERENCES `user` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `StudentLinkRequest_parentId_fkey` FOREIGN KEY (`parentId`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `StudentLinkRequest_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `student` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `systemsetting`
--
ALTER TABLE `systemsetting`
  ADD CONSTRAINT `SystemSetting_updatedById_fkey` FOREIGN KEY (`updatedById`) REFERENCES `user` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
