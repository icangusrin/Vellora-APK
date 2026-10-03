// Ganti apiUrl dengan domain production kamu saat deploy ke PlayStore

export const environment = {
  production: true,
  apiUrl: 'https://api.layananapp.my.id/api',
  baseUrl: 'https://api.layananapp.my.id',

  pusherKey:     'f19f8e57a91a695ffb09',
  pusherCluster: 'ap1',

  firebaseConfig: {
    apiKey: 'AIzaSyCw1spdwAbwR8BV7DV-jBJn4EAUTAavUV0',
    authDomain: 'marketplace-498021.firebaseapp.com',
    projectId: 'marketplace-498021',
    storageBucket: 'marketplace-498021.firebasestorage.app',
    messagingSenderId: '803661480295',
    appId: '1:803661480295:android:7703353acf651f7be8afc2'
  }
};
