<template>
    <Sidebar v-model:visible="isSidebarVisible" header="Storico" position="full">
        <div class="card">
            <!-- <Chart type="line" :data="chartData" :options="chartOptions" :height="500"/> -->
             <Line :data="chartData" :options="chartOptions" style=""/>
        </div>
    </Sidebar>
</template>
<script setup>
import Sidebar from 'primevue/sidebar';
</script>
<script>
import { ref } from 'vue';
import {getRigPriceHistoryByRigId} from '@/services/rigsService';
import { Line } from 'vue-chartjs';
import zoomPlugin from 'chartjs-plugin-zoom';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  zoomPlugin
)
export default {
    data() {
        return {
            isSidebarVisible: this.visible,
            currRig: null,
            chartData: ref({ labels: [], datasets: [] }),
            chartOptions: ref(),
            datasets : [],
            zoomOptions: {
                zoom: {
                    pan:{
                            enabled: true
                    },
                    zoom: {
                        wheel: {
                            enabled: true,
                        },
                        pinch: {
                            enabled: true
                        },
                        mode: 'xy',
                    }
                },
            }
        }
    },
    mounted() {

    },
    methods:{
        processData(){
            let labels = []
            const dataMap = new Map();
            this.currRig.forEach((rig) => {
                if(labels.indexOf(rig.comuDate) === -1){
                    labels.push(rig.comuDate);
                }
                const key = `${rig.rigFuelType.rigFuelTypeDescription}-${rig.self}`;
                if(!dataMap.has(key)){
                    let isSelfLabel = rig.self ? "non servito" : "servito"
                    dataMap.set(key, {
                        label: rig.rigFuelType.rigFuelTypeDescription + " " + isSelfLabel,
                        data: [],
                        fill: false,
                        borderColor: '#4bc0c0',
                        tension: 0.4
                    });
                    
                }
                dataMap.get(key).data.push(rig.price.toFixed(2));
            });
            this.datasets = Array.from(dataMap.values())
            console.log(this.datasets)
            // console.log(this.datasetInfo)
            this.chartData = {
                labels: labels,
                datasets: this.datasets
            };
            // console.log(this.chartData)
            this.chartOptions = {
                responsive: true,
                maintainAspectRatio: false,
                plugins: this.zoomOptions
            }
        },
        resetChart(){
            this.chartData = ref({ labels: [], datasets: [] });
            this.chartOptions = ref();
            this.currRig = null;
            this.datasets = [];
        }
    },
    props: ['isVisible', 'rig', 'token'],	
    emits: ['updatedVisibility'],
    watch: {
        async isVisible(newVal) {
            this.isSidebarVisible = newVal;
            if(newVal){
                // console.log(this.token)
                this.resetChart();
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