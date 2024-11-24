<template>
    <!-- <button type="button"  class="custom-btn btn btn-secondary btn-lg rounded shadow" data-bs-toggle="button" aria-pressed="true">
         <i class="bi bi-fuel-pump"></i> {{ type }}
    </button> -->
    <!-- <input type="radio" @click="setFilter" class="btn-check" name="rigType" :id="type" autocomplete="off"> -->
    <input type="radio" v-model="value" class="btn-check" name="rigType" :id="type" :value="type">
    <label class="custom-btn btn btn-primary btn-lg rounded shadow" :for="type">{{ type }}</label>
    {{ console.log(value) }}
    <!-- <ButtonPv @click="setFilter" raised v-model="value">
    {{ type }}
    </ButtonPv> -->
    <!-- <RadioButton v-model="ingredient" :inputId="type+'Type'" name="rigType" :value="type" :id="type" />
        <label :for="type" class="ml-2">{{type}}</label>
        {{ console.log(ingredient) }} -->
</template>

<script setup>
import ButtonPv from 'primevue/button';
import RadioButton from 'primevue/radiobutton';
</script>
<script>
// import { getFilteredRigs } from "../services/rigsService";
import { useRigsTypeStore, useRigsToShowStore, useRigsStore} from '@/stores/rigs';
import { useMapStore } from '@/stores/googleMap';
const rigsTypeStore = useRigsTypeStore();
const rigsToShowStore = useRigsToShowStore();
const rigsStore = useRigsStore();
const mapStore = useMapStore();
export default {
    data(){
        return{
            isActive: false,
            value: null
        }
    },
    emits: ['filterRigs'],
    mounted() {
        // console.log(this.rigsToShow)
    },
    methods: {
        async setFilter(){
            this.isActive = !this.isActive
            // let filteredRigs = await getFilteredRigs(this.rigsToShow, this.type)
            console.log(this.type, " ", this.isActive)
            // mapStore.getMap().getOverlays().clear();
            if(this.isActive){
                rigsTypeStore.setType(this.type);
                rigsToShowStore.setRigs(rigsStore.getRigs().filter((rig) => rig.rigPrices.some((rigPrices) => rigPrices.fuelDescription == rigsTypeStore.getType())))
                console.log(rigsToShowStore.getRigs())
            }else{
                rigsTypeStore.setType(null);
                rigsToShowStore.setRigs(rigsStore.getRigs())
                console.log(rigsToShowStore.getRigs())
            }
        }
    },
    props: ['type']
}
</script>