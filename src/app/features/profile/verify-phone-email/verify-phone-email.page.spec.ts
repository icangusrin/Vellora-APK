import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VerifyPhoneEmailPage } from './verify-phone-email.page';

describe('VerifyPhoneEmailPage', () => {
  let component: VerifyPhoneEmailPage;
  let fixture: ComponentFixture<VerifyPhoneEmailPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(VerifyPhoneEmailPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
