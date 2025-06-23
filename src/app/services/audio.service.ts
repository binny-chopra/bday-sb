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
  private readyPromise: Promise<void>;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    if (isPlatformBrowser(this.platformId)) {
      this.readyPromise = this.initAudio();
      this.restorePlaybackState();
    } else {
      this.readyPromise = Promise.resolve();
    }
  }

  private async initAudio(): Promise<void> {
    return new Promise((resolve) => {
      this.audio = new Audio();
      this.audio.src = 'assets/audio/thoda_thoda.mp3';
      this.audio.load();
      this.audio.loop = true;
      this.audio.volume = 1;
      this.audio.muted = true;

      const onReady = () => {
        this.isAudioReady = true;
        console.log('Audio is ready to play');
        resolve();
      };

      // Use multiple events to ensure readiness
      this.audio.addEventListener('canplaythrough', onReady);
      this.audio.addEventListener('loadeddata', onReady);
      
      this.audio.addEventListener('error', (err) => {
        console.error('Audio error:', err);
        resolve(); // Still resolve to avoid hanging
      });
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

    const handleFirstInteraction = () => {
      this.interactionRegistered = true;
      playAfterInteraction();
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('touchstart', handleFirstInteraction);
      document.removeEventListener('keydown', handleFirstInteraction);
    };

    // Add multiple interaction types
    document.addEventListener('click', handleFirstInteraction);
    document.addEventListener('touchstart', handleFirstInteraction);
    document.addEventListener('keydown', handleFirstInteraction);
  }

  public async play(): Promise<void> {
    await this.readyPromise; // Wait for audio to be ready
    
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
      // Consider showing a UI element to let users start playback manually
    }
  }

  public stop(): void {
    if (this.audio) {
      this.audio.pause();
      this.audio.currentTime = 0;
      localStorage.setItem('bgMusicPlaying', 'false');
    }
  }

    public async playFromTimestamp(timestamp: number): Promise<void> {
    await this.readyPromise; // Wait for audio to be ready
    
    if (!this.audio || !this.isAudioReady) {
      console.warn('Audio not ready to play');
      return;
    }

    try {
      // Set the timestamp before playing
      this.audio.currentTime = timestamp;
      
      this.registerInteractionListener();
      await this.audio.play();
      this.audio.muted = false;
      localStorage.setItem('bgMusicPlaying', 'true');
      console.log(`Audio playback started from ${timestamp} seconds`);
    } catch (error) {
      console.error('Playback failed:', error);
    }
  }
}