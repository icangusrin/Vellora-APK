import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChangePhonePage } from './change-phone.page';

describe('ChangePhonePage', () => {
  let component: ChangePhonePage;
  let fixture: ComponentFixture<ChangePhonePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ChangePhonePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
