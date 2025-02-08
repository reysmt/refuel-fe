<template>
    <Sidebar v-model:visible="isSidebarVisible" header="Storico" position="full">
        <div class="card">
            <Chart type="line" :data="chartData" :options="chartOptions" :height="500"/>
        </div>
    </Sidebar>
</template>
<script setup>
import Sidebar from 'primevue/sidebar';
import Chart from 'primevue/chart';
</script>
<script>
import { ref } from 'vue';
import {getRigPriceHistoryByRigId} from '@/services/rigsService';
export default {
    data() {
        return {
            isSidebarVisible: this.visible,
            currRig: null,
            chartData: ref({ labels: [], datasets: [] }),
            chartOptions: ref(),
            datasets : []
        }
    },
    mounted() {

    },
    methods:{
        processData(){
            let labels = [];
            let rigTypes = [];
            this.currRig.forEach((rig) => {
                if(labels.indexOf(rig.comuDate) === -1){
                    labels.push(rig.comuDate);
                }
                if(rigTypes.indexOf(rig.rigFuelType.rigFuelTypeDescription) === -1){
                    rigTypes.push(rig.rigFuelType.rigFuelTypeDescription);
                    let dataset = {
                        label: rig.rigFuelType.rigFuelTypeDescription,
                        data: [],
                        fill: false,
                        borderColor: '#4bc0c0',
                        tension: 0.4
                    }
                    this.datasets.push(dataset);
                }
            });
            this.datasets.forEach((dataset) => {
                dataset.data = this.currRig.filter((rig) => rig.rigFuelType.rigFuelTypeDescription === dataset.label).map((rig) => rig.price);
            });
            console.log(rigTypes)
            this.chartData = {
                labels: labels,
                datasets: this.datasets
            };
            console.log(this.chartData)
            this.chartOptions = {
                responsive: true,
                maintainAspectRatio: false
            };
        }
    },
    props: ['isVisible', 'rig', 'token'],	
    emits: ['updatedVisibility'],
    watch: {
        async isVisible(newVal) {
            this.isSidebarVisible = newVal;
            if(newVal){
                // console.log(this.token)
                this.chartData = ref({ labels: [], datasets: [] });
                this.chartOptions = ref();
                this.datasets = [];
                this.currRig= null;
                this.currRig = await getRigPriceHistoryByRigId(this.rig.rigId, this.token);
                this.processData();
                // console.log(this.currRig)
            }
            
        },
        rig(newVal) {
            console.log(newVal)
        },
        isSidebarVisible(newVal) {
            // console.log(newVal);
            this.$emit('updatedVisibility', newVal);
            this.isSidebarVisible = newVal;
        }
    }
}
</script>