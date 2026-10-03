import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SecurityAccountPage } from './security-account.page';

describe('SecurityAccountPage', () => {
  let component: SecurityAccountPage;
  let fixture: ComponentFixture<SecurityAccountPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(SecurityAccountPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
