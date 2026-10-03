import { Routes } from '@angular/router';

export const routes: Routes = [

  {
    path: '',
    loadComponent: () =>
      import('../checkout/checkout.page').then(m => m.CheckoutPage)
  },

  {
    path: 'payment-method',
    loadComponent: () =>
      import('../payment-method/payment-method.page').then(m => m.PaymentMethodPage)
  },

  {
    path: 'payment-detail',
    loadComponent: () =>
      import('../payment-detail/payment-detail.page').then(m => m.PaymentDetailPage)
  },

  {
    path: 'payment-qris',
    loadComponent: () =>
      import('../payment-qris/payment-qris.page').then(m => m.PaymentQrisPage)
  },

  {
    path: 'pending-payment',
    loadComponent: () =>
      import('../pending-payment/pending-payment.page').then(m => m.PendingPaymentPage)
  },

  {
    path: 'success-order',
    loadComponent: () =>
      import('../success-order/success-order.page').then(m => m.SuccessOrderPage)
  },

  {
    path: 'lacak-pesanan',
    loadComponent: () =>
      import('../lacak-pesanan/lacak-pesanan.page').then(m => m.LacakPesananPage)
  },

];
