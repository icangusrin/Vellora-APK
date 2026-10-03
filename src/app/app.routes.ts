import { Routes } from '@angular/router';
import { welcomeGuard } from './core/guards/welcome-guard';
import { AuthGuard } from './core/guards/auth.guard';

export const routes: Routes = [


  {
    path: '',
    redirectTo: 'welcome',
    pathMatch: 'full',
  },

  {
    path: 'welcome',
    canActivate: [welcomeGuard],
    loadComponent: () =>
      import('./features/auth/welcome/welcome.page').then(
        (m) => m.WelcomePage
      ),
  },

  {
    path: 'tabs',
    loadChildren: () =>
      import('./layouts/tabs/tabs.routes').then(
        (m) => m.routes
      ),
  },

  {
    path: 'auth/login',
    loadComponent: () =>
      import('./features/auth/login/login.page').then(
        (m) => m.LoginPage
      ),
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.page').then(
        (m) => m.LoginPage
      ),
  },
  {
    path: 'auth/register',
    loadComponent: () =>
      import('./features/auth/register/register.page').then(
        (m) => m.RegisterPage
      ),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./features/auth/register/register.page').then(
        (m) => m.RegisterPage
      ),
  },
  {
    path: 'auth/email-otp',
    loadComponent: () =>
      import('./features/auth/email-otp/email-otp.page').then(
        (m) => m.EmailOtpPage
      ),
  },
  {
    path: 'auth/reset-password',
    loadComponent: () =>
      import('./features/auth/reset-password/reset-password.page').then(
        (m) => m.ResetPasswordPage
      ),
  },
  {
    path: 'auth/lupa-password',
    loadComponent: () =>
      import('./features/auth/forgot-password/lupa-password.page').then(
        (m) => m.LupaPasswordPage
      ),
  },

  {
    path: 'product-detail',
    loadComponent: () =>
      import('./features/product/product-detail/product-detail.page').then(
        (m) => m.ProductDetailPage
      ),
  },

  {
    path: 'cart',
    loadComponent: () =>
      import('./features/cart/cart.page').then(
        (m) => m.CartPage
      ),
  },
  {
    path: 'voucher',
    loadComponent: () =>
      import('./features/cart/voucher/voucher.page').then(
        (m) => m.VoucherPage
      ),
  },


  {
    path: 'checkout',
    canActivate: [AuthGuard],          
    loadChildren: () =>
      import('./features/checkout/checkout/checkout.routes').then(
        (m) => m.routes
      ),
  },
  {
    path: 'payment-method',
    canActivate: [AuthGuard],        
    loadComponent: () =>
      import('./features/checkout/payment-method/payment-method.page').then(
        (m) => m.PaymentMethodPage
      ),
  },
  {
    path: 'payment-detail',
    canActivate: [AuthGuard],
    loadComponent: () =>
      import('./features/checkout/payment-detail/payment-detail.page').then(
        (m) => m.PaymentDetailPage
      ),
  },
  {
    path: 'payment-qris',
    canActivate: [AuthGuard],
    loadComponent: () =>
      import('./features/checkout/payment-qris/payment-qris.page').then(
        (m) => m.PaymentQrisPage
      ),
  },
  {
    path: 'pending-payment',
    canActivate: [AuthGuard],
    loadComponent: () =>
      import('./features/checkout/pending-payment/pending-payment.page').then(
        (m) => m.PendingPaymentPage
      ),
  },
  {
    path: 'success-order',
    canActivate: [AuthGuard],
    loadComponent: () =>
      import('./features/checkout/success-order/success-order.page').then(
        (m) => m.SuccessOrderPage
      ),
  },

  {
    path: 'orders',
    canActivate: [AuthGuard],        
    loadComponent: () =>
      import('./features/orders/pesanan/pesanan.page').then(
        (m) => m.PesananPage
      ),
  },
  {
    path: 'pesanan',
    canActivate: [AuthGuard],         
    loadComponent: () =>
      import('./features/orders/pesanan/pesanan.page').then(
        (m) => m.PesananPage
      ),
  },
  {
    path: 'rincian-pesanan/:id',
    canActivate: [AuthGuard],
    loadComponent: () =>
      import('./features/orders/rincian-pesanan/rincian-pesanan.page').then(
        (m) => m.RincianPesananPage
      ),
  },
  {
    path: 'lacak-pesanan/:id',
    canActivate: [AuthGuard],
    loadComponent: () =>
      import('./features/orders/lacak-pesanan/lacak-pesanan.page').then(
        (m) => m.LacakPesananPage
      ),
  },

  {
    path: 'chat',
    loadChildren: () =>
      import('./features/chat/chat/chat.routes').then(
        (m) => m.routes
      ),
  },
  {
    path: 'chat-detail/:id',
    loadComponent: () =>
      import('./features/chat/chat-detail/chat-detail.page').then(
        (m) => m.ChatDetailPage
      ),
  },
  {
    path: 'chat-detail',
    loadComponent: () =>
      import('./features/chat/chat-detail/chat-detail.page').then(
        (m) => m.ChatDetailPage
      ),
  },


  {
    path: 'edit-profile',
    canActivate: [AuthGuard],
    loadComponent: () =>
      import('./features/profile/edit-profile/edit-profile.page').then(
        (m) => m.EditProfilePage
      ),
  },
  {
    path: 'account-settings',
    canActivate: [AuthGuard],
    loadComponent: () =>
      import('./features/profile/account-settings/account-settings.page').then(
        (m) => m.AccountSettingsPage
      ),
  },
  {
    path: 'security-account',
    loadComponent: () =>
      import('./features/profile/security-account/security-account.page').then(
        (m) => m.SecurityAccountPage
      ),
  },
  {
    path: 'privacy-settings',
    loadComponent: () =>
      import('./features/profile/privacy-settings/privacy-settings.page').then(
        (m) => m.PrivacySettingsPage
      ),
  },
  {
    path: 'my-address',
    canActivate: [AuthGuard],
    loadComponent: () =>
      import('./features/profile/my-address/my-address.page').then(
        (m) => m.MyAddressPage
      ),
  },
  {
    path: 'address-picker',
    loadComponent: () =>
      import('./features/profile/address-picker/address-picker.page').then(
        (m) => m.AddressPickerPage
      ),
  },
  {
    path: 'change-phone',
    canActivate: [AuthGuard],
    loadComponent: () =>
      import('./features/profile/change-phone/change-phone.page').then(
        (m) => m.ChangePhonePage
      ),
  },
  {
    path: 'change-email',
    canActivate: [AuthGuard],
    loadComponent: () =>
      import('./features/profile/change-email/change-email.page').then(
        (m) => m.ChangeEmailPage
      ),
  },
  {
    path: 'change-password',
    canActivate: [AuthGuard],
    loadComponent: () =>
      import('./features/profile/change-password/change-password.page').then(
        (m) => m.ChangePasswordPage
      ),
  },
  {
    path: 'phone-verification',
    loadComponent: () =>
      import('./features/profile/phone-verification/phone-verification.page').then(
        (m) => m.PhoneVerificationPage
      ),
  },
  {
    path: 'phone-otp',
    loadComponent: () =>
      import('./features/profile/phone-otp/phone-otp.page').then(
        (m) => m.PhoneOtpPage
      ),
  },
  {
    path: 'email-otp',
    loadComponent: () =>
      import('./features/profile/email-otp/email-otp.page').then(
        (m) => m.EmailOtpPage
      ),
  },
  {
    path: 'verify-phone-email',
    loadComponent: () =>
      import('./features/profile/verify-phone-email/verify-phone-email.page').then(
        (m) => m.VerifyPhoneEmailPage
      ),
  },
  {
    path: 'verify-phone-otp',
    loadComponent: () =>
      import('./features/profile/verify-phone-otp/verify-phone-otp.page').then(
        (m) => m.VerifyPhoneOtpPage
      ),
  },
  {
    path: 'shop-profile',
    loadComponent: () =>
      import('./features/profile/shop-profile/shop-profile.page').then(
        (m) => m.ShopProfilePage
      ),
  },
  {
    path: 'laporkan',
    loadComponent: () =>
      import('./features/profile/laporkan/laporkan.page').then(
        (m) => m.LaporkanPage
      ),
  },


  {
    path: 'join-seller',
    canActivate: [AuthGuard],
    loadComponent: () =>
      import('./features/seller/join-seller/join-seller.page').then(
        (m) => m.JoinSellerPage
      ),
  },
  {
    path: 'seller-register',
    canActivate: [AuthGuard],
    loadComponent: () =>
      import('./features/seller/seller-register/seller-register.page').then(
        (m) => m.SellerRegisterPage
      ),
  },
  {
    path: 'seller-store',
    canActivate: [AuthGuard],
    loadComponent: () =>
      import('./features/seller/seller-store/seller-store.page').then(
        (m) => m.SellerStorePage
      ),
  },
  {
    path: 'seller-success',
    loadComponent: () =>
      import('./features/seller/seller-success/seller-success.page').then(
        (m) => m.SellerSuccessPage
      ),
  },


  {
    path: 'search',
    loadComponent: () =>
      import('./search/search.page').then(
        (m) => m.SearchPage
      ),
  },
  {
    path: 'notifikasi',
    loadComponent: () =>
      import('./features/notifikasi/notifikasi.page').then(
        (m) => m.NotifikasiPage
      ),
  },
  {
    path: 'ulasan',
    loadComponent: () =>
      import('./ulasan/ulasan.page').then(
        (m) => m.UlasanPage
      ),
  },


  {
    path: '**',
    redirectTo: 'tabs/home'
  }

];