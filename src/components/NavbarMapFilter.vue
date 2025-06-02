<template>
      
<Dialog v-model:visible="isFilterVisible" header="Filtra" style="width: 25rem;" position="right" :modal="false" :draggable="false">
    <div id="rigTypeFilter" v-if="allRigsTypeStore.getAllRigsType().length > 0">
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
import { Preferences } from '@capacitor/preferences';
import { driver } from "driver.js";
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
            toast : null,
            driverObj: null,
            isTourSeen: false,
            preference: null,
        }
    },
    props: ["isVisible"],
    async mounted(){
        // console.log(this.allRigsTypeStore.getAllRigsType())
        this.toast = useToast();
        this.driverObj = driver();
        this.isTourSeen = await Preferences.get({ key: 'tour_seen' });
        if (this.isTourSeen.value === null || this.isTourSeen.value === 'false') {
            setTimeout(() => {
                this.toast.add({ severity: 'info', summary: 'Info', detail: 'Seleziona il tipo di impianto che vuoi visualizzare sulla mappa.' });
            }, 500);
            this.isFilterVisible = true;
            await Preferences.set({ key: 'tour_seen', value: 'true' });
        }
        this.rigTypeStore.setType((await Preferences.get({ key: 'rig_type_preference' })).value === 'null' ? null : (await Preferences.get({ key: 'rig_type_preference' })).value);
        this.rigType = this.rigTypeStore.getType();
    },
    methods: {
        startTour() {
            this.driverObj.highlight({
                element: '#rigTypeFilter',
                popover: {
                    title: 'Filtra per tipo di impianto',
                    description: 'Seleziona il tipo di impianto che vuoi visualizzare sulla mappa.',
                    position: 'top',
                }
            })
        },  
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
        async rigType(newVal){
            this.toast.removeAllGroups();
            this.rigTypeStore.setType(newVal);
            this.$emit('updatedVisibility', false);
            this.isFilterVisible = false;
            if(this.rigTypeStore.getType() == null){
                this.toast.add({ severity: 'info', summary: 'Info', detail: 'Filtro rimosso', life: 1000 });
            }else{
            this.toast.add({ severity: 'info', summary: 'Info', detail: 'Filtro '+ this.rigTypeStore.getType() +' impostato', life: 1000 });
            }
            await Preferences.set({ key: 'rig_type_preference', value: newVal });
            console.log(this.rigType)
        }

    },
    emits: ["updatedVisibility"]
}
</script>