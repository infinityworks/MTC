-- add new school

insert into [mtc_admin].[school]
    (dfeNumber, estabCode, leaCode, name, pin, pinExpiresAt, urn)
values
       ('9999955', '9955', '999', 'JMS school', '1234', '2018-12-31T23:59:59', 89006);

declare @schoolId INT = scope_identity()
DECLARE @baseUpn NVARCHAR = 'H9999955'
DECLARE @cnt INT = 1


BEGIN TRY
  WHILE @cnt <= 4096
    BEGIN
      INSERT INTO [mtc_admin].[pupil]
          (school_id, foreName, lastName, gender, dateOfBirth, upn, isTestAccount)
      VALUES
          (@schoolId, 'Pupil', CAST(@cnt AS NVARCHAR), 'M', '2010-01-01',
           (@baseupn + RIGHT('00000' + CAST(@cnt AS NVARCHAR), 5)),
           1);
      SET @cnt = @cnt + 1;
  END
END TRY
BEGIN CATCH
-- IF (@@TRANCOUNT > 0)
--   BEGIN
--     ROLLBACK TRANSACTION
--     PRINT 'Error detected, all changes reversed'
--   END
DECLARE @ErrorMessage NVARCHAR(4000);
DECLARE @ErrorSeverity INT;
DECLARE @ErrorState INT;

SELECT @ErrorMessage = ERROR_MESSAGE(),
       @ErrorSeverity = ERROR_SEVERITY(),
       @ErrorState = ERROR_STATE();

-- Use RAISERROR inside the CATCH block to return
-- error information about the original error that
-- caused execution to jump to the CATCH block.
RAISERROR (@ErrorMessage, -- Message text.
@ErrorSeverity, -- Severity.
@ErrorState -- State.
);
END CATCH




