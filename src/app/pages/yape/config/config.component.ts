import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { debounceTime, Subscription } from 'rxjs';
import { GuidedTourService } from 'ngx-guided-tour';
import { DialogService } from 'primeng/dynamicdialog';
import { BrowserQRCodeReader } from '@zxing/browser';
import { Router } from '@angular/router';
import Tesseract from 'tesseract.js';

import { SwalService } from '../../../services/swal.service';
import { GeneralService } from '../../../services/general.service';
import { CooldownService } from '../../../services/cooldown.service';
import { TourService } from '../../../services/tour.service';
import { PrimeNGModule } from '../../../shared/prime-ng/prime-ng.module';

import { CopyPasteDirective } from '../../../shared/directives/copy-paste.directive';
import { IBanner, IPersona } from '../../../shared/interfaces/interfaces';
import { DoxingComponent } from '../../../shared/components/doxing/doxing.component';
import { QuestionComponent } from '../../../shared/components/question/question.component';
import { PaquetesComponent } from '../../../shared/components/paquetes/paquetes.component';
import { MigrateEmailComponent } from '../../../shared/components/migrate-email/migrate-email.component';
import { TutorialComponent } from '../../../shared/components/tutorial/tutorial.component';
import { ConfettiComponent } from '../../../shared/components/confetti/confetti.component';
import { ConstantesGenerales } from '../../../shared/utils/constants';
import { Functions } from '../../../shared/utils/functions';

