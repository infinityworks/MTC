import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { Router } from '@angular/router';

import { FamiliarisationColourComponent } from './familiarisation-colour.component';
import { StorageService } from '../services/storage/storage.service';
import { StorageServiceMock } from '../services/storage/storage.service.mock';
import { RouteService } from '../services/route/route.service';
import { RouteServiceMock } from '../services/route/route.service.mock';

describe('FamiliarisationColourComponent', () => {
  let mockRouter;
  let mockRouteService;
  let component: FamiliarisationColourComponent;
  let fixture: ComponentFixture<FamiliarisationColourComponent>;

  beforeEach(async(() => {
    mockRouter = {
      navigate: jasmine.createSpy('navigate')
    };

    const injector = TestBed.configureTestingModule({
      declarations: [ FamiliarisationColourComponent ],
      schemas: [ NO_ERRORS_SCHEMA ],
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: RouteService, useClass: RouteServiceMock },
        { provide: StorageService, useClass: StorageServiceMock }
      ]
    });

    mockRouteService = injector.get(RouteService);
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FamiliarisationColourComponent);
    fixture.detectChanges();
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should redirect to the access-settings page on click if the user has navigated from access-settings', () => {
    spyOn(mockRouteService, 'getPreviousUrl').and.returnValue('/access-settings');
    component.onClick();
    fixture.whenStable().then(() => {
      expect(mockRouter.navigate).toHaveBeenCalledWith(['access-settings']);
    });
  });

  it('should redirect to the sign-in-success page on click if the user has not navigated from access-settings', () => {
    spyOn(mockRouteService, 'getPreviousUrl').and.returnValue('/something-else');
    component.onClick();
    fixture.whenStable().then(() => {
      expect(mockRouter.navigate).toHaveBeenCalledWith(['sign-in-success']);
    });
  });

  it('should redirect to the sign-in-success page on click if previous url is undefined', () => {
    spyOn(mockRouteService, 'getPreviousUrl').and.returnValue(undefined);
    component.onClick();
    fixture.whenStable().then(() => {
      expect(mockRouter.navigate).toHaveBeenCalledWith(['sign-in-success']);
    });
  });
});