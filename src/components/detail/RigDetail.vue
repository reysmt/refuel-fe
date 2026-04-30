<template>
  <Drawer v-model:visible="isSidebarVisible" header="Dettagli" position="bottom"
      style="height: auto; max-height: 100%;">

    <div>
      <FieldsetPv :legend="rig.flag" style="margin-bottom: .5rem;">
        <span style="font-weight: var(--p-fieldset-legend-font-weight);">Gestore:</span> <br>
        {{ rig.manager }}
        <Divider unstyled style="margin-top: .8rem; margin-bottom: .8rem;" />
        <span style="font-weight: var(--p-fieldset-legend-font-weight);">Indirizzo:</span><br>
        <div>{{ rig.address }}, {{ rig.municipality }}</div>
      </FieldsetPv>

      <ImagePv alt="Image" preview class="street-view-section" style="border-radius: var(--p-fieldset-border-radius);"
          zoomInDisabled zoomOutDisabled>
        <template #image>
          <StreetViewStaticImage :longitude="rig.longitude" :latitude="rig.latitude" :gKey="gmapKey" />
        </template>
        <template #original="slotProps">
          <StreetView :longitude="rig.longitude" :latitude="rig.latitude" :gmapKey="gmapKey"
              @click="(slotProps as any).onClick" />
        </template>
      </ImagePv>

      <DataTable :value="rigPrices" sortField="price" :sortOrder="1" showGridlines stripedRows scrollable
          scrollHeight="300px" tableStyle="min-width: auto" style="margin-top: .5rem;">
        <Column field="rigFuelType.rigFuelTypeDescription" header="Tipo" sortable>
          <template #body="{ data }">
            <span>{{ data.rigFuelType.rigFuelTypeDescription }}</span><br>
            <span class="font-small p-text-secondary" style="font-size: .46rem; white-space: nowrap;">
              Aggiornato {{ timeAgo(data.date) }}
            </span>
          </template>
        </Column>

        <Column field="price" header="Prezzo" :sortable="true">
          <template #body="{ data }">
            <span>{{ data.price.toFixed(2) }} €{{ priceUnit(data) }}</span>
          </template>
        </Column>

        <Column field="self" header="Servito" sortable>
          <template #body="{ data }">
            <span>{{ data.self ? 'No' : 'Si' }}</span>
          </template>
        </Column>
      </DataTable>

      <Divider unstyled style="margin-top: 1rem; margin-bottom: 1rem;" />
      <div class="">
        <ButtonPv type="button" label="Vai" @click="openMaps" style="margin-right: 10px;" />
        <ButtonPv type="button" label="Chiudi" severity="secondary" @click="closeSidebar"
            style="margin-right: 10px;" />
      </div>
    </div>
  </Drawer>

  <RigPriceHistory :isVisible="isPriceHistoryVisible" :rig="rig" :token="token"
      @updatedVisibility="updatedVisibilityPriceHistory" />
</template>

<script setup lang="ts">
import { defineAsyncComponent, ref, watch } from 'vue';
import ImagePv from 'primevue/image';
import FieldsetPv from 'primevue/fieldset';
import Divider from 'primevue/divider';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import ButtonPv from 'primevue/button';
import Drawer from 'primevue/drawer';
import RigPriceHistory from '@/components/detail/RigPriceHistory.vue';
import type { RigPrice, RigItem } from '@/interfaces/rig';

const props = defineProps<{
  isVisible: boolean;
  rig: RigItem;
  rigPrices: RigPrice[];
  gmapKey: string;
  token?: string;
}>();

const emit = defineEmits<{
  (event: 'updatedVisibility', value: boolean): void;
}>();

const isSidebarVisible = ref(props.isVisible);
const isPriceHistoryVisible = ref(false);

const StreetViewStaticImage = defineAsyncComponent(() => import('./StreetViewStaticImage.vue'));
const StreetView = defineAsyncComponent(() => import('./StreetView.vue'));

watch(
  () => props.isVisible,
  (newVal) => {
    isSidebarVisible.value = newVal;
  },
);

watch(isSidebarVisible, (newVal) => {
  emit('updatedVisibility', newVal);
});

function timeAgo(dateValue: string | number | Date | undefined): string {
  const date = dateValue ? new Date(dateValue) : new Date();
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);

  const intervals = [
    { limit: 31536000, label: 'anno', plural: 'anni' },
    { limit: 2628000, label: 'mese', plural: 'mesi' },
    { limit: 86400, label: 'giorno', plural: 'giorni' },
    { limit: 3600, label: 'ora', plural: 'ore' },
    { limit: 60, label: 'minuto', plural: 'minuti' },
  ];

  for (const interval of intervals) {
    const count = Math.floor(seconds / interval.limit);
    if (count > 1) {
      return `${count} ${interval.plural} fa`;
    }
    if (count === 1) {
      return `${count} ${interval.label} fa`;
    }
  }

  return 'qualche minuto fa';
}

function priceUnit(price: RigPrice): string {
  return price.rigFuelType.rigFuelTypeDescription.toLowerCase() === 'metano' ? '/Kg' : '/Lt';
}

function openMaps(): void {
  const latitude = props.rig.latitude ?? 0;
  const longitude = props.rig.longitude ?? 0;
  window.open(`https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`);
}

function updatedVisibilityPriceHistory(newVal: boolean): void {
  isPriceHistoryVisible.value = newVal;
}

function closeSidebar(): void {
  isSidebarVisible.value = false;
}
</script>
