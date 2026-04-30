<template>
  <div id="street-view" class="street-view" ref="streetView"></div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import { loadGoogleMaps } from '@/services/googleMapService';

const props = defineProps<{
  longitude: number;
  latitude: number;
  gmapKey: string;
}>();

const streetView = ref<HTMLDivElement | null>(null);

const initialize = () => {
  const googleMaps = (window as any).google;
  if (!streetView.value || !googleMaps) {
    return;
  }

  new googleMaps.maps.StreetViewPanorama(streetView.value, {
    position: { lat: props.latitude, lng: props.longitude },
    pov: { heading: 165, pitch: 0 },
    zoom: 1,
    fullscreenControl: false,
    addressControl: false,
  });
};

onMounted(async () => {
  await loadGoogleMaps(props.gmapKey);
  initialize();
});
</script>