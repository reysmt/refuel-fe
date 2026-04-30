<template>
    <div class="list-group border overflow-auto gap-2" id="stationsList">
      <GasStationsListRow
      v-for="rig in rigs"
      :rig="rig"
      :key="rig.id"></GasStationsListRow>
    </div>
  </template>
  
  <script setup>  
    import GasStationsListRow from './GastStationsListRow.vue';
  </script>
  
  <script>

  export default {
      props: ['rigs'],
      data(){
        return {
          
        }
      },
      methods:{
      }
  }
  </script>
  
  <style scoped>

  </style>
  