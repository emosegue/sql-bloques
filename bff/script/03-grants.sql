-- Grant the application user access to the seeded educational databases.
-- This script runs after 01-universidad.sql and 02-sistema_ventas.sql
-- so both databases already exist when the grants are applied.

GRANT SELECT, INSERT, UPDATE, DELETE ON universidad.*    TO 'sqlbloques'@'%';
GRANT SELECT, INSERT, UPDATE, DELETE ON sistema_ventas.* TO 'sqlbloques'@'%';
GRANT SELECT, INSERT, UPDATE, DELETE ON hospital.*       TO 'sqlbloques'@'%';

FLUSH PRIVILEGES;
