import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  IonContent,
  IonIcon,
  IonCheckbox,
} from '@ionic/angular/standalone';

import {
  heart,
  bagHandleOutline,
  arrowForwardOutline,
  storefrontOutline,
  shieldCheckmarkOutline,
  flashOutline,
  peopleOutline
} from 'ionicons/icons';

import { addIcons } from 'ionicons';

import { Router } from '@angular/router';

import { Preferences } from '@capacitor/preferences';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.page.html',
  styleUrls: ['./welcome.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonIcon,
    IonCheckbox,
  ],
})

export class WelcomePage implements AfterViewInit {

  /** Referensi ke .slider-track (bukan .slider) */
  @ViewChild('sliderTrack') sliderTrack!: ElementRef<HTMLElement>;

  agreePrivacy = false;

  hasScrolledToBottom = false;


  currentSlide = 0;


  private readonly TOTAL_SLIDES = 3;

  constructor(private router: Router) {

    addIcons({
      heart,
      'bag-handle-outline': bagHandleOutline,
      'arrow-forward-outline': arrowForwardOutline,
      'storefront-outline': storefrontOutline,
      'shield-checkmark-outline': shieldCheckmarkOutline,
      'flash-outline': flashOutline,
      'people-outline': peopleOutline
    });
  }

  ngAfterViewInit(): void {
    this.setSlide(0, false);
  }


  nextSlide(): void {
    if (this.currentSlide < this.TOTAL_SLIDES - 1) {
      this.goToSlide(this.currentSlide + 1);
    }
  }


  prevSlide(): void {
    if (this.currentSlide > 0) {
      this.goToSlide(this.currentSlide - 1);
    }
  }


  goToSlide(index: number): void {
    if (index < 0 || index >= this.TOTAL_SLIDES) return;

    this.currentSlide = index;
    this.setSlide(index, true);
  }

  /**
   * Terapkan translateX ke .slider-track.
   * @param index index slide tujuan
   * @param animate true = pakai CSS transition
   */
  private setSlide(index: number, animate: boolean): void {

      const track = this.sliderTrack?.nativeElement;

      if (!track) return;

      if (!animate) {
        track.style.transition = 'none';
      }

      track.style.transform = `translateX(-${index * 100}%)`;

      if (!animate) {
        track.getBoundingClientRect();
        track.style.transition = '';
      }
    }


    onPrivacyScroll(event: Event): void {

    const target = event.target as HTMLElement;

    const scrollPosition =
      target.scrollTop + target.clientHeight;

    const scrollHeight = target.scrollHeight;

    if (scrollPosition >= scrollHeight - 10) {
      this.hasScrolledToBottom = true;
    }
  }
  
  goToLogin(): void {
    this.router.navigate(['/login']);
  }

  async goToHome(): Promise<void> {

    await Preferences.set({
      key: 'welcome_seen',
      value: 'true'
    });

    this.router.navigate(['/tabs/home']);
  }

  openPrivacyPolicy(): void {
    window.open(
      'https://doc-hosting.flycricket.io/vellora-privacy-policy/990dbe52-6914-41a8-8f20-a4b297daa665/privacy',
      '_blank',
      'noopener,noreferrer'
    );
  }
}