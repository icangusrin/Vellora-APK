import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ShopProfilePage } from './shop-profile.page';

describe('ShopProfilePage', () => {
  let component: ShopProfilePage;
  let fixture: ComponentFixture<ShopProfilePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ShopProfilePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
