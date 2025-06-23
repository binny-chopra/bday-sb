import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { gsap } from 'gsap';
import { AudioService } from '../../services/audio.service';

@Component({
  selector: 'app-homepage',
  standalone: true,
  imports: [CommonModule, FormsModule], // <-- Add CommonModule here
  templateUrl: './homepage.component.html',
  styleUrl: './homepage.component.css',
})
export class HomepageComponent implements OnInit {
  showSecondMessage = false;
  showEnterButton = false;
  showGifContainer = false;
  showLoveButton = false;
  showIlyButton = false;
  goldenWords = '';

  bubbles: any[] = [];
  constructor(private router: Router, private audioService: AudioService) {}
  ngOnInit(): void {
    this.createDecorations();
    this.audioService.playFromTimestamp(67);
  }

  createDecorations(): void {
    // Create floating bubbles
    for (let i = 0; i < 20; i++) {
      this.bubbles.push({
        size: Math.random() * 60 + 20,
        left: Math.random() * 100,
        delay: Math.random() * 20,
        duration: Math.random() * 10 + 10,
      });
    }
  }

  onContainerClick(): void {
    this.showSecondMessage = true;
    this.showEnterButton = true;
    this.showGifContainer = true;

    // Transition messages with GSAP
    gsap.to('#messageContainer .message:first-child', {
      opacity: 0,
      y: -20,
      duration: 0.5,
      onComplete: () => {
        gsap.fromTo(
          '#messageContainer .message:last-child',
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.5 }
        );
      },
    });

    // Create hearts animation
    this.createHearts();
  }

  checkGoldenWords(): void {
    this.showLoveButton =
      this.goldenWords.trim().toLowerCase() === 'i love you';
    if (this.showLoveButton) {
      this.showIlyButton = true;
      gsap.fromTo(
        '#loveYouMoreBtn',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5 }
      );
    }
  }

  proceedToNext(): void {
    // Proceed to next page
    // You would typically use Angular Router here
    this.router.navigate(['/birthday']);
  }

  createHearts(): void {
    const emojis = ['❤️', '💖', '💕', '💓', '💗', '💘', '💝'];
    const messageContainer = document.getElementById('messageContainer');

    for (let i = 0; i < 15; i++) {
      setTimeout(() => {
        const heart = document.createElement('div');
        const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
        heart.innerHTML = randomEmoji;
        heart.classList.add('heart');
        heart.style.fontSize = `${Math.random() * 20 + 10}px`;

        if (messageContainer) {
          const containerRect = messageContainer.getBoundingClientRect();
          const startX = containerRect.x + Math.random() * containerRect.width;
          const startY = containerRect.y + containerRect.height;

          heart.style.left = `${startX}px`;
          heart.style.top = `${startY}px`;
        }

        document.body.appendChild(heart);

        // Animate the heart
        gsap.to(heart, {
          y: -150 - Math.random() * 100,
          x: (Math.random() - 0.5) * 100,
          opacity: 0,
          rotation: Math.random() * 90 - 45,
          duration: 2 + Math.random() * 3,
          ease: 'power1.out',
          onComplete: () => {
            heart.remove();
          },
        });

        gsap.to(heart, {
          scale: 0.5,
          duration: 2,
          ease: 'power1.in',
        });
      }, i * 100);
    }
  }
}
