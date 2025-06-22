import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class AudioService {
  private audio: HTMLAudioElement | null = null;
  private isAudioReady = false;
  private wasPlaying = false;
  private interactionRegistered = false;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    if (isPlatformBrowser(this.platformId)) {
      this.initAudio();
      this.restorePlaybackState();
    }
  }

  private initAudio(): void {
    this.audio = new Audio();
    this.audio.src = 'assets/audio/thoda_thoda.mp3'; // Relative path
    this.audio.load(); // Explicitly load audio
    this.audio.loop = true;
    this.audio.volume = 0.5;
    this.audio.muted = true; // Start muted to comply with autoplay policies

    this.audio.addEventListener('canplaythrough', () => {
      this.isAudioReady = true;
      console.log('Audio is ready to play');
    });

    this.audio.addEventListener('error', (err) => {
      console.error('Audio error:', err);
    });
  }

  private restorePlaybackState(): void {
    this.wasPlaying = localStorage.getItem('bgMusicPlaying') === 'true';
    if (this.wasPlaying) {
      this.registerInteractionListener();
    }
  }

  private registerInteractionListener(): void {
    if (this.interactionRegistered) return;
    
    const playAfterInteraction = () => {
      if (this.audio && this.isAudioReady) {
        this.audio.muted = false;
        this.audio.play().catch(e => {
          console.warn('Autoplay prevented:', e);
        });
      }
    };

    // Single interaction listener
    const handleFirstInteraction = () => {
      this.interactionRegistered = true;
      playAfterInteraction();
      document.removeEventListener('click', handleFirstInteraction);
    };

    document.addEventListener('click', handleFirstInteraction);
  }

  public async play(): Promise<void> {
    if (!this.audio || !this.isAudioReady) {
      console.warn('Audio not ready to play');
      return;
    }

    try {
      this.registerInteractionListener();
      await this.audio.play();
      this.audio.muted = false;
      localStorage.setItem('bgMusicPlaying', 'true');
      console.log('Audio playback started');
    } catch (error) {
      console.error('Playback failed:', error);
      // Fallback: Show UI button to let user start playback
    }
  }

  public stop(): void {
    if (this.audio) {
      this.audio.pause();
      this.audio.currentTime = 0;
      localStorage.setItem('bgMusicPlaying', 'false');
    }
  }
}