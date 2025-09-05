import { Routes } from '@angular/router';
import { BcpComponent } from './bcp.component';
import { HomeComponent } from './home/home.component';
import { ConfigComponent } from './config/config.component';
import { AccountComponent } from './account/account.component';
import { PaymentComponent } from './payment/payment.component';

export const pagesRoutes: Routes = [
  {
    path: '',
    component: BcpComponent,
    children: [
      { path: '', component: HomeComponent },
      { path: 'config', component: ConfigComponent },
      { path: 'account', component: AccountComponent },
      { path: 'payment', component: PaymentComponent },
      { path: '', redirectTo: '', pathMatch: 'full' },
      { path: '**', redirectTo: '' },
    ],
  },
];
