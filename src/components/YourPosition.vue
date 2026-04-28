<template>
  <i ref="popupElement" class="pi pi-map-marker" style="color: white;"></i>
</template>

<script setup lang="ts">
import { onMounted, ref, shallowRef, watch, type Ref } from 'vue'
import Overlay from 'ol/Overlay.js'
import type Map from 'ol/Map'

interface Props {
  mapObj: Map
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

<style scoped>
.ol-popup {
  position: absolute;
  background-color: white;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
  padding: 15px;
  border-radius: 10px;
  border: 1px solid #cccccc;
  bottom: 12px;
  left: -50px;
  min-width: 280px;
}

.ol-popup:after,
.ol-popup:before {
  top: 100%;
  border: solid transparent;
  content: " ";
  height: 0;
  width: 0;
  position: absolute;
  pointer-events: none;
}

.ol-popup:after {
  border-top-color: white;
  border-width: 10px;
  left: 48px;
  margin-left: -10px;
}

.ol-popup:before {
  border-top-color: #cccccc;
  border-width: 11px;
  left: 48px;
  margin-left: -11px;
}

.ol-popup-closer {
  text-decoration: none;
  position: absolute;
  top: 2px;
  right: 8px;
}

.ol-popup-closer:after {
  content: "✖";
}

.position {
  font-size: 20px;
}
</style>
