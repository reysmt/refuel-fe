<template>
    <Sidebar v-model:visible="isListVisible" header="Stazioni" position="full">
        <div v-if="rigsStore.getLength() > 0">
            <DataTable :value="rigsStore.getRigs()" tableStyle="" style="min-width: auto; max-width: 100%;" stripedRows >
                <Column field="rig.flag" header="Bandiera" style="padding: .5rem; text-align: center;"></Column>
                <Column field="rig.province" header="Località" style="padding: .5rem; text-align: center;"></Column>
                <Column field="" header="">
                    <template #body="{data}">
                        <Button type="button" label="Dettagli" @click="viewRigDetail(data)"></Button>
                        
                    </template>
                </Column>
            </DataTable>

            <!-- <RigDetail v-if="genericRig!=null && isRigDetailVisible" :isVisible="isRigDetailVisible" :rig="genericRig.rig" :rigPrices="genericRig.rigPrices" @updatedVisibility="updatedVisibility" :gmapKey="gmapKey"></RigDetail> -->

            <!-- <DataView :value="rigsStore.getRigs()">
                <template #list="slotProps">
                    <div v-for="(item, index) in slotProps.items" :key="index" class="col-12">
                        {{ item.rig.flag }}
                    </div>
                </template>
            </DataView> -->

        </div>
    </Sidebar>
</template>

<script setup>
// import DataView from 'primevue/dataview';
import Sidebar from 'primevue/sidebar';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import { useRigsStore } from '@/stores/rigs';
import Button from 'primevue/button';
import RigDetail from './RigDetail.vue';
</script>

<script>
export default {
    props: ["isVisible", "gmapKey"],
    mounted(){
    },
    methods : {
        updatedVisibility(newVal){
            this.isRigDetailVisible = newVal;
        },
        viewRigDetail(val){
            this.genericRig=val;
            // console.log(this.genericRig)
            this.isRigDetailVisible=true;
            this.key=this.key++;
            // console.log(this.gmapKey)
        }
    },
    data(){
        return{
            rigsStore : useRigsStore(),
            isListVisible : this.isVisible,
            isRigDetailVisible : false,
            genericRig : null,
            key : null
        }
    },
    watch: {
        isListVisibile(newVal){
            this.$emit('updatedVisibility', newVal)
            console.log(newVal)
        },
        isVisible(newVal){
            this.isListVisible = newVal;
        }
    },
    emits: ["updatedVisibility"]
}
</script>