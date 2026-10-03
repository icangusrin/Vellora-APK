import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SellerSuccessPage } from './seller-success.page';

describe('SellerSuccessPage', () => {
  let component: SellerSuccessPage;
  let fixture: ComponentFixture<SellerSuccessPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(SellerSuccessPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
