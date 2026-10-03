import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PrivacySettingsPage } from './privacy-settings.page';

describe('PrivacySettingsPage', () => {
  let component: PrivacySettingsPage;
  let fixture: ComponentFixture<PrivacySettingsPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(PrivacySettingsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
