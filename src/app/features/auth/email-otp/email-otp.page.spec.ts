import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EmailOtpPage } from './email-otp.page';

describe('EmailOtpPage', () => {
  let component: EmailOtpPage;
  let fixture: ComponentFixture<EmailOtpPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(EmailOtpPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
