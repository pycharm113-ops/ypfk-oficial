import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-ibk',
  standalone: true,
  imports: [RouterOutlet, CommonModule],
  templateUrl: './ibk.component.html',
})
export class IbkComponent implements OnInit, OnDestroy {
  private previousFontSize: string | null = null;

  ngOnInit(): void {
    this.previousFontSize = document.documentElement.style.fontSize;
    document.documentElement.style.fontSize = '14px';
  }

  ngOnDestroy(): void {
    if (this.previousFontSize) {
      document.documentElement.style.fontSize = this.previousFontSize;
    } else {
      document.documentElement.style.removeProperty('font-size');
    }
  }
}
