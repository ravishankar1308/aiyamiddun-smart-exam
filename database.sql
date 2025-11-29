CREATE DATABASE IF NOT EXISTS aiyamiddun_digital;

USE aiyamiddun_digital;

-- Core Security & Structure Tables

CREATE TABLE IF NOT EXISTS `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `username` VARCHAR(255) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL, -- Hashed password
  `role` ENUM('student', 'teacher', 'admin', 'owner') NOT NULL,
  `disabled` BOOLEAN DEFAULT FALSE,
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `grades` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(255) NOT NULL UNIQUE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `subjects` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(255) NOT NULL,
    `grade_id` INT,
    FOREIGN KEY (`grade_id`) REFERENCES `grades`(`id`) ON DELETE SET NULL,
    UNIQUE KEY `unique_subject_per_grade` (`name`, `grade_id`)
) ENGINE=InnoDB;

-- Dynamic Metadata Tables

CREATE TABLE IF NOT EXISTS `sections` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `subject_id` INT NOT NULL,
  FOREIGN KEY (`subject_id`) REFERENCES `subjects`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `question_types` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(100) NOT NULL UNIQUE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `difficulties` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(50) NOT NULL UNIQUE
) ENGINE=InnoDB;


-- Core Content Tables

CREATE TABLE IF NOT EXISTS `questions` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `text` TEXT NOT NULL,
  `imageUrl` VARCHAR(2083) DEFAULT NULL,
  
  `options` JSON DEFAULT NULL,
  `correct_option` INT DEFAULT NULL,

  `subject_id` INT,
  `section_id` INT,
  `question_type_id` INT,
  `difficulty_id` INT,
  
  `marks` INT DEFAULT 1,
  `author_id` INT, -- Changed from created_by for clarity
  `status` ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
  `is_disabled` BOOLEAN DEFAULT FALSE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (`subject_id`) REFERENCES `subjects`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`section_id`) REFERENCES `sections`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`question_type_id`) REFERENCES `question_types`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`difficulty_id`) REFERENCES `difficulties`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`author_id`) REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB;


CREATE TABLE IF NOT EXISTS `exams` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT,
  `subject_id` INT,
  `grade_id` INT,
  `duration_minutes` INT NOT NULL,
  `scheduled_start` TIMESTAMP NULL,
  `scheduled_end` TIMESTAMP NULL,
  `author_id` INT, 
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (`author_id`) REFERENCES `users`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`subject_id`) REFERENCES `subjects`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`grade_id`) REFERENCES `grades`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB;

-- Pivot & Results Tables

CREATE TABLE IF NOT EXISTS `exam_questions` (
    `exam_id` INT NOT NULL,
    `question_id` INT NOT NULL,
    PRIMARY KEY (`exam_id`, `question_id`),
    FOREIGN KEY (`exam_id`) REFERENCES `exams`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`question_id`) REFERENCES `questions`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB;


CREATE TABLE IF NOT EXISTS `exam_assignments` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `exam_id` INT NOT NULL,
    `student_id` INT NOT NULL,
    `assigned_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`exam_id`) REFERENCES `exams`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`student_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    UNIQUE KEY `unique_assignment` (`exam_id`, `student_id`)
) ENGINE=InnoDB;


CREATE TABLE IF NOT EXISTS `quiz_results` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `exam_id` INT NOT NULL,
  `student_id` INT NOT NULL,
  `score` INT NOT NULL,
  `total_marks` INT NOT NULL,
  `answers` JSON,
  `submitted_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`exam_id`) REFERENCES `exams`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`student_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Initial Data Seeding
INSERT INTO `grades` (name) VALUES ('10th Grade'), ('11th Grade'), ('12th Grade') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO `question_types` (name) VALUES ('Multiple Choice Question'), ('Essay'), ('True / False') ON DUPLICATE KEY UPDATE name=name;
INSERT INTO `difficulties` (name) VALUES ('Simple'), ('Medium'), ('Hard') ON DUPLICATE KEY UPDATE name=name;
