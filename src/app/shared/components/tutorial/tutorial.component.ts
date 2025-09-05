import { Component, ElementRef, inject, ViewChild, OnInit } from '@angular/core';
import { DynamicDialogConfig } from 'primeng/dynamicdialog';
import { ConstantesGenerales } from '../../utils/constants';
import Plyr from 'plyr';

@Component({
  selector: 'app-tutorial',
  templateUrl: './tutorial.component.html',
})
export class TutorialComponent implements OnInit {
  @ViewChild('videoPlayer', { static: true }) videoRef!: ElementRef<HTMLVideoElement>;
  public videoSrc: string = '';
  private config = inject(DynamicDialogConfig);

  ngOnInit(): void {
    if (this.config.data) {
      const tipo = this.config.data as keyof typeof ConstantesGenerales.TUTORIALES;
      this.videoSrc = ConstantesGenerales.TUTORIALES[tipo] ?? '';
    }
  }

  player!: Plyr;
  ngAfterViewInit(): void {
    this.player = new Plyr(this.videoRef.nativeElement, {
      controls: ['play', 'play-large', 'progress', 'mute', 'volume', 'responsive', 'fluid'],
      clickToPlay: true,
    });
  }
}
