import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PendingPaymentPage } from './pending-payment.page';

describe('PendingPaymentPage', () => {
  let component: PendingPaymentPage;
  let fixture: ComponentFixture<PendingPaymentPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(PendingPaymentPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
