import {
  Component,
  ElementRef,
  ViewChild,
  AfterViewInit,
  Inject,
  PLATFORM_ID,
  OnDestroy,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { gsap } from 'gsap';
import { TextPlugin } from 'gsap/TextPlugin';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

gsap.registerPlugin(TextPlugin);

@Component({
  selector: 'app-birthday',
  templateUrl: './birthday.component.html',
  styleUrls: ['./birthday.component.css'],
  standalone: true,
  imports: [CommonModule],
})
export class BirthdayComponent implements AfterViewInit, OnDestroy {
  // ViewChild elements
  @ViewChild('starCanvas') starCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('petalsCanvas') petalsCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('fireworksCanvas') fireworksCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('heartsContainer') heartsContainer!: ElementRef<HTMLDivElement>;
  @ViewChild('celebrateBtn') celebrateBtn!: ElementRef<HTMLButtonElement>;
  @ViewChild('nextPageBtn') nextPageBtn!: ElementRef<HTMLButtonElement>;
  @ViewChild('romMsg') romMsg!: ElementRef<HTMLParagraphElement>;
  @ViewChild('birthdayText', { read: ElementRef })
  birthdayTextElement!: ElementRef<HTMLHeadingElement>;

  // Keep original birthdayTextContent implementation
  get birthdayTextContent(): string[] {
    return this.birthdayTextElement?.nativeElement.textContent?.split('') || [];
  }

  // Content
  romanticMessage =
    "Every moment with you is a celebration, but today is especially magical. Here's to another year of love, laughter, and countless beautiful memories together.";
  birthdayText = 'Happy Birthday, ❤️ Sunny ❤️';

  // Heart styles
  heartStyles = [
    'left: 61.8259%; top: 6.59353%; transform: translate3d(-6.8327px, -195.416px, 0px) rotate(17.291deg) scale(0.5008, 0.5008); opacity: 0.0016;',
    'left: 30.0737%; top: 53.0245%; transform: translate3d(-0.9019px, -161.209px, 0px) rotate(27.5984deg) scale(0.5161, 0.5161); opacity: 0.0322;',
    'left: 10.1056%; top: 23.7416%; transform: translate3d(49.853px, -190.437px, 0px) rotate(-14.0983deg) scale(0.5005, 0.5005); opacity: 0.001;',
  ];

  heartColors = [
    'rgba(255, 22, 34, 0.995)',
    'rgba(255, 55, 61, 0.621)',
    'rgba(255, 90, 2, 0.968)',
  ];

  // Animation state
  private stars: Star[] = [];
  private petals: Petal[] = [];
  private fireworks: (Firework | HeartFirework)[] = [];
  private fireworksInterval: any;
  private heartFireworksInterval: any;
  private starCtx!: CanvasRenderingContext2D;
  private petalsCtx!: CanvasRenderingContext2D;
  private fireworksCtx!: CanvasRenderingContext2D;
  private isBrowser: boolean;
  private resizeListener?: () => void;

  constructor(
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngAfterViewInit(): void {
    if (this.isBrowser) {
      setTimeout(() => {
        this.initializeComponent();
      }, 0);
    } else {
      this.setupSSRContent();
    }
  }

  ngOnDestroy(): void {
    if (this.isBrowser) {
      this.cleanup();
    }
  }

  private cleanup(): void {
    if (this.resizeListener) {
      window.removeEventListener('resize', this.resizeListener);
    }
    if (this.fireworksInterval) {
      clearInterval(this.fireworksInterval);
    }
    if (this.heartFireworksInterval) {
      clearInterval(this.heartFireworksInterval);
    }
  }

  private setupSSRContent(): void {
    if (this.romMsg?.nativeElement) {
      this.romMsg.nativeElement.textContent = this.romanticMessage;
    }
    if (this.birthdayTextElement?.nativeElement) {
      this.birthdayTextElement.nativeElement.textContent = this.birthdayText;
    }
  }

  private initializeComponent(): void {
    if (this.allElementsReady()) {
      this.setupCanvases();
      this.startAnimations();
    } else {
      console.error('Some elements are still not ready');
    }
  }

  private allElementsReady(): boolean {
    return [
      this.starCanvas,
      this.petalsCanvas,
      this.fireworksCanvas,
      this.heartsContainer,
      this.celebrateBtn,
      this.nextPageBtn,
      this.romMsg,
      this.birthdayTextElement,
    ].every((el) => el?.nativeElement);
  }

  private setupCanvases(): void {
    this.resizeCanvas();
    this.resizeListener = () => this.resizeCanvas();
    window.addEventListener('resize', this.resizeListener);

    this.starCtx = this.getCanvasContext(this.starCanvas);
    this.petalsCtx = this.getCanvasContext(this.petalsCanvas);
    this.fireworksCtx = this.getCanvasContext(this.fireworksCanvas);

    // Create stars
    for (let i = 0; i < 200; i++) {
      this.stars.push(new Star(window.innerWidth, window.innerHeight));
    }

    // Create petals
    for (let i = 0; i < 50; i++) {
      this.petals.push(new Petal(window.innerWidth, window.innerHeight));
    }

    this.animateStars();
    this.animatePetals();
    this.animateFireworks();
  }

  private getCanvasContext(
    canvas: ElementRef<HTMLCanvasElement>
  ): CanvasRenderingContext2D {
    const ctx = canvas.nativeElement.getContext('2d');
    if (!ctx) throw new Error('Could not get canvas context');
    return ctx;
  }

  private resizeCanvas(): void {
    if (!this.isBrowser) return;

    const setCanvasSize = (canvas: ElementRef<HTMLCanvasElement>) => {
      if (canvas?.nativeElement) {
        canvas.nativeElement.width = window.innerWidth;
        canvas.nativeElement.height = window.innerHeight;
      }
    };

    setCanvasSize(this.starCanvas);
    setCanvasSize(this.petalsCanvas);
    setCanvasSize(this.fireworksCanvas);
  }

  private startAnimations(): void {
    if (!this.birthdayTextElement || !this.celebrateBtn || !this.romMsg) return;

    const h1 = this.birthdayTextElement.nativeElement;
    const celebrateBtn = this.celebrateBtn.nativeElement;

    h1.style.opacity = '0';
    h1.style.display = 'none';
    celebrateBtn.style.opacity = '0';
    celebrateBtn.style.display = 'none';
    celebrateBtn.style.transform = 'scale(0.8)';

    this.animateRomanticMessage();
  }

  private animateRomanticMessage(): void {
    const romMsg = this.romMsg.nativeElement;
    const romText = this.romanticMessage;
    romMsg.textContent = '';

    let romIndex = 0;
    const typingSpeed = 60;

    const typeRomMsg = () => {
      if (romIndex < romText.length) {
        romMsg.textContent += romText.charAt(romIndex++);
        setTimeout(typeRomMsg, typingSpeed);
      } else {
        this.animateBirthdayText();
      }
    };
    typeRomMsg();
  }

  private animateBirthdayText(): void {
    if (!this.birthdayTextElement) return;

    const h1 = this.birthdayTextElement.nativeElement;
    const h1Text = this.birthdayText;
    h1.textContent = '';
    h1.style.display = 'block';

    let h1Index = 0;
    const h1TypingSpeed = 60;

    const typeH1Msg = () => {
      if (h1Index < h1Text.length) {
        h1.textContent += h1Text.charAt(h1Index++);
        setTimeout(typeH1Msg, h1TypingSpeed);
      } else {
        gsap.to(h1, {
          opacity: 1,
          duration: 0.5,
          ease: 'power2.out',
          onComplete: () => this.showCelebrateButton(),
        });
      }
    };
    typeH1Msg();
  }

  private showCelebrateButton(): void {
    if (!this.celebrateBtn || !this.birthdayTextElement) return;

    const celebrateBtn = this.celebrateBtn.nativeElement;
    const birthdayText = this.birthdayTextElement.nativeElement;

    celebrateBtn.style.display = 'block';
    gsap.to(celebrateBtn, {
      opacity: 1,
      scale: 1,
      duration: 0.8,
      ease: 'elastic.out(1, 0.3)',
    });

    this.setupButtonHoverEffects();
    this.setupBirthdayTextAnimation();
    this.showNextPageButton();
  }

  private setupButtonHoverEffects(): void {
    if (!this.celebrateBtn) return;
    const celebrateBtn = this.celebrateBtn.nativeElement;

    celebrateBtn.addEventListener('mouseenter', () => {
      gsap.to(celebrateBtn, {
        scale: 1.1,
        duration: 0.4,
        ease: 'power1.out',
      });
    });

    celebrateBtn.addEventListener('mouseleave', () => {
      gsap.to(celebrateBtn, {
        scale: 1,
        duration: 0.4,
      });
    });
  }

  private setupBirthdayTextAnimation(): void {
    if (!this.birthdayTextElement) return;
    const birthdayText = this.birthdayTextElement.nativeElement;
    const text = this.birthdayText;

    birthdayText.textContent = '';
    for (let i = 0; i < text.length; i++) {
      const letter = document.createElement('span');
      letter.textContent = text[i];
      letter.className = 'letter';
      birthdayText.appendChild(letter);
    }

    setTimeout(() => {
      birthdayText.style.opacity = '1';
      const letters = birthdayText.querySelectorAll('.letter');
      letters.forEach((letter: Element, index: number) => {
        gsap.to(letter as HTMLElement, {
          opacity: 1,
          y: 0,
          delay: index * 0.1,
          duration: 0.6,
          ease: 'back.out(1.7)',
        });
      });
    }, 1000);
  }

  private showNextPageButton(): void {
    if (!this.nextPageBtn) return;
    const nextPageBtn = this.nextPageBtn.nativeElement;

    setTimeout(() => {
      gsap.to(nextPageBtn, {
        opacity: 1,
        duration: 0.8,
        ease: 'elastic.out(1, 0.3)',
      });
    }, 2000);
  }

  startCelebration(): void {
    if (!this.celebrateBtn || !this.isBrowser) return;

    const celebrateBtn = this.celebrateBtn.nativeElement;
    gsap.to(celebrateBtn, {
      scale: 0.95,
      duration: 0.1,
      onComplete: () => {
        this.startFireworks();
        gsap.to(celebrateBtn, {
          scale: 1,
          duration: 0.5,
          ease: 'elastic.out(1, 0.3)',
        });
      },
    });
  }

  private startFireworks(): void {
    this.fireworksInterval = setInterval(() => this.addFirework(), 500);
    setTimeout(() => {
      clearInterval(this.fireworksInterval);
    }, 5000);

    this.heartFireworksInterval = setInterval(
      () => this.addFloatingHeart(),
      300
    );
    setTimeout(() => {
      clearInterval(this.heartFireworksInterval);
    }, 4000);
  }

  private addFirework(): void {
    if (!this.fireworksCanvas) return;

    if (Math.random() < 0.3) {
      this.fireworks.push(
        new HeartFirework(
          this.fireworksCanvas.nativeElement.width,
          this.fireworksCanvas.nativeElement.height
        )
      );
    } else {
      this.fireworks.push(
        new Firework(
          this.fireworksCanvas.nativeElement.width,
          this.fireworksCanvas.nativeElement.height
        )
      );
    }
  }

  private addFloatingHeart(): void {
    if (!this.heartsContainer) return;

    const heart = document.createElement('div');
    heart.className = 'heart';
    heart.style.left = `${Math.random() * 90 + 5}%`;
    heart.style.top = `${Math.random() * 90 + 5}%`;
    heart.innerHTML = `
      <svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" 
              fill="rgba(255, ${Math.random() * 100}, ${Math.random() * 100}, ${
      Math.random() * 0.4 + 0.6
    })"/>
      </svg>
    `;
    this.heartsContainer.nativeElement.appendChild(heart);

    gsap.to(heart, {
      opacity: 1,
      scale: 1,
      duration: 0.5,
      ease: 'elastic.out(1, 0.3)',
      onComplete: () => {
        gsap.to(heart, {
          y: -100 - Math.random() * 100,
          x: (Math.random() - 0.5) * 100,
          opacity: 0,
          rotation: Math.random() * 60 - 30,
          scale: 0.5,
          duration: 4 + Math.random() * 4,
          ease: 'power1.out',
          onComplete: () => heart.remove(),
        });
      },
    });
  }

  private animateStars(): void {
    if (!this.starCanvas) return;

    this.starCtx.clearRect(
      0,
      0,
      this.starCanvas.nativeElement.width,
      this.starCanvas.nativeElement.height
    );

    this.stars.forEach((star) => {
      star.update();
      star.draw(this.starCtx);
    });

    requestAnimationFrame(() => this.animateStars());
  }

  private animatePetals(): void {
    if (!this.petalsCanvas) return;

    this.petalsCtx.clearRect(
      0,
      0,
      this.petalsCanvas.nativeElement.width,
      this.petalsCanvas.nativeElement.height
    );

    this.petals.forEach((petal) => {
      petal.update();
      petal.draw(this.petalsCtx);
    });

    requestAnimationFrame(() => this.animatePetals());
  }

  private animateFireworks(): void {
    if (!this.fireworksCanvas) return;

    this.fireworksCtx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    this.fireworksCtx.fillRect(
      0,
      0,
      this.fireworksCanvas.nativeElement.width,
      this.fireworksCanvas.nativeElement.height
    );

    for (let i = 0; i < this.fireworks.length; i++) {
      this.fireworks[i].update();
      this.fireworks[i].draw(this.fireworksCtx);

      if (
        this.fireworks[i].exploded &&
        this.fireworks[i].particles.length === 0
      ) {
        this.fireworks.splice(i, 1);
        i--;
      }
    }

    requestAnimationFrame(() => this.animateFireworks());
  }

  navigateToCake(): void {
    this.router.navigate(['/cake']);
  }
}

// Canvas element classes
class Star {
  x!: number;
  y!: number;
  size!: number;
  maxSize!: number;
  opacity!: number;
  glowFactor!: number;
  speed!: number;
  growing!: boolean;
  color!: { r: number; g: number; b: number };

  constructor(private canvasWidth: number, private canvasHeight: number) {
    this.reset();
  }

  reset(): void {
    this.x = Math.random() * this.canvasWidth;
    this.y = Math.random() * this.canvasHeight;
    this.size = Math.random() * 2 + 0.5;
    this.maxSize = this.size + Math.random() * 2;
    this.opacity = Math.random() * 0.5 + 0.3;
    this.glowFactor = Math.random() * 15 + 5;
    this.speed = Math.random() * 0.05 + 0.01;
    this.growing = Math.random() > 0.5;
    this.color = {
      r: 255,
      g: Math.floor(Math.random() * 100) + 155,
      b: Math.floor(Math.random() * 155) + 100,
    };
  }

  update(): void {
    if (this.growing) {
      this.size += this.speed;
      if (this.size >= this.maxSize) {
        this.growing = false;
      }
    } else {
      this.size -= this.speed;
      if (this.size <= 0.5) {
        this.growing = true;
      }
    }

    if (Math.random() < 0.01) {
      this.color.g = Math.floor(Math.random() * 100) + 155;
      this.color.b = Math.floor(Math.random() * 155) + 100;
    }

    if (Math.random() < 0.001) {
      this.reset();
    }
  }

  draw(ctx: CanvasRenderingContext2D): void {
    const glow = ctx.createRadialGradient(
      this.x,
      this.y,
      0,
      this.x,
      this.y,
      this.size * this.glowFactor
    );

    glow.addColorStop(
      0,
      `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${this.opacity})`
    );
    glow.addColorStop(1, 'rgba(255, 255, 255, 0)');

    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size * this.glowFactor, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${this.opacity})`;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
  }
}

class Petal {
  x!: number;
  y!: number;
  size!: number;
  speedY!: number;
  speedX!: number;
  rotation!: number;
  rotationSpeed!: number;
  opacity!: number;
  color!: { r: number; g: number; b: number };

  constructor(private canvasWidth: number, private canvasHeight: number) {
    this.reset();
  }

  reset(): void {
    this.x = Math.random() * this.canvasWidth;
    this.y = -20;
    this.size = Math.random() * 15 + 8;
    this.speedY = Math.random() * 1 + 0.5;
    this.speedX = Math.random() * 2 - 1;
    this.rotation = Math.random() * 360;
    this.rotationSpeed = Math.random() * 2 - 1;
    this.opacity = Math.random() * 0.5 + 0.5;
    this.color = {
      r: Math.floor(Math.random() * 55) + 200,
      g: Math.floor(Math.random() * 50),
      b: Math.floor(Math.random() * 80) + 50,
    };
  }

  update(): void {
    this.y += this.speedY;
    this.x += Math.sin(this.y * 0.01) + this.speedX;
    this.rotation += this.rotationSpeed;

    if (this.y > this.canvasHeight) {
      this.reset();
    }
  }

  draw(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate((this.rotation * Math.PI) / 180);

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(
      this.size / 2,
      -this.size / 4,
      this.size,
      -this.size / 2,
      0,
      -this.size
    );
    ctx.bezierCurveTo(
      -this.size,
      -this.size / 2,
      -this.size / 2,
      -this.size / 4,
      0,
      0
    );

    const gradient = ctx.createLinearGradient(0, 0, 0, -this.size);
    gradient.addColorStop(
      0,
      `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${this.opacity})`
    );
    gradient.addColorStop(
      1,
      `rgba(${this.color.r - 30}, ${this.color.g}, ${this.color.b + 20}, ${
        this.opacity * 0.7
      })`
    );
    ctx.fillStyle = gradient;
    ctx.fill();

    ctx.restore();
  }
}

class FireworkParticle {
  x: number;
  y: number;
  color: { r: number; g: number; b: number };
  radius: number;
  velocity: { x: number; y: number };
  gravity: number;
  friction: number;
  opacity: number;
  life: number;
  remainingLife: number;

  constructor(
    x: number,
    y: number,
    color: { r: number; g: number; b: number }
  ) {
    this.x = x;
    this.y = y;
    this.color = color;
    this.radius = Math.random() * 3 + 1;
    this.velocity = {
      x: (Math.random() - 0.5) * 8,
      y: (Math.random() - 0.5) * 8,
    };
    this.gravity = 0.04;
    this.friction = 0.97;
    this.opacity = 1;
    this.life = Math.random() * 60 + 80;
    this.remainingLife = this.life;
  }

  update(): void {
    this.velocity.y += this.gravity;
    this.velocity.x *= this.friction;
    this.velocity.y *= this.friction;

    this.x += this.velocity.x;
    this.y += this.velocity.y;

    this.remainingLife--;
    this.opacity = this.remainingLife / this.life;
  }

  draw(ctx: CanvasRenderingContext2D): void {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${this.opacity})`;
    ctx.fill();

    const glow = ctx.createRadialGradient(
      this.x,
      this.y,
      0,
      this.x,
      this.y,
      this.radius * 4
    );

    glow.addColorStop(
      0,
      `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${
        this.opacity * 0.7
      })`
    );
    glow.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius * 4, 0, Math.PI * 2);
    ctx.fill();
  }
}

