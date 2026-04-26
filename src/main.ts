import './assets/custom.css'
import './assets/bottomNavigationMenu.css'
import './assets/popup.css'
import './assets/chart.css'
import './assets/googleLogo.css'
import './assets/loading.css'
import './assets/map.css'
import './assets/primeVueCustom.css'
import './assets/streetView.css'
import 'primeicons/primeicons.css'

import { createApp, type App as VueApp } from 'vue'
import { createPinia } from 'pinia'
import { IonicVue } from '@ionic/vue'
import App from './App.vue'
import router from './router'
import PrimeVue, { type PrimeVueConfiguration } from 'primevue/config';
import ToastService from 'primevue/toastservice';
import Lara from '@primeuix/themes/lara';
import { definePreset } from '@primeuix/themes';

const MyPreset = definePreset(Lara, {
    semantic: {
        primary: {
            50: '{blue.50}',
            100: '{blue.100}',
            200: '{blue.200}',
            300: '{blue.300}',
            400: '{blue.400}',
            500: '{blue.500}',
            600: '{blue.600}',
            700: '{blue.700}',
            800: '{blue.800}',
            900: '{blue.900}',
            950: '{blue.950}'
        }
    }
});

const app: VueApp<Element> = createApp(App)
app.use(IonicVue)
app.use(PrimeVue, {
    theme: {
        preset: MyPreset,
        options: {
            darkModeSelector: false || 'none',
        }
    }
} as PrimeVueConfiguration);
app.use(ToastService)
app.use(createPinia())
app.use(router)

app.mount('#app')

