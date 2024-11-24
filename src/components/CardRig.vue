<template>
    <div class="box p-4 w-full animation-duration-500" style data-pd-animateonscroll="true">
        <Card @click="openPosition('bottom')" class="custom-card">
            <template #title>
                <div class="custom-card-title">
                    {{ rig.flag }}
                </div>
            </template>
            <template #subtitle>
                <div class="custom-card-subtitle">{{ rig.municipality }}</div>
            </template>
            <!-- <template #content> -->
            <!-- <p class="m-0"> -->
            <!-- {{ manager }} -->
            <!-- </p> -->
            <!-- </template> -->
        </Card>
    </div>

    <RigDetail :isVisible="visible" :rig="rig" :rigPrices="rigPrices" :gmapKey="gmapKey" @updatedVisibility="updatedVisibility">
    </RigDetail>

</template>

<script setup>
import Card from 'primevue/card';
import RigDetail from './RigDetail.vue';
</script>
<script>
import { useMapStore } from '@/stores/googleMap';
import { ref } from 'vue';

export default {
    mounted() {
        // console.log(this.rigPrices)
        this.refPrices=this.rigPrices
    },
    data(){
        return{
            position:null,
            visible: false,
            mapStore : useMapStore(),
            refPrices : ref()
        }
    },
    props: ['rig','rigPrices','gmapKey'],
    methods : {
        openPosition(){
            this.mapStore.getMap().getView().animate({center:[this.rig.longitude, this.rig.latitude], duration:500});
            // this.position= pos;
            this.visible= true;
            console.log(this.visible)
        },
        updatedVisibility(newVal){
            this.visible = newVal
        }
    }
}
</script>