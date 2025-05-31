<template>
    <Drawer v-model:visible="isSidebarVisible" header="Storico" position="full">
        <div class="card" v-if="!isLoading">
             <Line :data="chartData" :options="chartOptions" style="width: 90%; height: 90%; margin: auto; align-items: center;"/>
        </div>
        <ProgressSpinner class="rig-price-history-spinner" v-if="isLoading"/>
    </Drawer>
</template>
<script>
import Drawer from 'primevue/drawer';
import ProgressSpinner from 'primevue/progressspinner';
import colors from '@/assets/rigTypesColor.js';
import { ref } from 'vue';
import {getRigPriceHistoryByRigId} from '@/services/rigsService';
import { Line } from 'vue-chartjs';
import zoomPlugin from 'chartjs-plugin-zoom';
import 'chartjs-adapter-date-fns';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { TimeScale } from 'chart.js';
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  zoomPlugin,
  TimeScale
)
export default {
    components: {
        Drawer,
        ProgressSpinner,
        Line
    },
    data() {
        return {
            isSidebarVisible: this.visible,
            currRig: null,
            chartData: ref({ labels: [], datasets: [] }),
            chartOptions: ref(),
            datasets : [],
            isLoading: false,
            chartPlugins: {
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
                        mode: 'x',
                    }
                },
                legend: {
                    display: true,
                    position: 'bottom',
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
                    let isSelfLabel = rig.self ? "Self" : "Servito"
                    dataMap.set(key, {
                        label: rig.rigFuelType.rigFuelTypeDescription + " " + isSelfLabel,
                        data: [],
                        fill: false,
                        borderColor: colors.get(rig.rigFuelType.rigFuelTypeDescription.toLowerCase()) || '#000000',
                        borderWidth: 2,
                        radius: 0,
                        tension: 0.4,
                        pointHoverRadius: 10,
                        pointHitRadius: 10
                    })
                    
                }
                dataMap.get(key).data.push(rig.price.toFixed(2));
            });
            this.datasets = Array.from(dataMap.values())
            // console.log(this.datasets)
            // console.log(this.datasetInfo)
            this.chartData = {
                labels: labels,
                datasets: this.datasets
            };
            // console.log(this.chartData)
            this.chartOptions = {
                responsive: true,
                maintainAspectRatio: false,
                plugins: this.chartPlugins,
                scales: {
                    x: {
                        type: 'time',
                        time: {
                            // Luxon format string
                            parser: 'yyyy-MM-dd',
                            tooltipFormat: 'dd/MM/yyyy',
                            unit: 'month',
                        },
                        title: {
                            display: true,
                            text: ''
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Prezzo (€)'
                        }
                    }
                },
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
            this.isLoading = true;
            this.isSidebarVisible = newVal;
            if(newVal){
                // console.log(this.token)
                this.resetChart();
                this.currRig = await getRigPriceHistoryByRigId(this.rig.rigId, this.token);
                this.processData();
                this.isLoading = false;
                // console.log(this.currRig)
            }
            
        },
        rig(newVal) {
            // console.log(newVal)
        },
        isSidebarVisible(newVal) {
            // console.log(newVal);
            this.$emit('updatedVisibility', newVal);
            this.isSidebarVisible = newVal;
        }
    }
}
</script>