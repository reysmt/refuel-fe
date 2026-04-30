<template>
  <Dialog v-model:visible="isFilterVisible" header="Filtra" style="width: 25rem;" position="right" :modal="false" :draggable="false">
    <div id="rigTypeFilter" v-if="availableRigTypes.length > 0">
      <Listbox v-model="rigType" :options="availableRigTypes" listStyle="max-height:350px" />
    </div>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import Dialog from 'primevue/dialog'
import Listbox from 'primevue/listbox'
import { useToast } from 'primevue/usetoast'
import { Preferences } from '@capacitor/preferences'
import { driver } from 'driver.js'
import { useAllRigsTypeStore, useRigsTypeStore } from '@/stores/rigs'

const props = defineProps<{ isVisible: boolean }>()
const emit = defineEmits<{
  (event: 'updatedVisibility', value: boolean): void
}>()

const allRigsTypeStore = useAllRigsTypeStore()
const rigTypeStore = useRigsTypeStore()
const toast = useToast()
const driverObj = driver()

const isFilterVisible = ref(props.isVisible)
const rigType = ref<string | null>(rigTypeStore.getType())

const availableRigTypes = computed(() => allRigsTypeStore.getAllRigsType())

watch(
  () => props.isVisible,
  (newVal) => {
    isFilterVisible.value = newVal
  }
)

watch(isFilterVisible, (newVal) => {
  emit('updatedVisibility', newVal)
})

watch(rigType, async (newVal) => {
  let rigTypeName = newVal
  toast.removeAllGroups()
  rigTypeStore.setType(rigTypeName)
  isFilterVisible.value = false
  emit('updatedVisibility', false)

  if (rigTypeStore.getType() == null) {
    toast.add({ severity: 'info', summary: 'Info', detail: 'Filtro rimosso', life: 1000 })
  } else {
    toast.add({ severity: 'info', summary: 'Info', detail: `Filtro ${rigTypeStore.getType()} impostato`, life: 2000 })
  }

  await Preferences.set({ key: 'rig_type_preference', value: rigTypeName ?? 'null' })
//   console.log(rigType.value)
})

onMounted(async () => {
  const tourSeen = await Preferences.get({ key: 'tour_seen' })
  const rigTypePreference = await Preferences.get({ key: 'rig_type_preference' })

  if (tourSeen.value === null || tourSeen.value === 'false') {
    setTimeout(() => {
      toast.add({ severity: 'info', summary: 'Info', detail: 'Seleziona il tipo di impianto che vuoi visualizzare sulla mappa.' })
    }, 500)

    isFilterVisible.value = true
    await Preferences.set({ key: 'tour_seen', value: 'true' })
  }

  if (rigTypePreference.value !== null && rigTypePreference.value !== 'null') {
    setTimeout(() => {
      rigTypeStore.setType(rigTypePreference.value)
      rigType.value = rigTypeStore.getType()
    }, 500)
  }
})
</script>