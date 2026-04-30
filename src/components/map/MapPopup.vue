<template>
  <div ref="popup" id="popup" class="ol-popup">
    <a href="#" id="popup-closer" class="ol-popup-closer" ref="popup-closer" @click="closePopup"></a>
    <DataTable
      v-model:selection="selectedRig"
      :value="processedRigs"
      selectionMode="single"
      :rows="4"
      scrollable
      scrollHeight="400px"
      @rowSelect="onRigSelect"
    >
      <Column field="rig.flag" header="Insegna" sortable style="min-width: 1rem; font-size: .8rem;" />
      <Column field="rig.municipality" header="Comune" sortable style="min-width: 1rem; font-size: .8rem;" />
      <Column
        field="priceToShow"
        header="Prezzo"
        sortable
        style="min-width: 1rem; font-size: .8rem; white-space: nowrap; padding-right: .5rem;"
      />
      <Column field="" header="" style="padding: .1px;">
        <template #body>
          <i class="pi pi-info-circle" />
        </template>
      </Column>
    </DataTable>
  </div>

  <RigDetail
    v-if="selectedRig != null"
    :isVisible="detailsVisible"
    :rig="selectedRig.rig"
    :rigPrices="selectedRig.rigPrices"
    @updatedVisibility="updatedVisibility"
    :gmapKey="gmapKey"
    :token="token"
  />
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import RigDetail from '@/components/detail/RigDetail.vue'
import { useRigsTypeStore } from '@/stores/rigs'
import { useMapStore } from '@/stores/googleMap'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import type { RigPrice, RigWrapper } from '@/interfaces/rig'
import 'ol/ol.css'

interface Props {
  popupContent: RigWrapper[] | null
  gmapKey: string
  token: string
}

const props = defineProps<Props>()

const rigsTypeStore = useRigsTypeStore()
const mapStore = useMapStore()
const detailsVisible = ref(false)
const selectedRig = ref<RigWrapper | null>(null)

const processedRigs = computed(() => {
  if (!props.popupContent) {
    return []
  }

  return props.popupContent.map((rigWrapper) => ({
    ...rigWrapper,
    rigPrices: rigWrapper.rigPrices,
    priceToShow: showDesiredPrice(rigWrapper),
  }))
})

const closePopup = (): void => {
  const map = mapStore.getMap();
  if (map) {
    const overlays = map
      .getOverlays()
      .getArray()
      .filter((overlay: any) => overlay.get('isPopup') === 'true')

    for (const overlay of overlays) {
      map.removeOverlay(overlay)
    }
  }

}

const onRigSelect = (): void => {
  detailsVisible.value = true
}

const updatedVisibility = (newVal: boolean): void => {
  detailsVisible.value = newVal
}

const showDesiredPrice = (slotProps: RigWrapper): string | undefined => {
  let price: string | undefined

  const selectedType = rigsTypeStore.getType()
  if (selectedType != null) {
    const filtered = filterPrice(slotProps.rigPrices, selectedType)
    if (Array.isArray(filtered) && filtered.length > 0) {
      price = `${filtered[0].price.toFixed(2)} ${selectedType.toLowerCase() === 'metano' ? '€/Kg' : '€/Lt'}`
    }
  } else if (slotProps.rigPrices && slotProps.rigPrices.length > 0) {
    price = `${slotProps.rigPrices[0].price.toFixed(2)} €/Lt`
  }

  return price
}

const filterPrice = (rigPrices: RigPrice[], rigType: string): RigPrice[] => {
  return rigPrices.filter(
    (price) => price.rigFuelType.rigFuelTypeDescription.toLowerCase() === rigType.toLowerCase(),
  )
}

const getPriceValue = (prices: RigPrice[] | undefined): number => {
  if (!prices || prices.length === 0) {
    return Number.MAX_VALUE
  }

  return Math.min(...prices.map((p) => p.price))
}
</script>

<style scoped></style>
