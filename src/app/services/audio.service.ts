import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AudioService {
  private audio: HTMLAudioElement;
  private wasPlaying = false;

  constructor() {
    // Initialize audio
    this.audio = new Audio('/assets/audio/thoda_thoda.mp3');
    this.audio.loop = true;
    this.audio.volume = 0.3; // 30% volume

    // Restore playback state if page refreshes
    this.wasPlaying = localStorage.getItem('bgMusicPlaying') === 'true';

    // Handle browser autoplay policies
    document.addEventListener('click', this.initAudio.bind(this), {
      once: true,
    });
  }

  private initAudio(): void {
    if (this.wasPlaying) {
      this.play();
    }
  }

  play(): void {
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
    this.audio.pause();
    localStorage.setItem('bgMusicPlaying', 'false');
  }
}
