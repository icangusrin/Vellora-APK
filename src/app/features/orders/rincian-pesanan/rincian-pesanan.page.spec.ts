import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RincianPesananPage } from './rincian-pesanan.page';

describe('RincianPesananPage', () => {
  let component: RincianPesananPage;
  let fixture: ComponentFixture<RincianPesananPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(RincianPesananPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
