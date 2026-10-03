import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PaymentQrisPage } from './payment-qris.page';

describe('PaymentQrisPage', () => {
  let component: PaymentQrisPage;
  let fixture: ComponentFixture<PaymentQrisPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(PaymentQrisPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
