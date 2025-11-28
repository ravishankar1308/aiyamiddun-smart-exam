CREATE DATABASE IF NOT EXISTS aiyamiddun_digital;

USE aiyamiddun_digital;

-- Users Table: Stores login and role information
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `username` VARCHAR(255) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL, -- Hashed password
  `role` ENUM('student', 'teacher', 'admin', 'owner') NOT NULL,
  `disabled` BOOLEAN DEFAULT FALSE,
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Subjects Table: Dynamic list of subjects (e.g., Mathematics, Physics)
CREATE TABLE IF NOT EXISTS `subjects` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(255) NOT NULL UNIQUE
) ENGINE=InnoDB;

-- Grades Table: Dynamic list of grades/classes
CREATE TABLE IF NOT EXISTS `grades` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(255) NOT NULL UNIQUE
) ENGINE=InnoDB;


-- Questions Table: The central question bank
CREATE TABLE IF NOT EXISTS `questions` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `question_text` TEXT NOT NULL,
  `question_type` ENUM('mcq', 'essay', 'multiple_answer') NOT NULL,
  `options` JSON DEFAULT NULL, -- For MCQs: [{ "option_text": "...", "is_correct": true/false }]
  `subject_id` INT,
  `grade_id` INT, -- Link to grades table
  `topic` VARCHAR(255),
  `difficulty` ENUM('easy', 'medium', 'hard'),
  `marks` INT DEFAULT 1,
  `created_by` INT, -- User ID of the creator
  `approval_status` ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
  `image_base64` TEXT DEFAULT NULL, -- Image data
  `disabled` BOOLEAN DEFAULT FALSE,
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`subject_id`) REFERENCES `subjects`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`grade_id`) REFERENCES `grades`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB;

-- Exams Table: Stores the structure and configuration of an exam
CREATE TABLE IF NOT EXISTS `exams` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT,
  `subject_id` INT,
  `grade_id` INT, -- Link to grades table
  `duration_minutes` INT NOT NULL,
  `start_time` TIMESTAMP NULL, -- For scheduled quizzes
  `end_time` TIMESTAMP NULL, -- For scheduled quizzes
  `questions_snapshot` JSON, -- Snapshot of all questions at the time of creation
  `created_by` INT, 
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`subject_id`) REFERENCES `subjects`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`grade_id`) REFERENCES `grades`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB;

-- Exam Assignments: Links exams to specific students
CREATE TABLE IF NOT EXISTS `exam_assignments` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `exam_id` INT NOT NULL,
    `student_id` INT NOT NULL,
    `assignedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`exam_id`) REFERENCES `exams`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`student_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    UNIQUE KEY `unique_assignment` (`exam_id`, `student_id`)
) ENGINE=InnoDB;

-- Quiz Results Table: Stores student submissions and scores
CREATE TABLE IF NOT EXISTS `quiz_results` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `exam_id` INT NOT NULL,
  `student_id` INT NOT NULL,
  `score` INT NOT NULL,
  `total_marks` INT NOT NULL,
  `answers` JSON, -- e.g., { "questionId1": "userAnswer", "questionId2": ["userAnswer1", "userAnswer2"] }
  `submittedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`exam_id`) REFERENCES `exams`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`student_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB;
