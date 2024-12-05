<template>
  <Dock :model="items" class="p-dock-list-container-custom p-dock-list-custom">
    <template #icon="{ item }">
      <i :class="item.class" style="margin: 30px;  color: grey" @click="onDockItemClick($event, item)"></i>
    </template>
  </Dock>

  <NavbarMapList :isVisible="displayList" :gmapKey="gmapKey" @updatedVisibility="updatedVisibility" class="navbarmap-list"></NavbarMapList>
  <NavbarMapFilter :isVisible="displayFilter" ></NavbarMapFilter>
</template>
<script setup>
import Dock from 'primevue/dock';
import { ref } from 'vue';
import NavbarMapList from './NavbarMapList.vue';
import NavbarMapFilter from './NavbarMapFilter.vue';
</script>
<script>
export default {
  data(){
    return{
      displayList: ref(false),
      displayHome: ref(false),
      displayFilter: ref(false),
      items: null
    }
  },
  props: ['gmapKey'],
  mounted(){
    // console.log(this.displayList)
    this.items = ref([
        {
          label: 'List',
          class: 'pi pi-bars',
          command: () => {
            this.displayList = !this.displayList;
          }
        },
        {
          label: 'Home',
          class: 'pi pi-home',
          command: () => {
            this.displayHome = true;
          }
        },
        {
          label: "Filter",
          class: "pi pi-filter",
          command: () => {
            this.displayFilter = !this.displayFilter;
          }
        }
    ])
  },
  methods: {
    onDockItemClick(event, item){
      if (item.command) {
        item.command();
    }

      event.preventDefault();
    },
    updatedVisibility(newVal){
      this.displayList = newVal
    }
  }
}
</script>