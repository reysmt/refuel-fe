<template>
    <Sidebar v-model:visible="isSidebarVisible" header="Dettagli" position="bottom"
        style="height: auto; max-height: 100%;">

        <!-- <StreetView :longitude="rig.longitude" :latitude="rig.latitude" @click="slotProps.onClick" /> -->
        <div>
            <Fieldset :legend="rig.flag" style="padding-top: 0; padding-bottom: 0rem; margin-bottom: .5rem;">
                <span class="font-small p-text-secondary">Gestore:</span> <br>
                {{ rig.manager }}
                <Divider style="margin-top: .8rem; margin-bottom: .8rem;" />
                <span class="font-small p-text-secondary">Indirizzo:</span><br>
                <div>{{ rig.address }}, {{ rig.municipality }}</div>
            </Fieldset>
            <Image alt="Image" preview class="street-view-section">
                <template #image>
                    <StreetViewStaticImage :longitude="rig.longitude" :latitude="rig.latitude" :gKey="gmapKey">
                    </StreetViewStaticImage>
                    <!-- <i class="bi bi-eye-fill custom-eye" style="font-size: 3rem;"></i> -->
                    <!-- <i class="bi bi-map" style="font-size: 4rem;"></i> -->
                </template>
                <template #preview="slotProps">
                    <StreetView :longitude="rig.longitude" :latitude="rig.latitude" :gmapKey="gmapKey"
                        @click="slotProps.onClick" />
                </template>
            </Image>
            <!-- <Divider style="margin-top: .8rem; margin-bottom: .8rem;" /> -->
            <DataTable :value="rigPrices" sortField="price" :sortOrder="1" showGridlines stripedRows scrollable
                scrollHeight="300px" tableStyle="min-width: auto" style="margin-top: .5rem;">
                <Column field="rigFuelType.rigFuelTypeDescription" header="Tipo" sortable>
                    <template #body="{data}">
                        <span>{{ data.rigFuelType.rigFuelTypeDescription }}</span><br>
                        <span class="font-small p-text-secondary"
                            style="font-size: .46rem; white-space: nowrap;">Aggiornato {{ timeAgo(new
                            Date(data.date)) }}</span>
                    </template>
                </Column>
                <Column field="price" header="Prezzo" :sortable="true">
                    <template #body="{data}">
                        <span>{{ data.price.toFixed(2) }} €{{ data.rigFuelType.rigFuelTypeDescription.toLowerCase() ==
                            "metano" ? '/Kg' :
                            '/Lt' }}</span>
                    </template>
                </Column>
                <Column field="self" header="Servito" sortable>
                    <template #body="{data}">
                        <span>{{ data.self ? 'No' : 'Si' }}</span>
                    </template>
                </Column>
            </DataTable>
            <Divider style="margin-top: .8rem; margin-bottom: .8rem;" />
            <div class="">
                <Button type="button" label="Vai" @click="openMaps()" style="margin-right: 10px;"></Button>
                <!-- <Button type="button" severity="info" label="Storico" style="margin-right: 10px;"></Button> -->
                <Button type="button" label="Chiudi" severity="secondary" @click="isSidebarVisible = false"
                    style="margin-right: 10px;"></Button>
            </div>
        </div>
    </Sidebar>
</template>
<script setup>
import Image from 'primevue/image';
import Fieldset from 'primevue/fieldset';
import Divider from 'primevue/divider';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import Sidebar from 'primevue/sidebar';
import { defineAsyncComponent, ref} from 'vue';
</script>
<script>
export default {
    components: {
        StreetViewStaticImage: defineAsyncComponent(() => import('./StreetViewStaticImage.vue')),
        StreetView : defineAsyncComponent(() => import('./StreetView.vue'))
    },
    mounted() {
        //console.log(this.rig)
        // this.key = this.gmapKey;
    },
    data() {
        return {
            isSidebarVisible : this.isVisible,
            // key: null
        }
    },
    props: ['isVisible','rig', 'rigPrices','gmapKey'],
    methods: {
        timeAgo(date) {
        const seconds = Math.floor((new Date() - date) / 1000);

        const interval = Math.floor(seconds / 31536000);

        if (interval > 1) {
            return interval + " anni fa";
        }
        if (interval === 1) {
            return interval + " anno fa";
        }

        const months = Math.floor(seconds / 2628000);
        if (months > 1) {
            return months + " mesi fa";
        }
        if (months === 1) {
            return months + " mese fa";
        }

        const days = Math.floor(seconds / 86400);
        if (days > 1) {
            return days + " giorni fa";
        }
        if (days === 1) {
            return days + " giorno fa";
        }

        const hours = Math.floor(seconds / 3600);
        if (hours > 1) {
             return hours + " ore fa";
        }
        if (hours === 1) {
            return hours + " ora fa";
        }

        const minutes = Math.floor(seconds / 60);
        if (minutes > 1) {
            return minutes + " minuti fa";
        }
        if (minutes === 1) {
            return minutes + " minuto fa";
        }

        return "qualche minuto fa";
    },
    openMaps() {
        window.open(`https://www.google.com/maps/search/?api=1&query=${this.rig.latitude},${this.rig.longitude}`);  
    },
},
    emits: ['updatedVisibility'],
    watch: {
        isSidebarVisible(newVal){
            // console.log("local: ",newVal)
            this.$emit('updatedVisibility', newVal);
            // console.log(this.rig)
            // console.log(this.rigPrices)
        },
        isVisible(newVal){
            // console.log("prop: ",newVal)
            this.isSidebarVisible = newVal
        }
    },
    created() {
    // this.isSidebarVisible = this.isVisible;
    }
}
</script>
