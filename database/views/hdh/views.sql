-- NOTE: how it works
    -- 1. hdh_user connected to hdh_db
    -- 2. hdh_db has a postgres_fdw connection to main db using hdh_fdw_user as a proxy
    -- 3. the views (hdh_view) were created on the main db
    -- 4. the hdh_user imported the hdh_view's views into the hdh_db through th postgres_fdw connection

-- NOTE: need the following the clean up the user permissions first
REVOKE ALL ON SCHEMA public FROM PUBLIC;
-- REVOKE ALL ON DATABASE oats_test FROM PUBLIC;
REVOKE ALL ON DATABASE hmsl_iot_production FROM PUBLIC;
-- https://chartio.com/learn/postgresql/limit-postgres-user-access/

-- NOTE: create user at bottom

-- revoke permissions
REVOKE CONNECT ON DATABASE hmsl_iot_production FROM hdh_user;

# main server
CREATE DATABASE hdh_db;
-- run the following as postgres (superuser) on hdh_db
DROP EXTENSION postgres_fdw;
CREATE EXTENSION postgres_fdw;
DROP SERVER hdh_fdw_server
  FOREIGN DATA WRAPPER postgres_fdw;
CREATE SERVER hdh_fdw_server
  FOREIGN DATA WRAPPER postgres_fdw
  OPTIONS (host 'localhost', dbname 'hmsl_iot_production');
DROP USER MAPPING FOR hdh_user
  SERVER hdh_fdw_server;
CREATE USER MAPPING FOR hdh_user
  SERVER hdh_fdw_server
  OPTIONS (user 'hdh_fdw_user', password 'jc4jZZgnMCPSxwL0LRez6WTVFeZ370Hz');
REVOKE USAGE ON FOREIGN SERVER hdh_fdw_server FROM hdh_user;
GRANT USAGE ON FOREIGN SERVER hdh_fdw_server TO hdh_user;

##########
# NOTE: How it works?
#       1. Create new view under hdh_view schema
#       2. Import foreign schema into table
#       3. Grant select permissions to fdw user
# create separate schema
# NOTE: run this on main db
CREATE SCHEMA hdh_view;
CREATE USER hdh_fdw_user WITH ENCRYPTED PASSWORD 'jc4jZZgnMCPSxwL0LRez6WTVFeZ370Hz';

/*********
 * views *
 *********/
-- hdh views: devices
CREATE OR REPLACE VIEW hdh_view.devices
AS
SELECT
  nodes.id AS device_id,
  nodes.name AS device_name,
  node_groups.id AS group_id,
  node_groups.name AS group_name
FROM nodes
LEFT OUTER JOIN node_groups ON nodes.node_group_id = node_groups.id
ORDER BY nodes.id;



# 2. Import schema
# NOTE: run this as hdh_user on hdh_db
IMPORT FOREIGN SCHEMA hdh_view
LIMIT TO (devices, device_events, capacities, reason_code_markers) FROM SERVER hdh_fdw_server INTO public;

# run this as hmsl_iot_production as root user
GRANT SELECT ON hdh_view.devices TO hdh_fdw_user;
GRANT SELECT ON hdh_view.capacities TO hdh_fdw_user;
GRANT SELECT ON hdh_view.device_events TO hdh_fdw_user;
GRANT SELECT ON hdh_view.reason_code_markers TO hdh_fdw_user;

-- create user for access
DROP USER hdh_user;
CREATE USER hdh_user NOINHERIT LOGIN PASSWORD 'BG3XVgtZ12WpZna1W2LnG3W99Jz0RAxL';
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM hdh_user;
REVOKE USAGE ON SCHEMA hdh_view FROM hdh_fdw_user;
GRANT USAGE ON SCHEMA hdh_view TO hdh_fdw_user;
REVOKE CONNECT ON DATABASE hmsl_iot_production FROM hdh_fdw_user;
GRANT CONNECT ON DATABASE hmsl_iot_production TO hdh_fdw_user;
REVOKE USAGE ON FOREIGN DATA WRAPPER postgres_fdw FROM hdh_user;
GRANT USAGE ON FOREIGN DATA WRAPPER postgres_fdw TO hdh_user;
