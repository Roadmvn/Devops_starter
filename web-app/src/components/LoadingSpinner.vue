<template>
  <div
    :class="[
      'inline-block animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em]',
      `h-${size} w-${size}`,
      className
    ]"
    :style="{ color: color }"
    role="status"
  >
    <span class="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
      Chargement...
    </span>
  </div>
</template>

<script setup>
defineProps({
  size: {
    type: [Number, String],
    default: 8,
    validator: (value) => {
      const sizes = [4, 6, 8, 10, 12, 16]
      return sizes.includes(Number(value))
    }
  },
  color: {
    type: String,
    default: 'currentColor'
  },
  className: {
    type: String,
    default: ''
  }
})
</script>

<style scoped>
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}
</style>
