import './assets/custom.css'
import './assets/bottomNavigationMenu.css'
// import 'primevue/resources/themes/aura-light-green/theme.css'
// import 'primevue/resources/themes/aura-light-indigo/theme.css'
// import 'primevue/resources/themes/aura-light-purple/theme.css'
// import 'primevue/resources/themes/aura-light-teal/theme.css';
import 'primevue/resources/themes/lara-light-blue/theme.css'
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

const app = createApp(App)
app.use(IonicVue)
app.use(PrimeVue)
app.use(createPinia())
app.use(router)

app.mount('#app')