class Firework {
  x: number;
  y: number;
  destination: { x: number; y: number };
  velocity: { x: number; y: number };
  particles: FireworkParticle[];
  color: { r: number; g: number; b: number };
  trail: { x: number; y: number; opacity: number }[];
  exploded: boolean;

  constructor(private canvasWidth: number, private canvasHeight: number) {
    this.x = Math.random() * canvasWidth;
    this.y = canvasHeight;
    this.destination = {
      x: Math.random() * canvasWidth,
      y: Math.random() * (canvasHeight * 0.6),
    };
    this.velocity = {
      x: (this.destination.x - this.x) / 100,
      y: (this.destination.y - this.y) / 100,
    };
    this.particles = [];
    this.color = {
      r: Math.floor(Math.random() * 200) + 55,
      g: Math.floor(Math.random() * 200) + 55,
      b: Math.floor(Math.random() * 255),
    };
    this.trail = [];
    this.exploded = false;
  }

  update(): void {
    if (!this.exploded) {
      this.x += this.velocity.x;
      this.y += this.velocity.y;

      this.trail.push({
        x: this.x,
        y: this.y,
        opacity: 1,
      });

      for (let i = 0; i < this.trail.length; i++) {
        this.trail[i].opacity -= 0.025;
        if (this.trail[i].opacity <= 0) {
          this.trail.splice(i, 1);
          i--;
        }
      }

      const distance = Math.sqrt(
        Math.pow(this.x - this.destination.x, 2) +
          Math.pow(this.y - this.destination.y, 2)
      );

      if (distance < 10 || this.y <= this.destination.y) {
        this.explode();
      }
    } else {
      for (let i = 0; i < this.particles.length; i++) {
        this.particles[i].update();
        if (this.particles[i].remainingLife <= 0) {
          this.particles.splice(i, 1);
          i--;
        }
      }
    }
  }

