-- database.sql

CREATE DATABASE IF NOT EXISTS aiyamiddunexam;

USE aiyamiddunexam;

-- Users Table: Stores login and profile information for all roles.
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `username` VARCHAR(255) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `role` ENUM('student', 'teacher', 'admin', 'owner') NOT NULL,
  `disabled` BOOLEAN DEFAULT FALSE,
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Metadata Table: For storing dynamic lists like grades, subjects, etc.
CREATE TABLE IF NOT EXISTS `metadata` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `key` VARCHAR(255) NOT NULL UNIQUE,
  `value` JSON,
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Questions Table: The main question bank.
CREATE TABLE IF NOT EXISTS `questions` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `text` TEXT NOT NULL,
  `category` VARCHAR(255),
  `difficulty` VARCHAR(255),
  `answer` TEXT,
  `answerDetail` TEXT,
  `imageUrl` TEXT,
  `options` JSON, -- Stores array of strings, e.g., '["Option A", "Option B"]'
  `status` ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  `disabled` BOOLEAN DEFAULT FALSE,
  `subject` VARCHAR(255),
  `classLevel` VARCHAR(255),
  `section` VARCHAR(255),
  `marks` VARCHAR(50),
  `authorUsername` VARCHAR(255),
  `authorRole` VARCHAR(255),
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_status` (`status`),
  INDEX `idx_class_subject_section` (`classLevel`, `subject`, `section`)
);

-- Exams Table: Stores the definition and structure of each exam.
CREATE TABLE IF NOT EXISTS `exams` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `classLevel` VARCHAR(255),
  `subject` VARCHAR(255),
  `difficulty` VARCHAR(255),
  `duration` INT, -- Duration in minutes
  `scheduledStart` DATETIME,
  `scheduledEnd` DATETIME,
  `isQuiz` BOOLEAN DEFAULT TRUE,
  `questionsSnapshot` JSON, -- A full snapshot of the questions at the time of creation
  `createdBy` VARCHAR(255),
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Quiz Results Table: Stores each student's attempt for a specific exam.
CREATE TABLE IF NOT EXISTS `quiz_results` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `examId` INT NOT NULL,
  `studentName` VARCHAR(255),
  `studentUsername` VARCHAR(255) NOT NULL,
  `score` INT NOT NULL,
  `total` INT NOT NULL,
  `answers` JSON, -- Stores the student's answers, e.g., {"question_id": "student_answer"}
  `submittedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`examId`) REFERENCES `exams`(`id`) ON DELETE CASCADE
);

-- Seed initial data
INSERT INTO `users` (`name`, `username`, `password`, `role`) VALUES
('Ravishankar', 'ravishankar.0813', 'Ravi1234@', 'owner')
ON DUPLICATE KEY UPDATE `name`=`name`; -- Prevents error on re-run
