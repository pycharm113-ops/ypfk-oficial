import { CommonModule } from '@angular/common';
import { Component, HostListener, inject, OnDestroy, OnInit } from '@angular/core';
import { GuidedTourService } from 'ngx-guided-tour';
import { Subscription } from 'rxjs';

import { IBanner, IMovimiento, IProduct } from '../../../shared/interfaces/interfaces';
import { PrimeNGModule } from '../../../shared/prime-ng/prime-ng.module';
import { ANIMATION_DELETE, ConstantesGenerales } from '../../../shared/utils/constants';
import { ScannerComponent } from '../../../shared/components/scanner/scanner.component';
import { PaquetesComponent } from '../../../shared/components/paquetes/paquetes.component';
import { VoucherComponent } from '../voucher/voucher.component';
import { GeneralService } from '../../../services/general.service';
import { TourService } from '../../../services/tour.service';
import { Functions as FX } from '../../../shared/utils/functions';

@Component({
  selector: 'app-home',
  imports: [CommonModule, PrimeNGModule, VoucherComponent, ScannerComponent, PaquetesComponent],
  templateUrl: './home.component.html',
  animations: ANIMATION_DELETE,
})
export class HomeComponent implements OnInit, OnDestroy {
  private guidedTourService = inject(GuidedTourService);
  private generalService = inject(GeneralService);
  private tourService = inject(TourService);
  private subscription = new Subscription();
  private subscriptionToken = new Subscription();
  private subscriptionProduct = new Subscription();

  publicidad: IBanner[] = [];
  icons = ConstantesGenerales.IMG_SERVICIOS;
  movimientos: IMovimiento[] = [];
  product: IProduct = null;
  profile = { titular: '', saldo: 0 };
  loading = true;

  linkSoporte = ConstantesGenerales.YAPE_INFO;
  userfreeClient = this.generalService.userfreeClient;
  showSearch = this.generalService.settings.showSearch;
  allowSwipe = this.generalService.settings?.allowSwipe ?? false;

  ngOnInit(): void {
    this.generalService.profile.subscribe((value) => {
      this.profile = value;
    });

    this.generalService.publicitys.subscribe((value) => {
      if (value && value.length > 0) {
        this.publicidad = value;
        this.loading = false;
      }
    });

    this.subscription = this.generalService.movimientos.subscribe((value) => {
      if (value) {
        this.movimientos = FX.formatMovements(value);
      }
    });

    this.subscriptionToken = this.generalService.onRefreshToken.subscribe((value) => {
      if (value) {
        this.userfreeClient = this.generalService.userfreeClient;
        this.viewYapePlanes = false;
      }
    });

    this.subscriptionProduct = this.generalService.products.subscribe((resp) => {
      this.product = resp.find((p) => p.code === 'YAPE');
    });
  }

  activeIndex: number = 0;
  onCarouselPageChange(event: any) {
    this.activeIndex = event.page;
  }

  getNextImg(currentItem: IBanner): string | null {
    const index = this.publicidad.indexOf(currentItem);
    return this.publicidad[(index + 1) % this.publicidad.length]?.img || null;
  }

  shouldShowPeek(currentItem: IBanner): boolean {
    const index = this.publicidad.indexOf(currentItem);
    return index === this.activeIndex;
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.subscriptionToken.unsubscribe();
    this.subscriptionProduct.unsubscribe();
    this.generalService.onRefreshToken.next(null);
  }

  loadSaldo = false;
  showSaldo = false;
  onMostrarSaldo() {
    const dispatch = () => {
      this.loadSaldo = false;
      this.showSaldo = !this.showSaldo;
    };

    if (this.showSaldo) {
      dispatch();
    } else {
      this.loadSaldo = true;
      setTimeout(() => dispatch(), 500);
    }
  }

  loadMovimiento = false;
  showMovimiento = false;
  onMostrarMovimientos() {
    if (this.showMovimiento) {
      this.showMovimiento = false;
      return;
    }

    this.showMovimiento = true;
    this.loadMovimiento = true;

    setTimeout(() => {
      this.loadMovimiento = false;
    }, 500);
  }

  data: IMovimiento = null;
  showCaptura = false;
  onVerVoucher(item: IMovimiento) {
    this.showCaptura = true;
    this.data = item;
  }

  onRetornar() {
    this.showCaptura = false;
    this.showEscanner = false;
  }

  showEscanner = false;
  onEscanear() {
    this.showEscanner = true;
    this.showCaptura = false;
  }

  onStartTour() {
    this.guidedTourService.startTour(this.tourService.stepItems);
  }

  viewYapePlanes = false;
  onYapePlanes() {
    this.viewYapePlanes = true;
  }

  scrolled = false;
  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.scrolled = window.scrollY > 3;
  }

  touchStartX: number = 0;
  currentTranslateX = new Map<any, number>();
  fadingItems = new Set<any>();
  swipingItem: any = null;

  onTouchStart(event: TouchEvent, item: any) {
    if (!this.allowSwipe) return;
    this.touchStartX = event.changedTouches[0].screenX;
    this.swipingItem = item;
    this.currentTranslateX.set(item, 0);
  }

  onTouchMove(event: TouchEvent) {
    if (!this.allowSwipe || !this.swipingItem) return;

    const currentX = event.touches[0].screenX;
    let diffX = currentX - this.touchStartX;

    this.currentTranslateX.set(this.swipingItem, diffX);
  }

  onTouchEnd(event: TouchEvent) {
    if (!this.allowSwipe || !this.swipingItem) return;

    const diffX = this.currentTranslateX.get(this.swipingItem) || 0;

    if (Math.abs(diffX) > 100) {
      this.animateAndRemove(this.swipingItem);
    } else {
      this.currentTranslateX.set(this.swipingItem, 0);
    }

    this.swipingItem = null;
  }

  animateAndRemove(item: any) {
    this.fadingItems.add(item);

    setTimeout(() => {
      this.movimientos = this.movimientos.filter((i) => i.operacion !== item.operacion);

      this.fadingItems.delete(item);
      this.currentTranslateX.delete(item);
      this.generalService.removeMovimientoByOperacion(item.operacion);
    }, 300);
  }
}