@Component({
  selector: 'app-config',
  imports: [CommonModule, PrimeNGModule, CopyPasteDirective, DoxingComponent, QuestionComponent, PaquetesComponent, ConfettiComponent],
  templateUrl: './config.component.html',
})
export class ConfigComponent implements OnInit, OnDestroy {
  @ViewChild(ConfettiComponent) confettiComp!: ConfettiComponent;
  private guidedTourService = inject(GuidedTourService);
  private cooldownService = inject(CooldownService);
  private generalService = inject(GeneralService);
  private dialogService = inject(DialogService);
  private swalService = inject(SwalService);
  private tourService = inject(TourService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  public titulares: IPersona[] = [];
  public linkSoporte = this.generalService.linkSoporte;
  public productos = ConstantesGenerales.PRODUCTS;

  public arrayBanners: IBanner[] = [];
  public arrayConfettis = ConstantesGenerales.CONFETTIS;
  public email = this.generalService.email;
  public token = this.generalService.decodedToken;
  public userfreeAdmin = this.generalService.userfreeAdmin;
  public userfreeClient = this.generalService.userfreeClient;
  public autocomplete = this.token.autocomplete;
  public autoExpired = this.token.autoExpired;
  public isAutocompleteActive = this.generalService.isAutocompleteActive;

  public viewAccount = false;
  public viewContacts = false;
  public viewSettings = false;

  Form = this.fb.group({
    titular: new FormControl(''),
    saldo: new FormControl(0),
  });

  FormTitulares = this.fb.group({
    titular: new FormControl(null, [Validators.required]),
    celular: new FormControl(null, [Validators.required, Validators.minLength(9), Validators.maxLength(9)]),
    destino: new FormControl('Yape'),
  });

  FormSettings = new FormGroup({
    banner: new FormControl('random'),
    confetti: new FormControl(1),
    autoPayment: new FormControl(false),
    showTitularsReal: new FormControl(false),
    showTitularsFake: new FormControl(false),
    showSearch: new FormControl(true),
    showBanner: new FormControl(true),
    showConfetti: new FormControl(false),
    allowMore500: new FormControl(false),
    allowChangeDate: new FormControl(false),
    allowSwipe: new FormControl(false),
  });

  formattedTime: string = '';
  private subCooldown!: Subscription;
  private subscription1 = new Subscription();
  private subscription2 = new Subscription();

  ngOnInit(): void {
    if (this.generalService.profile.getValue()) {
      this.Form.patchValue(this.generalService.profile.getValue());
    }

    let settings = this.generalService.settings;
    if (settings.showSearch === undefined) {
      settings.showSearch = false;
    }

    this.FormSettings.patchValue(settings);

    this.generalService.banners.subscribe((array) => {
      this.arrayBanners = [{ title: 'Aleatorio', id: 'random', img: null }, ...array];
      this.onChangeBanner();
    });

    if (this.token) {
      this.pin.setValue(this.token.pin);
    }

    this.Form.valueChanges.pipe(debounceTime(500)).subscribe((x) => {
      const value = { titular: x.titular, saldo: Number(x.saldo) || 0 };
      localStorage.setItem('datos', JSON.stringify(value));
      this.generalService.profile.next(value);
    });

    this.generalService.titulares.subscribe((resp) => {
      this.titulares = [...resp];
    });

    this.FormSettings.valueChanges.subscribe((value: any) => {
      localStorage.setItem('settings', JSON.stringify(value));
      this.generalService.settings = value;
    });

    this.subCooldown = this.cooldownService.expiresAt$.subscribe((ms) => {
      if (ms !== null) {
        const seconds = Math.max(0, Math.floor(ms / 1000));
        this.formattedTime = this.cooldownService.formatTimeCooldown(seconds);
      }
    });

    this.subscription1 = this.generalService.onRefreshToken.subscribe((value) => {
      if (value) {
        this.token = this.generalService.decodedToken;
      }
    });

    this.FormSettings.get('confetti')?.valueChanges.subscribe((value) => {
      this.confettiComp.numConfetti = value;
      this.confettiComp.onDispatch();
    });
  }

  ngOnDestroy() {
    this.subCooldown?.unsubscribe();
    this.subscription1.unsubscribe();
    this.subscription2.unsubscribe();
  }

  onCloseDialog() {
    this.FormTitulares.reset();
  }

  agregarTitular() {
    if (this.FormTitulares.invalid) {
      this.FormTitulares.markAllAsTouched();
      return;
    }

    const titular = this.FormTitulares.getRawValue();
    const currentArray = this.generalService.titulares.value;

    const index = currentArray.findIndex((x) => x.celular === titular.celular);

    let newArray: IPersona[];

    if (index !== -1) {
      newArray = [...currentArray];
      newArray[index] = titular;
    } else {
      newArray = [...currentArray, titular];
    }

    this.updateArray(newArray);
    this.FormTitulares.reset();
    this.FormTitulares.get('destino')?.setValue('Yape');
  }

  onEliminar(i: number) {
    this.titulares.splice(i, 1);
    this.updateArray(this.titulares);
  }

  updateArray(newArray: IPersona[]) {
    localStorage.setItem('titulares', JSON.stringify(newArray));
    this.generalService.titulares.next(newArray);
  }

  modalDoxing = false;
  onServiciosDoxing() {
    this.modalDoxing = true;
  }

  modalQuestion = false;
  onServiciosQuestion() {
    this.modalQuestion = true;
  }

  onRealizarRecargas() {
    this.router.navigateByUrl(`/payment?recharge=true`);
  }

  onVaciarMovimientos() {
    this.swalService.onPreguntar(`¿Desea eliminar todos los movimientos?`).then((response) => {
      if (response) {
        this.generalService.movimientos.next([]);
        localStorage.setItem('movimientos', '[]');
      }
    });
  }

  onVincularEmail() {
    const ref = this.dialogService.open(MigrateEmailComponent, {
      header: 'Vincular Correo',
      width: '300px',
      modal: true,
      dismissableMask: false,
      closable: true,
    });

    ref.onClose.subscribe((value) => {
      if (value) {
        this.cooldownService.onLogoutWithEmail(value);
      }
    });
  }

  onCerrarSesion() {
    this.swalService.onPreguntar(`¿Desea cerrar sesión?`).then((response) => {
      if (response) {
        if (this.generalService.superadmin || this.generalService.resellers || !this.token.payment) {
          this.cooldownService.onLogout();
          return;
        }

        const obs = this.token.client ? this.generalService.logoutClient() : this.generalService.logoutUser();

        obs.subscribe({
          next: (resp) => {
            if (resp.status) {
              this.cooldownService.onLogout();
            }
          },
          error: (err) => {
            const msg = err.error?.msg ?? '!Ocurrio un error con la conexión!';
            this.swalService.onNotificar(msg);
          },
        });
      }
    });
  }

  onGuardarPin() {
    this.swalService.onPreguntar(`¿Deseas cambiar tu PIN por ${this.pinValue}?`).then((response) => {
      if (response) {
        this.generalService.onActualizarPIN(this.pinValue).subscribe({
          next: (resp) => {
            if (resp.status) {
              this.pin.disable();
              localStorage.setItem('token', resp.token);
              this.swalService.onNotificar('PIN actualizado correctamente.');
              this.token = this.generalService.decodedToken;
            } else {
              this.swalService.onNotificar(resp.msg);
            }
          },
          error: (err) => {
            this.swalService.onNotificar(err.error);
          },
        });
      }
    });
  }

  onAccederBCP() {
    this.router.navigateByUrl('/bcp');
  }

  onAccederIBK() {
    this.router.navigateByUrl('/ibk');
  }

  onStartTour() {
    const clonedSteps = this.tourService.stepItems.steps.map((step) => ({ ...step }));
    clonedSteps[0].skipStep = true;
    this.guidedTourService.startTour({
      ...this.tourService.stepItems,
      steps: clonedSteps,
    });
  }

  viewYapePlanes = false;
  onYapePlanes() {
    this.viewYapePlanes = true;
  }

  onChangeAllowChangeDate() {
    const allowChangeDate = this.FormSettings.get('allowChangeDate');

    if (!allowChangeDate.value) {
      return;
    }

    this.swalService.onPreguntar(`¿Seguro de activar esta opción?. Saldrá una ventana de ingresar fecha antes de Yapear.`).then((response) => {
      if (!response) {
        allowChangeDate.setValue(false);
      }
    });
  }

  onVerTutorial(): void {
    this.dialogService.open(TutorialComponent, {
      modal: true,
      dismissableMask: true,
      focusOnShow: false,
      showHeader: false,
      styleClass: 'content-plyr',
      width: '17.5rem',
      data: 'autocompleted',
    });
  }

  pin = new FormControl({ value: '', disabled: true }, Validators.required);

  get pinValue() {
    return String(this.pin.value);
  }

  get isValid(): boolean {
    const pin = String(this.pin.value);
    return (pin.length || 0) === 6;
  }

  get autoPayment(): boolean {
    return this.FormSettings.get('autoPayment')?.value ?? false;
  }

  imageUrl: string = '';
  onChangeBanner() {
    const selected = this.FormSettings.get('banner')?.value;
    const isRandom = selected === 'random' || selected === '';
    if (isRandom) {
      const banners = this.arrayBanners.filter((b) => !!b.img);
      const random = banners[Math.floor(Math.random() * banners.length)];
      this.imageUrl = random?.img ?? '';
    } else {
      const banner = this.arrayBanners.find((b) => b.id === selected);
      this.imageUrl = banner?.img ?? '';
    }
  }

  // CONTACTOS
  reader = new BrowserQRCodeReader();
  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    const img = new Image();
    const reader = new FileReader();
    reader.onload = () => {
      img.src = reader.result as string;
      img.onload = async () => {
        this.tryOcrFallback(img);
      };
    };

    reader.readAsDataURL(file);
  }

  async tryOcrFallback(img: HTMLImageElement) {
    try {
      if (img) {
        const result = await Tesseract.recognize(img.src, 'spa+eng');
        const text = result.data.text;
        this.procesarTexto(text);
      }
    } catch (err) {
      this.swalService.onNotificar('Ocurrió un error al procesar la imagen.');
    }
  }

  procesarTexto(texto: string) {
    const resultado = Functions.extractText(texto);
    if (resultado.numero !== '000000000') {
      const ultimosTres = resultado.numero.slice(-3);
      const nuevoNumero = '9'.repeat(6) + ultimosTres;
      this.FormTitulares.patchValue({
        titular: resultado.nombre,
        celular: nuevoNumero,
      });
    } else {
      this.FormTitulares.patchValue({
        titular: resultado.nombre,
        celular: null,
      });
    }
  }

  onCopyPaste(texto: string) {
    navigator.clipboard.writeText(texto);
  }

  closeAllDialogs() {
    this.modalDoxing = false;
    this.modalQuestion = false;
    this.viewAccount = false;
    this.viewContacts = false;
    this.viewSettings = false;
    this.viewYapePlanes = false;
  }
}