  explode(): void {
    this.exploded = true;
    const particleCount = Math.floor(Math.random() * 50) + 80;
    for (let i = 0; i < particleCount; i++) {
      this.particles.push(new FireworkParticle(this.x, this.y, this.color));
    }
  }

  draw(ctx: CanvasRenderingContext2D): void {
    if (!this.exploded) {
      for (let i = 0; i < this.trail.length; i++) {
        ctx.beginPath();
        ctx.arc(this.trail[i].x, this.trail[i].y, 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${this.trail[i].opacity})`;
        ctx.fill();
      }

      ctx.beginPath();
      ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
      ctx.fillStyle = `rgb(${this.color.r}, ${this.color.g}, ${this.color.b})`;
      ctx.fill();
    } else {
      for (let i = 0; i < this.particles.length; i++) {
        this.particles[i].draw(ctx);
      }
    }
  }
}

class HeartFirework extends Firework {
  constructor(canvasWidth: number, canvasHeight: number) {
    super(canvasWidth, canvasHeight);
    this.color = {
      r: Math.floor(Math.random() * 55) + 200,
      g: Math.floor(Math.random() * 50),
      b: Math.floor(Math.random() * 80) + 50,
    };
  }

  override explode(): void {
    this.exploded = true;
    const heartPoints = [];
    const totalPoints = 150;

    for (let i = 0; i < totalPoints; i++) {
      const angle = (i / totalPoints) * Math.PI * 2;
      const heartX = 16 * Math.pow(Math.sin(angle), 3);
      const heartY = -(
        13 * Math.cos(angle) -
        5 * Math.cos(2 * angle) -
        2 * Math.cos(3 * angle) -
        Math.cos(4 * angle)
      );

      heartPoints.push({
        x: heartX * 3,
        y: heartY * 3,
      });
    }

    for (let i = 0; i < heartPoints.length; i++) {
      const particle = new FireworkParticle(this.x, this.y, this.color);
      particle.velocity.x = heartPoints[i].x * (Math.random() * 0.1 + 0.05);
      particle.velocity.y = heartPoints[i].y * (Math.random() * 0.1 + 0.05);
      this.particles.push(particle);
    }
  }
}
