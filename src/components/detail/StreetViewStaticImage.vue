<template>
  <div class="street-view-image-static">
    <Image :src="url" alt="Image" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import Image from 'primevue/image'

const props = defineProps<{
  latitude: number
  longitude: number
  gKey: string
}>()

const url = ref<string>('')

const buildUrl = (apiKey: string, latitude: number, longitude: number): string => {
  return `https://maps.googleapis.com/maps/api/streetview?size=400x70&location=${latitude},${longitude}&fov=80&heading=70&pitch=0&key=${apiKey}`
}

const loadUrl = (): void => {
  url.value = buildUrl(props.gKey, props.latitude, props.longitude)
}

onMounted(loadUrl)

watch(
  () => [props.latitude, props.longitude, props.gKey],
  loadUrl
)
</script>