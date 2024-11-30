<template>
<Dialog v-model:visible="isFilterVisible" header="Filtra" :style="{ width: '25rem' }" position="right" :modal="true" :draggable="false">
    <div v-if="allRigsTypeStore.getAllRigsType().length > 0">
        <Listbox v-model="rigType" :options="allRigsTypeStore.getAllRigsType()"  class="" />
    </div>
    
</Dialog>
</template>

<script setup>
import Dialog from 'primevue/dialog';
import Listbox from 'primevue/listbox';
</script>

<script>
import { useAllRigsTypeStore } from '@/stores/rigs';
import { useRigsTypeStore } from '@/stores/rigs';
export default {
    data(){
        return {
            isFilterVisible : this.isVisible,
            checked: false,
            allRigsTypeStore : useAllRigsTypeStore(),
            rigTypeStore : useRigsTypeStore(),
            rigType: null
        }
    },
    props: ["isVisible"],
    mounted(){
        console.log(this.allRigsTypeStore.getAllRigsType())
    },
    watch: {
        isVisible(newVal){
            this.isFilterVisible = newVal;
        },
        rigType(newVal){
            this.rigTypeStore.setType(newVal);
        }
    }

}
</script>