DISABLE TRIGGER ALL ON DATABASE;
DELETE FROM mtc_admin.adminLogonEvent
DELETE FROM mtc_admin.pupilLogonEvent
UPDATE mtc_admin.school SET pin=NULL
DELETE FROM mtc_admin.pupilFeedback
DELETE FROM mtc_admin.psychometricianReportCache
DELETE FROM mtc_admin.[checkPin]
DELETE FROM mtc_admin.[check]
DELETE FROM mtc_admin.answer
DELETE FROM mtc_admin.checkResult
DELETE FROM mtc_admin.sessions
DELETE FROM mtc_admin.auditLog
UPDATE mtc_admin.pupil SET pupilStatus_id = 1;
ENABLE TRIGGER ALL On DATABASE
