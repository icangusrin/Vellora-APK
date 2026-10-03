import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LacakPesananPage } from './lacak-pesanan.page';

describe('LacakPesananPage', () => {
  let component: LacakPesananPage;
  let fixture: ComponentFixture<LacakPesananPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(LacakPesananPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
