<template>
    <!-- <div id="popup" class="ol-popup" ref="popup">
        <a href="#" id="popup-closer" class="ol-popup-closer" ref="popup-closer"
            v-html="popupCloser"></a>
        <div id="popupContent" ref="popupContent">
            <p>You clicked here:</p><code>{{ popupContent }}</code>
        </div>
    </div> -->

    <a href="#" id="popup-closer" class="ol-popup-closer" ref="popup-closer" @click="closePopup"></a>
    <Button label="Submit" />

</template>

<script setup>
import Button from 'primevue/button';
</script>

<script>
// import { toStringHDMS } from 'ol/coordinate.js';
import Overlay from 'ol/Overlay.js';
import { useRigsTypeStore } from '@/stores/rigs';
import { useMapStore } from '@/stores/googleMap';
import "ol/ol.css";
export default {
    data() {
        return {
            popup: null,
            visible: false,
            // priceToShow: null,
            rigsTypeStore: useRigsTypeStore(),
            mapStore : useMapStore()
        }
    },
    mounted() {
        // console.log(this.rigPrices)
        // console.log(this.$refs.popup)
        // this.setupOverlay();
        // this.preparePopup();
    },
    updated(){
        
    },
    props: ['mapObj', 'popupContent', 'longitude', 'latitude','rig','rigPrices','gmapKey'],
    methods: {
        closePopup() {
            this.mapStore.getMap().getOverlays().clear();
        }
    }
}
</script>
<style scoped>

</style>