import { APP_INITIALIZER } from '@angular/core';
import { QUEUE_STORAGE_TOKEN } from '../azure-queue/azureStorage';
import { Router } from '@angular/router';
import { AuditService } from '../audit/audit.service';
import { AzureQueueService } from '../azure-queue/azure-queue.service';
import { CheckCompleteService } from './check-complete.service';
import { AppConfigService, loadConfigMockService } from '../config/config.service';
import { StorageService } from '../storage/storage.service';
import { SubmissionService } from '../submission/submission.service';
import { SubmissionServiceMock } from '../submission/submission.service.mock';
import { TestBed } from '@angular/core/testing';
import { TokenService } from '../token/token.service';
import { AppUsageService } from '../app-usage/app-usage.service';

let auditService: AuditService;
let azureQueueService: AzureQueueService;
let checkCompleteService: CheckCompleteService;
let storageService: StorageService;
let submissionService: SubmissionService;
let tokenService: TokenService;
let appUsageService: AppUsageService;

describe('CheckCompleteService', () => {
  const getItemMock = (arg, isPractice) => {
    if (arg === 'config') {
      return ({
        practice: isPractice
      });
    }
  };
  let mockRouter;

  beforeEach(() => {
    mockRouter = {
      navigate: jasmine.createSpy('navigate')
    };

    const inject = TestBed.configureTestingModule({
        providers: [
          AppConfigService,
          AuditService,
          CheckCompleteService,
          AzureQueueService,
          StorageService,
          TokenService,
          AppUsageService,
          {provide: APP_INITIALIZER, useFactory: loadConfigMockService, multi: true},
          {provide: QUEUE_STORAGE_TOKEN},
          {provide: SubmissionService, useClass: SubmissionServiceMock},
          {provide: Router, useValue: mockRouter}
        ]
      }
    );
    checkCompleteService = inject.get(CheckCompleteService);
    submissionService = inject.get(SubmissionService);
    appUsageService = TestBed.get(AppUsageService);
    tokenService = inject.get(TokenService);
    azureQueueService = inject.get(AzureQueueService);
    auditService = inject.get(AuditService);
    storageService = TestBed.get(StorageService);
    checkCompleteService.checkSubmissionApiErrorDelay = 100;
    checkCompleteService.checkSubmissionAPIErrorMaxAttempts = 1;
  });
  it('should be created', () => {
    expect(checkCompleteService).toBeTruthy();
  });
  describe('when featureUseHpa toggle is off', () => {
    beforeEach(() => {
      checkCompleteService.featureUseHpa = false;
    });
    it('submit should call submission service successfully and audit successful call', async () => {
      const addEntrySpy = spyOn(auditService, 'addEntry');
      spyOn(storageService, 'getItem').and.callFake(arg => getItemMock(arg, false));
      spyOn(appUsageService , 'store');
      spyOn(submissionService, 'submitData')
        .and.returnValue({toPromise: () => Promise.resolve()});
      await checkCompleteService.submit(Date.now());
      expect(addEntrySpy).toHaveBeenCalledTimes(2);
      expect(appUsageService.store).toHaveBeenCalledTimes(1);
      expect(addEntrySpy.calls.all()[0].args[0].type).toEqual('CheckSubmissionApiCalled');
      expect(addEntrySpy.calls.all()[1].args[0].type).toEqual('CheckSubmissionAPICallSucceeded');
      expect(submissionService.submitData).toHaveBeenCalledTimes(1);
    });
    it('submit should call submission service unsuccessfully and audit failure', async () => {
      const addEntrySpy = spyOn(auditService, 'addEntry');
      spyOn(storageService, 'getItem').and.callFake(arg => getItemMock(arg, false));
      spyOn(appUsageService , 'store');
      spyOn(submissionService, 'submitData')
        .and.returnValue({toPromise: () => Promise.reject(new Error('error'))});
      await checkCompleteService.submit(Date.now());
      expect(addEntrySpy).toHaveBeenCalledTimes(1);
      expect(appUsageService.store).toHaveBeenCalledTimes(1);
      expect(addEntrySpy.calls.all()[0].args[0].type).toEqual('CheckSubmissionApiCalled');
      expect(submissionService.submitData).toHaveBeenCalledTimes(1);
    });
    it('submit should return if the app is configured to run in practice mode', async () => {
      const addEntrySpy = spyOn(auditService, 'addEntry');
      spyOn(storageService, 'getItem').and.callFake(arg => getItemMock(arg, true));
      spyOn(appUsageService , 'store');
      spyOn(submissionService, 'submitData');
      await checkCompleteService.submit(Date.now());
      expect(addEntrySpy).toHaveBeenCalledTimes(0);
      expect(appUsageService.store).toHaveBeenCalledTimes(1);
      expect(submissionService.submitData).toHaveBeenCalledTimes(0);
    });
  });
  describe('when featureUseHpa toggle is on', () => {
    beforeEach(() => {
      checkCompleteService.featureUseHpa = true;
    });
    it('submit should call azure queue service successfully, audit successful call and redirect to check complete page', async () => {
      const addEntrySpy = spyOn(auditService, 'addEntry');
      spyOn(storageService, 'getItem').and.callFake(arg => getItemMock(arg, false));
      spyOn(appUsageService , 'store');
      spyOn(tokenService, 'getToken').and.returnValue({url: 'url', token: 'token'});
      spyOn(storageService, 'setItem');
      spyOn(storageService, 'getAllItems').and.returnValue({pupil: {checkCode: 'checkCode'}});
      spyOn(azureQueueService, 'addMessage')
        .and.returnValue(Promise.resolve());
      await checkCompleteService.submit(Date.now());
      expect(addEntrySpy).toHaveBeenCalledTimes(2);
      expect(appUsageService.store).toHaveBeenCalledTimes(1);
      expect(addEntrySpy.calls.all()[0].args[0].type).toEqual('CheckSubmissionApiCalled');
      expect(addEntrySpy.calls.all()[1].args[0].type).toEqual('CheckSubmissionAPICallSucceeded');
      expect(azureQueueService.addMessage).toHaveBeenCalledTimes(1);
      expect(storageService.setItem).toHaveBeenCalledTimes(2);
      expect(storageService.getAllItems).toHaveBeenCalledTimes(1);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/check-complete']);
    });
    it(`submit should call azure queue service service unsuccessfully, audit failure
      and redirect to submission failed page`, async () => {
      const addEntrySpy = spyOn(auditService, 'addEntry');
      spyOn(storageService, 'getItem').and.callFake(arg => getItemMock(arg, false));
      spyOn(appUsageService , 'store');
      spyOn(tokenService, 'getToken').and.returnValue({url: 'url', token: 'token'});
      spyOn(storageService, 'setItem');
      spyOn(storageService, 'getAllItems').and.returnValue({pupil: {checkCode: 'checkCode'}});
      spyOn(azureQueueService, 'addMessage')
        .and.returnValue(Promise.reject(new Error('error')));
      await checkCompleteService.submit(Date.now());
      expect(addEntrySpy).toHaveBeenCalledTimes(2);
      expect(appUsageService.store).toHaveBeenCalledTimes(1);
      expect(addEntrySpy.calls.all()[0].args[0].type).toEqual('CheckSubmissionApiCalled');
      expect(addEntrySpy.calls.all()[1].args[0].type).toEqual('CheckSubmissionAPIFailed');
      expect(azureQueueService.addMessage).toHaveBeenCalledTimes(1);
      expect(storageService.setItem).toHaveBeenCalledTimes(0);
      expect(storageService.getAllItems).toHaveBeenCalledTimes(1);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/submission-failed']);
    });
    it('submit should return if the app is configured to run in practice mode', async () => {
      const addEntrySpy = spyOn(auditService, 'addEntry');
      spyOn(storageService, 'getItem').and.callFake(arg => getItemMock(arg, true));
      spyOn(appUsageService , 'store');
      spyOn(tokenService, 'getToken');
      spyOn(storageService, 'setItem');
      spyOn(storageService, 'getAllItems');
      spyOn(azureQueueService, 'addMessage');
      await checkCompleteService.submit(Date.now());
      expect(addEntrySpy).toHaveBeenCalledTimes(0);
      expect(appUsageService.store).toHaveBeenCalledTimes(1);
      expect(azureQueueService.addMessage).toHaveBeenCalledTimes(0);
      expect(storageService.getAllItems).toHaveBeenCalledTimes(0);
      expect(storageService.setItem).toHaveBeenCalledTimes(2);
      expect(mockRouter.navigate).toHaveBeenCalledTimes(1);
    });
  });
});
