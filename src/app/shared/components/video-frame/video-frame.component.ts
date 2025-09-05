import { Component, inject, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdvertisingComponent } from '../advertising/advertising.component';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ConstantesGenerales } from '../../utils/constants';

@Component({
  selector: 'app-video-frame',
  imports: [CommonModule, AdvertisingComponent],
  templateUrl: './video-frame.component.html',
})
export class VideoFrameComponent implements OnInit {
  private sanitizer = inject(DomSanitizer);
  public linkSoporteBcp = ConstantesGenerales.BCP_SOPORTE;
  public videoUrl: SafeResourceUrl;
  @Input() shortId = '';

  ngOnInit(): void {
    const urlYT = 'https://www.youtube.com';
    this.videoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(`${urlYT}/embed/${this.shortId}?playlist=${this.shortId}&loop=1&autoplay=1&mute=1`);
  }
  showVideo = true;
  onShowVideo() {
    this.showVideo = !this.showVideo;
  }
}
