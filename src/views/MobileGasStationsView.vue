<template>
    <!-- on mobile -->
    <div class ="mobile-ver">
            <MapView v-if="rigs != null"
            :rigs="rigs"
            :longitude="longitude"
            :latitude="latitude"
            @updateRigs="updatedRigs"></MapView>
    </div>
  </template>
  
  <script setup>
  import MapView from '../components/Map.vue'
  </script>
  
  <script>
  import { getNearbyRigs } from "../services/rigsService";
  export default {
      data(){
      return{
        rigs: null,
        longitude: null,
        latitude: null,
      }
    },
    created(){
      if (!this.isMobile()) {
        this.$router.push('/stations');
      }
    },
    mounted() {
      this.getGeoFromBrowser();
    },
    methods: {
      getGeoFromBrowser(){
        if(navigator.geolocation){
          navigator.geolocation.getCurrentPosition(this.geoSuccess, this.geoError);
        }
      },
      geoSuccess(position) {
        this.longitude = position.coords.longitude;
        this.latitude = position.coords.latitude;
        
        console.log("GeoLocated: ",this.latitude + " " + this.longitude)
  
        this.showNearbyRigs(this.latitude, this.longitude)
      },
      geoError(){
        status.textContent = "Geolocation is not supported by your browser";
      },
      async showNearbyRigs(latitude, longitude){
          this.rigs = await getNearbyRigs(latitude, longitude, 0.03);
          
      },
      updatedRigs(rigs){
        //remove duplicates also
        this.rigs = this.rigs.concat(rigs.filter((rig) => this.rigs.map(rig => rig.rig.rigId).indexOf(rig.rig.rigId) < 0))
        console.log(this.rigs)
      },
      isMobile() {
        if (screen.width <= 768) {
          return true;
        }
        else {
          return false;
        }
      }
    }
  }
  </script>
  
  <style scoped>
  </style>
  