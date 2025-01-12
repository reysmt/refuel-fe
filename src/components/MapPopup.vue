<template>
    <!-- <div id="popup" class="ol-popup" ref="popup">
        <a href="#" id="popup-closer" class="ol-popup-closer" ref="popup-closer"
            v-html="popupCloser"></a>
        <div id="popupContent" ref="popupContent">
            <p>You clicked here:</p><code>{{ popupContent }}</code>
        </div>
    </div> -->
    <div ref="popup" id="popup" class="ol-popup">
        <a href="#" id="popup-closer" class="ol-popup-closer" ref="popup-closer" @click="closePopup"></a>
        <!-- {{ console.log(popupContent) }} -->
        <DataTable v-model:selection="selectedRig" :value="popupContent" selectionMode="single"
            :rows="4" scrollable scrollHeight="400px" @row-select="onRigSelect">
            <Column field="rig.flag" header="Insegna" sortable style="min-width: 1rem"></Column>
            <Column field="rig.municipality" header="Comune" sortable style="min-width: 1rem"></Column>
            <Column field="price" header="Price" sortable style="min-width: 1rem">
                <template #body="slotProps">
                    {{ slotProps.data.price }} €
                </template>
            </Column>
            <!-- <Column field="" header="" style="min-width: 1rem">
                <template #body="{data}">
                        <Button type="button" label="Dettagli"></Button>
                        
                    </template>
            </Column> -->
        </DataTable>
       
    </div>

    <RigDetail v-if="selectedRig != null" :isVisible="detailsVisible" :rig="selectedRig.rig" :rigPrices="selectedRig.rigPrices" @updatedVisibility="updatedVisibility" :gmapKey="gmapKey"></RigDetail>
</template>

<script setup>
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
</script>

<script>
import RigDetail from '@/components/RigDetail.vue';
// import { toStringHDMS } from 'ol/coordinate.js';
import Overlay from 'ol/Overlay.js';
import { useRigsTypeStore } from '@/stores/rigs';
import { useMapStore } from '@/stores/googleMap';
import "ol/ol.css";
export default {
    data() {
        return {
            popup: null,
            detailsVisible: false,
            // priceToShow: null,
            rigsTypeStore: useRigsTypeStore(),
            mapStore : useMapStore(),
            selectedRig: null
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
    props: ['popupContent','gmapKey'],
    methods: {
        closePopup() {
            let overlays = this.mapStore.getMap().getOverlays().array_.filter((overlay) => overlay.values_.isPopup === "true")
            for(let overlay of overlays){
                this.mapStore.getMap().removeOverlay(overlay);
                // console.log(this.mapStore.getMap().getOverlays().array_.filter((overlay) => overlay.values_.isPopup === "true"))
            }
        },
        onRigSelect(){
            console.log(this.selectedRig)
            this.detailsVisible = true;
        },
        updatedVisibility(newVal){
            this.detailsVisible = newVal
        }
    }
}
</script>
<style scoped>

</style>