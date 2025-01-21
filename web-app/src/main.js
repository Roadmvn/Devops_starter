import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import VueApexCharts from 'vue3-apexcharts'
import './index.css'

// Font Awesome
import '@fortawesome/fontawesome-free/css/all.css'

// Vue Toastification
import Toast from 'vue-toastification'
import 'vue-toastification/dist/index.css'

// Options pour les toasts
const toastOptions = {
  position: 'top-right',
  timeout: 3000,
  closeOnClick: true,
  pauseOnFocusLoss: true,
  pauseOnHover: true,
  draggable: true,
  draggablePercent: 0.6,
  showCloseButtonOnHover: false,
  hideProgressBar: false,
  closeButton: 'button',
  icon: true,
  rtl: false
}

// Nettoyer le localStorage au démarrage
localStorage.clear()

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(VueApexCharts)
app.use(Toast, toastOptions)

app.mount('#app')
