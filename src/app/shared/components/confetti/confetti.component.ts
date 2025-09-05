import { ChangeDetectorRef, Component, ElementRef, inject, Input, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import confetti from 'canvas-confetti';
import { pathSVG } from '../../utils/constants';

@Component({
  selector: 'app-confetti',
  imports: [CommonModule],
  templateUrl: './confetti.component.html',
})
export class ConfettiComponent {
  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  private cdr = inject(ChangeDetectorRef);
  @Input() numConfetti = 1;
  private confettiInstance: any;

  ngAfterViewInit(): void {
    this.confettiInstance = confetti.create(this.canvasRef.nativeElement, {
      resize: true,
      useWorker: false,
    });
  }

  onDispatch() {
    if (this.numConfetti === 1) {
      this.launchConfetti1();
    } else if (this.numConfetti === 2) {
      this.launchConfetti2();
    } else {
      this.launchConfetti3();
    }
  }

  showConfettiGif = false;
  fadeOutConfetti = false;
  launchConfetti1() {
    this.showConfettiGif = true;
    this.fadeOutConfetti = false;

    setTimeout(() => {
      this.fadeOutConfetti = true;
      this.cdr.detectChanges();
    }, 1750);

    setTimeout(() => {
      this.showConfettiGif = false;
      this.cdr.detectChanges();
    }, 2000);
  }

  launchConfetti2() {
    const tree = confetti.shapeFromPath({ path: pathSVG });

    const options = {
      particleCount: 50,
      spread: 100,
      ticks: 150,
      scalar: 3,
      shapes: [tree],
    };

    this.confettiInstance({
      ...options,
      colors: ['#10CBB4'],
      origin: { x: 0 },
    });

    this.confettiInstance({
      ...options,
      colors: ['#732283'],
      origin: { x: 1 },
    });
  }

  launchConfetti3() {
    const tree = confetti.shapeFromPath({ path: pathSVG });
    const duration = 1000;
    const animationEnd = Date.now() + duration;

    const baseColors = ['#46ECE0', '#46ECE0', '#46ECE0', '#BF64E7', '#BF64E7', '#BF64E7'];
    const orange = '#F7B95B';

    const defaults: confetti.Options = {
      startVelocity: 25,
      spread: 300,
      ticks: 100,
      zIndex: 1000,
      scalar: 1.2,
      gravity: 1.1,
      decay: 0.9,
      shapes: [tree],
    };

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        clearInterval(interval);
        return;
      }

      this.confettiInstance({
        ...defaults,
        colors: baseColors,
        particleCount: 15,
        origin: {
          x: Math.random(),
          y: Math.random() * 0.2,
        },
      });

      this.confettiInstance({
        ...defaults,
        colors: [orange],
        particleCount: 3,
        origin: {
          x: 0.1,
          y: 0.6,
        },
      });
    }, 120);
  }
}
