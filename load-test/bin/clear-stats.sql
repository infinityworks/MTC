-- count number of plans currently in cache

select count(*) from sys.dm_exec_cached_plans;

-- Executing this statement will clear the procedure cache in the current database, which means that all queries will have to recompile.

ALTER DATABASE SCOPED CONFIGURATION CLEAR PROCEDURE_CACHE;

-- count number of plans in cache now, after they were cleared from cache

select count(*) from sys.dm_exec_cached_plans;

-- list available plans

select * from sys.dm_exec_cached_plans;
