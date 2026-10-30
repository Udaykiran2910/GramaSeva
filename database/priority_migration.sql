-- Run this file against the grama_seva database before starting the app.
-- It preserves complaint rows and only adds/normalizes the priority column.
USE grama_seva;

SET @priority_column_exists = (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'complaints'
    AND COLUMN_NAME = 'priority'
);

SET @priority_add_sql = IF(
  @priority_column_exists = 0,
  'ALTER TABLE complaints ADD COLUMN priority ENUM(''Critical'',''High'',''Medium'',''Low'') NOT NULL DEFAULT ''Medium''',
  'SELECT ''complaints.priority already exists'' AS migration_message'
);

PREPARE priority_add_statement FROM @priority_add_sql;
EXECUTE priority_add_statement;
DEALLOCATE PREPARE priority_add_statement;

UPDATE complaints
SET priority = 'Medium'
WHERE priority IS NULL
   OR priority NOT IN ('Critical', 'High', 'Medium', 'Low');

ALTER TABLE complaints
  MODIFY COLUMN priority ENUM('Critical', 'High', 'Medium', 'Low')
  NOT NULL DEFAULT 'Medium';
