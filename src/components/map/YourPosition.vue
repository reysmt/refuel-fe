<template>
  <i ref="popupElement" class="pi pi-map-marker" style="color: white;"></i>
</template>

<script setup lang="ts">
import { onMounted, ref, shallowRef, watch, type Ref } from 'vue'
import Overlay from 'ol/Overlay.js'
import type { OlMapLike } from '@/interfaces/OlMapLike'

interface Props {
  mapObj: OlMapLike
  popupContent?: string | null
  longitude: number
  latitude: number
}

const props = defineProps<Props>()
const popupElement = ref<HTMLElement | null>(null)
const overlay = shallowRef<Overlay | null>(null)

const getCoordinate = (): [number, number] => [props.longitude, props.latitude]

const createOverlay = (): void => {
  if (!props.mapObj || !popupElement.value) {
    return
  }

  overlay.value = new Overlay({
    element: popupElement.value,
    autoPan: {
      animation: {
        duration: 250,
      },
    },
  })

  overlay.value.set('myPosition', 'true')
  props.mapObj.addOverlay(overlay.value)
}

const updatePopupPosition = (): void => {
  const position = getCoordinate()
  if (overlay.value) {
    overlay.value.setPosition(position)
  }
}

onMounted(() => {
  createOverlay()
  updatePopupPosition()
})

watch(
  () => [props.longitude, props.latitude],
  () => {
    updatePopupPosition()
  },
)
</script>
