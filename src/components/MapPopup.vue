<template>
    <div ref="popup" id="popup" class="ol-popup">
        <a href="#" id="popup-closer" class="ol-popup-closer" ref="popup-closer" @click="closePopup"></a>
        {{ console.log(processedRigs) }}
        <DataTable v-model:selection="selectedRig" :value="processedRigs" selectionMode="single" :rows="4" scrollable
            scrollHeight="400px" @rowSelect="onRigSelect">
            <Column field="rig.flag" header="Insegna" sortable style="min-width: 1rem; font-size: .8rem;"></Column>
            <Column field="rig.municipality" header="Comune" sortable style="min-width: 1rem; font-size: .8rem;"></Column>
            <Column field="priceToShow" header="Prezzo" sortable style="min-width: 1rem; font-size: .8rem; white-space: nowrap; padding-right: .5rem;"></Column>
            <Column field="" header="" style="padding: 0;">
                <template #body>
                    <i class="pi pi-info-circle"></i>
                </template>
            </Column>
        </DataTable>

    </div>

    <RigDetail v-if="selectedRig != null" :isVisible="detailsVisible" :rig="selectedRig.rig"
        :rigPrices="selectedRig.rigPrices" @updatedVisibility="updatedVisibility" :gmapKey="gmapKey" :token="token"></RigDetail>
</template>

<script setup>


</script>

<script>
import RigDetail from '@/components/RigDetail.vue';
// import { toStringHDMS } from 'ol/coordinate.js';
import { useRigsTypeStore } from '@/stores/rigs';
import { useMapStore } from '@/stores/googleMap';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import "ol/ol.css";
export default {
    components:{
        RigDetail,
        DataTable,
        Column
    },
    computed: {
        processedRigs(){
            return this.popupContent!= null ? this.popupContent.map(rigs => ({
                ...rigs,
                rigPrices: rigs.rigPrices,
                priceToShow: this.showDesiredPrice(rigs)
            })) : []
        }
    },
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
            console.log(this.detailsVisible)
        },
        updatedVisibility(newVal) {
            this.detailsVisible = newVal
        },
        showDesiredPrice(slotProps) {
            let price;
            // console.log(this.rigsTypeStore.getType())
            // console.log(slotProps.data.rigPrices)
            // console.log(this.popupContent)
            // console.log(this.filterPrice(slotProps.data.rigPrices, this.rigsTypeStore.getType()))

            if(this.rigsTypeStore.getType() != null){
                price = this.filterPrice(slotProps.rigPrices, this.rigsTypeStore.getType())
                if(Array.isArray(price) && price.length > 0){
                    price = price[0].price.toFixed(2) + (this.rigsTypeStore.getType().toLowerCase() == "metano" ? " €/Kg" : " €/Lt")
                }
            }else{
                price = slotProps.rigPrices[0].price.toFixed(2) + " €/Lt"
            }
            // console.log(price)
            return price;
            // return this.popupContent
        },
        filterPrice(rigPrices ,rigType){
            // console.log(rigPrices.filter(price => price.rigFuelType.rigFuelTypeDescription.toLowerCase() == rigType.toLowerCase()))
            return rigPrices.filter(price => price.rigFuelType.rigFuelTypeDescription.toLowerCase() == rigType.toLowerCase())
        },
        sortPrices(event) {
            event.data.sort((a, b) => {
                const priceA = this.getPriceValue(a.rigPrices);
                const priceB = this.getPriceValue(b.rigPrices);
                console.log(priceA, priceB)
                return (priceA - priceB) * (event.order === 1 ? 1 : -1);
            });
        },
        getPriceValue(prices) {
            if (!prices || prices.length === 0) return Number.MAX_VALUE; // Se non ci sono prezzi, mettiamo in fondo
            return Math.min(...prices.map(p => p.price)); // Usa il prezzo minimo per ordinare
        },
    },
    watch: {
    }
}
</script>
<style scoped></style>