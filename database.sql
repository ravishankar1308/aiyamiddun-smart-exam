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

-- Metadata Table: A single table to store all dynamic settings as JSON.
-- This mirrors the simple, flexible structure from the Firestore example.
CREATE TABLE IF NOT EXISTS `metadata` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `setting_key` VARCHAR(255) UNIQUE NOT NULL,
  `setting_value` JSON,
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
  `isQuiz` BOOLEAN DEFAULT FALSE,
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

INSERT INTO `metadata` (`setting_key`, `setting_value`) VALUES
('grades', '[{"id": "g10", "name": "Grade 10", "active": true}, {"id": "g11", "name": "Grade 11", "active": true}, {"id": "g12", "name": "Grade 12", "active": true}]' ),
('subjects', '[{"id": "s1", "name": "Mathematics", "grade": "Grade 10", "active": true}, {"id": "s2", "name": "Science", "grade": "Grade 10", "active": true}, {"id": "s3", "name": "Physics", "grade": "Grade 11", "active": true}]' ),
('sections', '[{"id": "sec1", "name": "Section A", "grade": "Grade 10", "subject": "Mathematics", "active": true}, {"id": "sec2", "name": "Section B", "grade": "Grade 10", "subject": "Mathematics", "active": true}]' ),
('questionTypes', '[{"id": "qt1", "name": "MCQ", "active": true}, {"id": "qt2", "name": "One Word", "active": true}, {"id": "qt3", "name": "Multiple Answer", "active": true}]' )
ON DUPLICATE KEY UPDATE `setting_key`=`setting_key`; -- Prevents error on re-run
