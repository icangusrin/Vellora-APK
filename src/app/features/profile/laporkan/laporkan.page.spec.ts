import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LaporkanPage } from './laporkan.page';

describe('LaporkanPage', () => {
  let component: LaporkanPage;
  let fixture: ComponentFixture<LaporkanPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(LaporkanPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
