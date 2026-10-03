import { ComponentFixture, TestBed } from '@angular/core/testing';
import { JoinSellerPage } from './join-seller.page';

describe('JoinSellerPage', () => {
  let component: JoinSellerPage;
  let fixture: ComponentFixture<JoinSellerPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(JoinSellerPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
