import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class AudioService {
  private audio: HTMLAudioElement | null = null;
  private wasPlaying = false;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    // Only initialize audio in browser environment
    if (isPlatformBrowser(this.platformId)) {
      this.audio = new Audio('/assets/audio/thoda_thoda.mp3');
      this.audio.loop = true;
      this.audio.volume = 0.5; // 30% volume

      // Restore playback state if page refreshes
      this.wasPlaying = localStorage.getItem('bgMusicPlaying') === 'true';

      // Handle browser autoplay policies
      document.addEventListener('click', this.initAudio.bind(this), {
        once: true,
      });
    }
  }

  private initAudio(): void {
    if (this.wasPlaying && this.audio) {
      this.play();
    }
  }

  play(): void {
    if (!this.audio) return;

    this.audio
      .play()
      .then(() => {
        localStorage.setItem('bgMusicPlaying', 'true');
      })
      .catch((error) => {
        console.log('Autoplay prevented, will play after user interaction');
      });
  }

  stop(): void {
    if (!this.audio) return;

    this.audio.pause();
    localStorage.setItem('bgMusicPlaying', 'false');
  }
}
