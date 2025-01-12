<template>
    <!-- <div id="popup" class="ol-popup" ref="popup">
        <a href="#" id="popup-closer" class="ol-popup-closer" ref="popup-closer"
            v-html="popupCloser"></a>
        <div id="popupContent" ref="popupContent">
            <p>You clicked here:</p><code>{{ popupContent }}</code>
        </div>
    </div> -->
    <div ref="popup"  id="popup" class="ol-popup" >
    <a href="#" id="popup-closer" class="ol-popup-closer" ref="popup-closer" @click="closePopup"></a>
    {{ console.log(popupContent) }}
    <Button label="Submit" />
    </div>

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
        // console.log(this.popupContent)
    },
    updated(){
        
    },
    props: ['mapObj', 'popupContent', 'longitude', 'latitude','rig','rigPrices','gmapKey'],
    methods: {
        closePopup() {
            let overlays = this.mapStore.getMap().getOverlays().array_.filter((overlay) => overlay.values_.isPopup === "true")
            for(let overlay of overlays){
                this.mapStore.getMap().removeOverlay(overlay);
                // console.log(this.mapStore.getMap().getOverlays().array_.filter((overlay) => overlay.values_.isPopup === "true"))
            }
        }
    }
}
</script>
<style scoped>

</style>