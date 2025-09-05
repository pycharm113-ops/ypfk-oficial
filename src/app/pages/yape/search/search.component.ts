import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Component, OnInit, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';

import { TelfPipe } from '../../../shared/pipes/telf.pipe';
import { GeneralService } from '../../../services/general.service';
import { ConstantesGenerales } from '../../../shared/utils/constants';
import { Functions as FX } from '../../../shared/utils/functions';

@Component({
  selector: 'app-search',
  imports: [CommonModule, ReactiveFormsModule, RouterModule, TelfPipe, DialogModule],
  templateUrl: './search.component.html',
})
export class SearchComponent implements OnInit {
  private router = inject(Router);
  private generalService = inject(GeneralService);

  criterio = new FormControl(null);
  activeTab: boolean = true;

  arrayContactos = this.generalService.titulares.getValue();
  arrayContactosCopy = [...this.arrayContactos];
  newContacts = ConstantesGenerales.ARRAY_CONTACTOS;

  newNumber: boolean = false;
  numeroDetectado: string = '';
  autocomplete = this.generalService.decodedToken.autocomplete;
  isAutocompleteActive = this.generalService.isAutocompleteActive;

  ngOnInit(): void {
    if (this.generalService.settings) {
      const { showTitularsReal, showTitularsFake } = this.generalService.settings;

      if (!showTitularsReal) {
        this.arrayContactos = [];
        this.arrayContactosCopy = [];
      }

      if (showTitularsFake) {
        this.arrayContactos = [...this.arrayContactos, ...this.newContacts];
        this.arrayContactosCopy = [...this.arrayContactos];
      }
    }

    this.arrayContactos.sort((a, b) => a.titular.localeCompare(b.titular));
    this.arrayContactosCopy.sort((a, b) => a.titular.localeCompare(b.titular));

    this.criterio.valueChanges.subscribe((value: string | null) => {
      let criterio = value?.toLowerCase().trim() || '';

      const numeroDetectado = FX.trimCellPhoneNumber(criterio);

      this.newNumber = numeroDetectado.length === 9;
      this.numeroDetectado = numeroDetectado;

      if (criterio) {
        if (criterio.length > 9 && this.newNumber) {
          criterio = this.numeroDetectado;
        }

        this.arrayContactos = this.arrayContactosCopy.filter(
          (item) => item.celular.includes(criterio) || item.titular.toLowerCase().includes(criterio)
        );
      } else {
        this.arrayContactos = [...this.arrayContactosCopy];
      }
    });
  }

  setActiveTab(status: boolean): void {
    this.activeTab = status;
  }

  setNumber(number: string) {
    const isActive = this.isAutocompleteActive && this.autocomplete;
    if (isActive && this.newNumber) {
      this.onSearchNumber(number);
    } else {
      this.router.navigateByUrl(`/payment?number=${number}`);
    }
  }

  loading = false;
  onSearchNumber(number: string) {
    const titularLocal = this.onSearch(number);

    if (titularLocal !== number) {
      this.loading = false;
      this.router.navigateByUrl(`/payment?number=${number}&titular=${encodeURIComponent(titularLocal)}`);
      return;
    }

    this.loading = true;
    this.generalService.getOsiptelData(number).subscribe({
      next: (resp) => {
        this.loading = false;
        const titular = resp?.titular ?? 'Unknown';
        this.router.navigateByUrl(`/payment?number=${number}&titular=${encodeURIComponent(titular)}`);
      },
      error: (err) => {
        this.loading = false;
        console.error('Error al consultar OSIPTEL', err);
        this.router.navigateByUrl(`/payment?number=${number}&titular=Unknown`);
      },
    });
  }

  titulares = this.generalService.titulares.getValue();
  onSearch(number: string): string {
    const x = this.titulares.find((x) => x.celular === number);
    return x ? x.titular : number;
  }
}
