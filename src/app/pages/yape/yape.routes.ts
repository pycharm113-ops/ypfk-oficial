import { Routes } from '@angular/router';
import { YapeComponent } from './yape.component';
import { HomeComponent } from './home/home.component';
import { SearchComponent } from './search/search.component';
import { PaymentComponent } from './payment/payment.component';
import { VoucherComponent } from './voucher/voucher.component';
import { ConfigComponent } from './config/config.component';

export const pagesRoutes: Routes = [
  {
    path: '',
    component: YapeComponent,
    children: [
      { path: '', component: HomeComponent },
      { path: 'search', component: SearchComponent },
      { path: 'payment', component: PaymentComponent },
      { path: 'voucher', component: VoucherComponent },
      { path: 'config', component: ConfigComponent },
      { path: '', redirectTo: '', pathMatch: 'full' },
      { path: '**', redirectTo: '' },
    ],
  },
];
