import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useNotificationStore = defineStore('notifications', () => {
  const notifications = ref([])

  const addNotification = ({ type, message, timeout = 5000 }) => {
    const id = Date.now()
    notifications.value.push({
      id,
      type,
      message,
      timestamp: new Date()
    })

    if (timeout) {
      setTimeout(() => {
        removeNotification(id)
      }, timeout)
    }
  }

  const removeNotification = (id) => {
    const index = notifications.value.findIndex(n => n.id === id)
    if (index > -1) {
      notifications.value.splice(index, 1)
    }
  }

  const success = (message) => {
    addNotification({ type: 'success', message })
  }

  const error = (message) => {
    addNotification({ type: 'error', message })
  }

  const info = (message) => {
    addNotification({ type: 'info', message })
  }

  const warning = (message) => {
    addNotification({ type: 'warning', message })
  }

  return {
    notifications,
    addNotification,
    removeNotification,
    success,
    error,
    info,
    warning
  }
})
