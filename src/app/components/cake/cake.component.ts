import {
  Component,
  Inject,
  PLATFORM_ID,
  NgZone,
  ViewChild,
  ElementRef,
  AfterViewInit,
  OnDestroy,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router'; // Correct import
import { gsap } from 'gsap';

@Component({
  selector: 'app-cake',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cake.component.html',
  styleUrls: ['./cake.component.css'],
})
export class CakeComponent implements AfterViewInit, OnDestroy {
  // Scrolling words elements
  @ViewChild('scrollingWords') scrollingWords!: ElementRef;
  @ViewChild('scrollingWordsClone') scrollingWordsClone!: ElementRef;
  @ViewChild('leftSlider') leftSlider!: ElementRef;
  @ViewChild('rightSlider') rightSlider!: ElementRef;

  // Animation control
  private animationFrameId!: number;
  private scrollSpeed = 50; // pixels per second
  private scrollPosition = 0;
  private totalWidth = 0;

  // Phrases with emojis (kept together)
  phrases = [
    'Sugarplum 🍯',
    'Pookie 🧸',
    'Sunshine ❤️☀️❤️',
    'Maryland mei meri hogi 💯🙏',
    'Teleport ✨✈️',
    'Treasure in chat 💗',
    'Vitamin You 🍦',
    'No comeback 😁',
    'Oxford dictionary 🏫😂',
    'Fix my tickets - severity level is infinity 😈',
    'Goodnight bolne k baad sona hota h 💫💌',
  ];

  // Slider images
  imageUrls = [
    'assets/images/tiles/tiles001.png',
    'assets/images/tiles/tiles002.png',
    'assets/images/tiles/tiles003.jpg',
    'assets/images/tiles/tiles004.png',
    'assets/images/tiles/tiles005.png',
    'assets/images/tiles/tiles006.png',
    'assets/images/tiles/tiles007.png',
    'assets/images/tiles/tiles008.jpg',
    'assets/images/tiles/tiles009.jpg',
    'assets/images/tiles/tiles010.jpg',
    'assets/images/tiles/tiles011.jpg',
    'assets/images/tiles/tiles012.jpg',
    'assets/images/tiles/tiles013.jpg',
    'assets/images/tiles/tiles014.jpg',
    'assets/images/tiles/tiles015.jpg',
    'assets/images/tiles/tiles016.jpg',
    'assets/images/tiles/tiles017.jpg',
    'assets/images/tiles/tiles018.jpg',
    'assets/images/tiles/tiles019.jpg',
    'assets/images/tiles/tiles020.jpg',
    'assets/images/tiles/tiles021.jpg',
    'assets/images/tiles/tiles022.jpg',
    'assets/images/tiles/tiles023.jpg',
    'assets/images/tiles/tiles024.jpg',
    'assets/images/tiles/tiles025.jpg',
    'assets/images/tiles/tiles026.jpg',
    'assets/images/tiles/tiles027.jpg',
    'assets/images/tiles/tiles028.jpg',
    'assets/images/tiles/tiles029.jpg',
    'assets/images/tiles/tiles030.jpg',
    'assets/images/tiles/tiles031.jpg',
    'assets/images/tiles/tiles032.jpg',
    'assets/images/tiles/tiles033.jpg',
  ];
  reversedImageUrls = [...this.imageUrls].reverse();
  imagesLoaded = false;
  loadedImageCount = 0;

  // Celebration ribbons
  private ribbonColors = [
    'linear-gradient(45deg, #FF9ECD, #FF71B6)',
    'linear-gradient(45deg, #FFB7E0, #FF8AC7)',
    'linear-gradient(45deg, #FFC4E6, #FFA3D4)',
    'linear-gradient(45deg, #E0C3FC, #BDE0FE)',
    'linear-gradient(45deg, #FFCAD4, #FFD1E3)',
  ];

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private ngZone: NgZone,
    private router: Router // Inject Router
  ) {}

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.setupSliders();
      this.initScrollingWords();
      this.setupEventListeners();
    }
  }

  private setupSliders(): void {
    // Preload all images
    this.imageUrls.forEach((url) => {
      const img = new Image();
      img.src = url;
      img.onload = () => this.onImageLoad();
      img.onerror = () => this.onImageLoad(); // Count even if error
    });
  }

  ngOnDestroy(): void {
    if (isPlatformBrowser(this.platformId)) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }

  /* Scrolling Words Animation */
  private initScrollingWords(): void {
    this.calculateTotalWidth();
    this.startScrollingAnimation();
  }

  private calculateTotalWidth(): void {
    const spans = [
      ...this.scrollingWords.nativeElement.querySelectorAll('span'),
    ] as HTMLElement[];

    this.totalWidth = spans.reduce(
      (total, span) => total + span.offsetWidth + 48,
      0
    );

    this.scrollingWordsClone.nativeElement.style.left = `${this.totalWidth}px`;
  }

  private startScrollingAnimation(): void {
    const animate = () => {
      this.scrollPosition -= this.scrollSpeed / 60;

      if (this.scrollPosition <= -this.totalWidth) {
        this.scrollPosition = 0;
      }

      this.scrollingWords.nativeElement.style.transform = `translateX(${this.scrollPosition}px)`;
      this.scrollingWordsClone.nativeElement.style.transform = `translateX(${
        this.scrollPosition + this.totalWidth
      }px)`;

      this.animationFrameId = requestAnimationFrame(animate);
    };

    animate();
  }

  /* Image Sliders */
  onImageLoad() {
    this.loadedImageCount++;
    if (this.loadedImageCount >= this.imageUrls.length * 2) {
      this.imagesLoaded = true;
      setTimeout(() => this.animateSliders(), 50); // Small delay for render
    }
  }

  goToFinalPage() {
    if (isPlatformBrowser(this.platformId)) {
      this.ngZone.run(() => {
        this.router.navigate(['/card']); // Navigate to card route
      });
    }
  }

  private animateSliders(): void {
    const leftSlider = this.leftSlider.nativeElement;
    const rightSlider = this.rightSlider.nativeElement;

    const speed = 50;
    const itemHeight = 170; // 150px height + 20px margin

    let leftPosition = 0;
    let rightPosition = 0;

    const animate = () => {
      leftPosition += speed / 60;
      rightPosition += speed / 60;

      if (leftPosition >= itemHeight) {
        leftPosition = 0;
        leftSlider.appendChild(leftSlider.firstElementChild);
      }

      if (rightPosition >= itemHeight) {
        rightPosition = 0;
        rightSlider.appendChild(rightSlider.firstElementChild);
      }

      leftSlider.style.transform = `translateY(-${leftPosition}px)`;
      rightSlider.style.transform = `translateY(-${rightPosition}px)`;

      this.animationFrameId = requestAnimationFrame(animate);
    };

    // Start with first image already in position
    leftSlider.style.transform = 'translateY(0)';
    rightSlider.style.transform = 'translateY(0)';
    animate();
  }

  /* Cake Celebration */
  private setupEventListeners(): void {
    const cake = document.querySelector('.cake-container');
    const nextButton = document.querySelector('.next-page-button');

    cake?.addEventListener('click', () => this.startCelebration());
    nextButton?.addEventListener('click', () => this.goToFinalPage());
  }

  private createRibbon(): void {
    const ribbon = document.createElement('div');
    ribbon.className = 'ribbon';
    ribbon.style.left = `${Math.random() * window.innerWidth}px`;
    ribbon.style.background =
      this.ribbonColors[Math.floor(Math.random() * this.ribbonColors.length)];
    document.body.appendChild(ribbon);

    ribbon.addEventListener('animationend', () => {
      ribbon.remove();
    });
  }

  private startCelebration(): void {
    const candle = document.querySelector('.candle');
    const nextButton = document.querySelector('.next-page-button');
    let isClicked = false;

    if (isClicked || !candle) return;
    isClicked = true;

    gsap.to(candle, {
      opacity: 0,
      y: -20,
      duration: 1,
      ease: 'power2.out',
      onComplete: () => candle.remove(),
    });

    const ribbonInterval = setInterval(() => {
      for (let i = 0; i < 5; i++) {
        setTimeout(() => this.createRibbon(), i * 100);
      }
    }, 200);

    setTimeout(() => {
      nextButton?.classList.add('show');
    }, 2000);

    setTimeout(() => {
      clearInterval(ribbonInterval);
    }, 5000);
  }
}
