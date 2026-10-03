import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SellerRegisterPage } from './seller-register.page';

describe('SellerRegisterPage', () => {
  let component: SellerRegisterPage;
  let fixture: ComponentFixture<SellerRegisterPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(SellerRegisterPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
