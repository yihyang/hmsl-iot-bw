-- NOTE: the following scripts are used to create database
--       and is specific for postgresql

-- workaround for "CREATE ROLE IF NOT EXISTS" equivalent
-- DO
-- $do$
-- BEGIN
--    IF NOT EXISTS (SELECT FROM   pg_catalog.pg_roles WHERE  rolname = 'forge') THEN
--       CREATE ROLE forge LOGIN PASSWORD 'forge';
--    END IF;
-- END
-- $do$;
-- ALTER USER forge WITH SUPERUSER;

-- workaround for "CREATE DATABASE IF NOT EXISTS" equivalent
SELECT 'CREATE DATABASE hmsl_iot_development'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'hmsl_iot_development')\gexec
\c hmsl_iot_development;
