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
        <DataTable v-model:selection="selectedRig" :value="popupContent" selectionMode="single" :rows="4" scrollable
            lazy scrollHeight="400px" @row-select="onRigSelect">
            <Column field="rig.flag" header="Insegna" style="min-width: 1rem; font-size: .8rem;"></Column>
            <Column field="rig.municipality" header="Comune" sortable style="min-width: 1rem; font-size: .8rem;">
            </Column>
            <Column field="rigPrices" header="Prezzo" style="min-width: 1rem; font-size: .8rem; white-space: nowrap; padding-right: .5rem;">
                <template #body="slotProps">
                    {{ showPrice(slotProps) }} €/Lt
                </template>
            </Column>
            <Column field="" header="" style="padding: 0;">
                <template #body>
                    <i class="pi pi-info-circle"></i>
                </template>
            </Column>
            <!-- <Column field="" header="" style="min-width: 1rem">
                <template #body="{data}">
                        <Button type="button" label="Dettagli"></Button>
                        
                    </template>
            </Column> -->
        </DataTable>

    </div>

    <RigDetail v-if="selectedRig != null" :isVisible="detailsVisible" :rig="selectedRig.rig"
        :rigPrices="selectedRig.rigPrices" @updatedVisibility="updatedVisibility" :gmapKey="gmapKey" :token="token"></RigDetail>
</template>

<script setup>
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Tag from 'primevue/tag';
</script>

<script>
import RigDetail from '@/components/RigDetail.vue';
// import { toStringHDMS } from 'ol/coordinate.js';
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
            mapStore: useMapStore(),
            selectedRig: null
        }
    },
    mounted() {
        // console.log(this.rigPrices)
        // console.log(this.$refs.popup)
        // this.setupOverlay();
        // this.preparePopup();
        
    },
    updated() {

    },
    props: ['popupContent', 'gmapKey', 'token'],
    methods: {
        closePopup() {
            let overlays = this.mapStore.getMap().getOverlays().array_.filter((overlay) => overlay.values_.isPopup === "true")
            for (let overlay of overlays) {
                this.mapStore.getMap().removeOverlay(overlay);
                // console.log(this.mapStore.getMap().getOverlays().array_.filter((overlay) => overlay.values_.isPopup === "true"))
            }
        },
        onRigSelect() {
            this.detailsVisible = true;
        },
        updatedVisibility(newVal) {
            this.detailsVisible = newVal
        },
        showPrice(slotProps) {
            let price;
            // console.log(this.rigsTypeStore.getType())
            // console.log(slotProps.data.rigPrices)
            // console.log(this.popupContent)
            // console.log(this.filterPrice(slotProps.data.rigPrices, this.rigsTypeStore.getType()))

            if(this.rigsTypeStore.getType() != null){
                price = this.filterPrice(slotProps.data.rigPrices, this.rigsTypeStore.getType())
                if(Array.isArray(price) && price.length > 0){
                    price = price[0].price.toFixed(2)
                }
            }else{
                price = slotProps.data.rigPrices[0].price.toFixed(2) 
            }
            // console.log(price)
            return price;
            // return this.popupContent
        },
        filterPrice(rigPrices ,rigType){
            // console.log(rigPrices.filter(price => price.rigFuelType.rigFuelTypeDescription.toLowerCase() == rigType.toLowerCase()))
            return rigPrices.filter(price => price.rigFuelType.rigFuelTypeDescription.toLowerCase() == rigType.toLowerCase())
        }
    },
    watch: {
        popupContent: function (val) {
            if (val != null) {
                // console.log(val.length)
                if (val.length < 2) {
                    // console.log(val[0])
                    this.selectedRig = val[0];
                    this.onRigSelect();
                }
                // this.preparePopup();
            }
        }
    }
}
</script>
<style scoped></style>