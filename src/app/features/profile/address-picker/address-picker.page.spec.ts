import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AddressPickerPage } from './address-picker.page';

describe('AddressPickerPage', () => {
  let component: AddressPickerPage;
  let fixture: ComponentFixture<AddressPickerPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AddressPickerPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
