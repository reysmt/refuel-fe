<template>
 <!-- Div che contiene la mappa Street View -->
 <div id="street-view" class="street-view" ref="streetView"></div>
</template>
<script setup>
import googleMapService from '@/services/googleMapService';
import { ref } from 'vue';
</script>
<script>
export default {
  name: 'StreetViewComponent',
  mounted() {
    this.key = this.gmapKey;
    // console.log(this.key)
    googleMapService.loadGoogleMaps(this.key).then(() => {
      this.initialize();
    });
  },
  data(){
    return {
      key : null
    }
  },
  props: ['longitude', 'latitude', 'gmapKey'],
  methods: {
    initialize() {
      const panorama = new google.maps.StreetViewPanorama(
        this.$refs.streetView,
        {
        //   position: { lat: 37.86926, lng: -122.254811 },
        position: {lat: this.latitude, lng: this.longitude},
          pov: { heading: 165, pitch: 0 },
          zoom: 1,
          fullscreenControl: false,
          addressControl: false
        }
      );
      return panorama;
    }
  }
};
</script>



