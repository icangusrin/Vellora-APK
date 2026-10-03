import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VerifyPhoneOtpPage } from './verify-phone-otp.page';

describe('VerifyPhoneOtpPage', () => {
  let component: VerifyPhoneOtpPage;
  let fixture: ComponentFixture<VerifyPhoneOtpPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(VerifyPhoneOtpPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
