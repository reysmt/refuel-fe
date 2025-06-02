<template>
  <div class="navigation-card">
    <a href="#" class="tab" v-for="item in items" v-bind:key="item.label">
      <i :class="item.class" style="font-size: 1rem; padding: 10px;" @click="itemClick($event, item)"></i>
    </a>
  </div>

  <!-- <NavbarMapList :isVisible="displayList" :gmapKey="gmapKey" @updatedVisibility="updatedVisibility"
    class="navbarmap-list"></NavbarMapList> -->
  <NavbarMapFilter id="RigTypeFilter" :isVisible="displayFilter" @updatedVisibility="updatedVisibilityFilter"></NavbarMapFilter>
  <NavbarMapInfo :isVisible="displayInfo" @updatedVisibility="updatedVisibilityInfo"></NavbarMapInfo>
</template>
<script setup>
</script>
<script>
// import Dock from 'primevue/dock';
import { ref } from 'vue';
// import NavbarMapList from './NavbarMapList.vue';
import NavbarMapFilter from './NavbarMapFilter.vue';
import NavbarMapInfo from './NavbarMapInfo.vue';
import { useMapStore } from '@/stores/googleMap';
import "driver.js/dist/driver.css";
export default {
  components: {
    // Dock,
    // NavbarMapList,
    NavbarMapFilter,
    NavbarMapInfo
  },
  data(){
    return{
      displayList: false,
      displayHome: false,
      displayFilter: false,
      displayInfo: false,
      mapStore: useMapStore(),
      items: null,
    }
  },
  props: ['gmapKey','longitude','latitude'],
  async mounted(){
    this.items = ref([
        {
          label: 'Home',
          class: 'pi pi-home',
          command: () => {
            this.displayHome = true;
            this.displayFilter = false;
            this.displayInfo = false;
            this.mapStore.getMap().getView().animate({
              center: [this.longitude, this.latitude],
              duration: 1000
            });
          }
        },
        {
          label: "Filter",
          class: "pi pi-filter",
          command: () => {
            this.displayFilter = !this.displayFilter;
          }
        },
        {
          label: "Info",
          class: "pi pi-info-circle",
          command: () => {
            this.displayInfo = !this.displayInfo;
          }
        }
    ])
  },
  methods: {
    itemClick(event, item){
      if (item.command) {
        item.command();
    }

      event.preventDefault();
    },
    updatedVisibilityFilter(newVal){
      this.displayFilter = newVal
      // console.log(newVal)
    },
    updatedVisibilityInfo(newVal){
      this.displayInfo = newVal
      // console.log(newVal)
    }
  }
}
</script>