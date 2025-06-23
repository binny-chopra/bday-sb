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
import { Router } from '@angular/router';
import { gsap } from 'gsap';
import {RIBBON_COLORS, IMAGE_URLS, PHRASES} from '../../utils/constants'

@Component({
  selector: 'app-cake',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cake.component.html',
  styleUrls: ['./cake.component.css'],
})
export class CakeComponent implements AfterViewInit, OnDestroy {
  // Constants
  private readonly SCROLL_SPEED = 50; // pixels per second
  private readonly RIBBON_COLORS = RIBBON_COLORS;
  private readonly PHRASES = PHRASES;
  private readonly IMAGE_URLS = IMAGE_URLS;

  // View Children
  @ViewChild('scrollingWords') scrollingWords!: ElementRef<HTMLDivElement>;
  @ViewChild('scrollingWordsClone') scrollingWordsClone!: ElementRef<HTMLDivElement>;
  @ViewChild('leftSlider') leftSlider!: ElementRef<HTMLDivElement>;
  @ViewChild('rightSlider') rightSlider!: ElementRef<HTMLDivElement>;

  // Component State
  phrases = this.PHRASES;
  imageUrls = this.IMAGE_URLS;
  reversedImageUrls = [...this.IMAGE_URLS].reverse();
  imagesLoaded = false;
  
  // Animation State
  private animationFrameId!: number;
  private scrollPosition = 0;
  private totalWidth = 0;
  private loadedImageCount = 0;
  private isCelebrating = false;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private ngZone: NgZone,
    private router: Router
  ) {}

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.preloadImages();
      this.initScrollingText();
    }
  }

  ngOnDestroy(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.cleanupAnimations();
    }
  }

  // Public Methods
  onImageLoad(): void {
    this.loadedImageCount++;
    if (this.loadedImageCount >= this.imageUrls.length * 2) {
      this.imagesLoaded = true;
      setTimeout(() => this.initSliders(), 50);
    }
  }

  goToFinalPage(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.ngZone.run(() => {
        this.router.navigate(['/card']);
      });
    }
  }

  startCelebration(): void {
    if (this.isCelebrating) return;
    this.isCelebrating = true;

    const candle = document.querySelector('.candle');
    const nextButton = document.querySelector('.next-page-button');

    if (!candle) return;

    // Animate candle
    gsap.to(candle, {
      opacity: 0,
      y: -20,
      duration: 1,
      ease: 'power2.out',
      onComplete: () => candle.remove(),
    });

    // Start ribbon animation
    const ribbonInterval = setInterval(() => {
      for (let i = 0; i < 5; i++) {
        setTimeout(() => this.createRibbon(), i * 100);
      }
    }, 200);

    // Show next button after delay
    setTimeout(() => {
      nextButton?.classList.add('show');
    }, 2000);

    // Clean up ribbon animation
    setTimeout(() => {
      clearInterval(ribbonInterval);
    }, 5000);
  }

  // Private Methods
  private preloadImages(): void {
    this.imageUrls.forEach((url) => {
      const img = new Image();
      img.src = url;
      img.onload = () => this.onImageLoad();
      img.onerror = () => this.onImageLoad(); // Count even if error
    });
  }

  private initScrollingText(): void {
    this.calculateTextWidth();
    this.startTextAnimation();
  }

private calculateTextWidth(): void {
  const spans = Array.from(
    this.scrollingWords.nativeElement.querySelectorAll('span')
  ) as HTMLElement[];

  this.totalWidth = spans.reduce(
    (total, span) => total + span.offsetWidth + 48,
    0
  );

  this.scrollingWordsClone.nativeElement.style.left = `${this.totalWidth}px`;
}

  private startTextAnimation(): void {
    const animate = () => {
      this.scrollPosition -= this.SCROLL_SPEED / 60;

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

private initSliders(): void {
  const leftSlider = this.leftSlider.nativeElement;
  const rightSlider = this.rightSlider.nativeElement;
  const itemHeight = 170; // 150px height + 20px margin

  let leftPosition = 0;
  let rightPosition = 0;

  const animate = () => {
    leftPosition += this.SCROLL_SPEED / 60;
    rightPosition += this.SCROLL_SPEED / 60;

    if (leftPosition >= itemHeight) {
      leftPosition = 0;
      if (leftSlider.firstElementChild) {
        leftSlider.appendChild(leftSlider.firstElementChild);
      }
    }

    if (rightPosition >= itemHeight) {
      rightPosition = 0;
      if (rightSlider.firstElementChild) {
        rightSlider.appendChild(rightSlider.firstElementChild);
      }
    }

    leftSlider.style.transform = `translateY(-${leftPosition}px)`;
    rightSlider.style.transform = `translateY(-${rightPosition}px)`;

    this.animationFrameId = requestAnimationFrame(animate);
  };

  animate();
}

  private createRibbon(): void {
    const ribbon = document.createElement('div');
    ribbon.className = 'ribbon';
    ribbon.style.left = `${Math.random() * window.innerWidth}px`;
    ribbon.style.background = 
      this.RIBBON_COLORS[Math.floor(Math.random() * this.RIBBON_COLORS.length)];
    document.body.appendChild(ribbon);

    ribbon.addEventListener('animationend', () => {
      ribbon.remove();
    });
  }

  private cleanupAnimations(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }
}