<template>
  <div class="navigation-card">
    <a href="#" class="tab" v-for="item in items" :key="item.label">
      <i :class="item.class" style="font-size: 1rem; padding: 10px;" @click="itemClick($event, item)"></i>
    </a>
  </div>

  <!-- <NavbarMapList :isVisible="displayList" :gmapKey="gmapKey" @updatedVisibility="updatedVisibility"
    class="navbarmap-list"></NavbarMapList> -->
  <NavbarMapFilter id="RigTypeFilter" :isVisible="displayFilter" @updatedVisibility="updatedVisibilityFilter" />
  <NavbarMapInfo :isVisible="displayInfo" @updatedVisibility="updatedVisibilityInfo" />
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import NavbarMapFilter from '@/components/navbar/NavbarMapFilter.vue'
import NavbarMapInfo from '@/components/navbar/NavbarMapInfo.vue'
import { useMapStore } from '@/stores/googleMap'
import 'driver.js/dist/driver.css'

interface MapItem {
  label: string
  class: string
  command?: () => void
}

const props = defineProps<{
  gmapKey?: string
  longitude: number
  latitude: number
}>()

const mapStore = useMapStore()
const displayList = ref(false)
const displayHome = ref(false)
const displayFilter = ref(false)
const displayInfo = ref(false)
const items = ref<MapItem[]>([
  {
    label: 'Home',
    class: 'pi pi-home',
    command: () => {
      displayHome.value = true
      displayFilter.value = false
      displayInfo.value = false
      mapStore.getMap().getView().animate({
        center: [props.longitude, props.latitude],
        duration: 1000,
      })
    },
  },
  {
    label: 'Filter',
    class: 'pi pi-filter',
    command: () => {
      displayFilter.value = !displayFilter.value
    },
  },
  {
    label: 'Info',
    class: 'pi pi-info-circle',
    command: () => {
      displayInfo.value = !displayInfo.value
    },
  },
])

function itemClick(event: MouseEvent, item: MapItem) {
  item.command?.()
  event.preventDefault()
}

function updatedVisibilityFilter(newVal: boolean) {
  displayFilter.value = newVal
}

function updatedVisibilityInfo(newVal: boolean) {
  displayInfo.value = newVal
}
</script>
