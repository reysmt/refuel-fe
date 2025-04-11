import './assets/custom.css'
import './assets/bottomNavigationMenu.css'
import './assets/popup.css'
import './assets/chart.css'
import './assets/googleLogo.css'
import './assets/loading.css'
import './assets/map.css'
import './assets/primeVueCustom.css'
import './assets/streetView.css'
// import 'primevue/resources/themes/aura-light-green/theme.css'
// import 'primevue/resources/themes/aura-light-indigo/theme.css'
// import 'primevue/resources/themes/aura-light-purple/theme.css'
// import 'primevue/resources/themes/aura-light-teal/theme.css';
// import 'primevue/resources/themes/lara-light-blue/theme.css'
import 'primeicons/primeicons.css'

/* Core CSS required for Ionic components to work properly */
// import '@ionic/vue/css/core.css';

/* Basic CSS for apps built with Ionic */
// import '@ionic/vue/css/normalize.css';
// import '@ionic/vue/css/structure.css';
// import '@ionic/vue/css/typography.css';

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { IonicVue } from '@ionic/vue'
import App from './App.vue'
import router from './router'
import PrimeVue from 'primevue/config';
import ToastService from 'primevue/toastservice';
import Lara from '@primeuix/themes/lara';
import { semantic } from '@primeuix/themes/lara/base'
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

const app = createApp(App)
app.use(IonicVue)
app.use(PrimeVue, {
    theme: {
        preset: MyPreset,
        options: {
            darkModeSelector: false || 'none',
        }
    }
});
app.use(ToastService)
app.use(createPinia())
app.use(router)

app.mount('#app')
