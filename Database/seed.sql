-- Databse_Devops/seed.sql
-- Milestone 1 seed data is already included at the end of schema.sql
-- (Migration 010_seed_data: ASL sign_language, "Basic Greetings" module,
-- "Saying Hello" lesson, "Hello" sign, and the demo ai_models row).
--
-- This file is kept as a separate init-mount target so seed data can grow
-- independently of schema changes without touching schema.sql again.
-- Add additional alphabet-lesson seed INSERTs here as Intern 2/3 need them
-- (e.g. Letters A-Z per Intern 2's Day 5 task).


-- ============================================================
-- Milestone 4 seed data
-- Accessibility Trainer role
-- ============================================================

INSERT INTO roles (role_name, description)
SELECT
    'accessibility_trainer',
    'Trainer who supports learners with accessibility needs'
WHERE NOT EXISTS (
    SELECT 1
    FROM roles
    WHERE role_name = 'accessibility_trainer'
);