import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './index.css'

// Nettoyer le localStorage au démarrage
localStorage.clear()

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
