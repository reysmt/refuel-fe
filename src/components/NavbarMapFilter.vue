<template>
      
<Dialog v-model:visible="isFilterVisible" header="Filtra" style="width: 25rem;" position="right" :modal="false" :draggable="false">
    <div v-if="allRigsTypeStore.getAllRigsType().length > 0">
        <Listbox v-model="rigType" :options="allRigsTypeStore.getAllRigsType()" listStyle="max-height:350px"/>
    </div>
    
</Dialog>
</template>

<script setup>
import Dialog from 'primevue/dialog';
import Listbox from 'primevue/listbox';
import { useToast } from "primevue/usetoast";
</script>

<script>
import { useAllRigsTypeStore, useRigsTypeStore } from '@/stores/rigs';
import { useMapStore } from '@/stores/googleMap';
export default {
    data(){
        return {
            isFilterVisible : this.isVisible,
            checked: false,
            allRigsTypeStore : useAllRigsTypeStore(),
            rigTypeStore : useRigsTypeStore(),
            mapStore : useMapStore(),
            rigType: null,
            toast : null
        }
    },
    props: ["isVisible"],
    mounted(){
        // console.log(this.allRigsTypeStore.getAllRigsType())
        this.toast = useToast();
    },
    setup(){
        
    },
    watch: {
        isVisible(newVal){
            this.isFilterVisible = newVal;
            // console.log(newVal)
        },
        isFilterVisible(newVal){
            this.$emit('updatedVisibility', newVal);
            this.isFilterVisible = newVal;
            // console.log(this.isFilterVisible)
        },
        rigType(newVal){
            this.rigTypeStore.setType(newVal);
            this.$emit('updatedVisibility', false);
            this.isFilterVisible = false;
            if(this.rigTypeStore.getType() == null){
                this.toast.add({ severity: 'info', summary: 'Info', detail: 'Filtro rimosso', life: 1000 });
            }else{
            this.toast.add({ severity: 'info', summary: 'Info', detail: 'Filtro '+ this.rigTypeStore.getType() +' impostato', life: 1000 });
            }
        }
    },
    emits: ["updatedVisibility"]
}
</script>